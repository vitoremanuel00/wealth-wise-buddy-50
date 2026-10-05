import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/services/store";
import { brl, pct } from "@/utils/format";
import type { Investment } from "@/types";

export const Route = createFileRoute("/_authenticated/investimentos")({
  head: () => ({ meta: [{ title: "Investimentos · ManyMoney" }] }),
  component: InvestimentosPage,
});

const categories: Investment["category"][] = ["FII", "ACAO", "TESOURO", "CDB", "LCI", "LCA"];

function InvestimentosPage() {
  const { investments, addInvestment, deleteInvestment } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Investment, "id">>({
    category: "FII",
    ticker: "",
    quantity: 0,
    avgPrice: 0,
    currentPrice: 0,
    dividends: 0,
  });

  const total = investments.reduce((s, i) => s + i.quantity * i.currentPrice, 0);
  const invested = investments.reduce((s, i) => s + i.quantity * i.avgPrice, 0);
  const rent = invested === 0 ? 0 : ((total - invested) / invested) * 100;

  return (
    <div>
      <PageHeader
        title="Investimentos"
        subtitle="FIIs, Ações, Tesouro, CDB, LCI, LCA."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="size-4" /> Novo ativo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo ativo</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Investment["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ticker / Nome</Label>
                  <Input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} />
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
                </div>
                <div>
                  <Label>Preço médio</Label>
                  <Input type="number" step="0.01" value={form.avgPrice} onChange={(e) => setForm({ ...form, avgPrice: +e.target.value })} />
                </div>
                <div>
                  <Label>Cotação atual</Label>
                  <Input type="number" step="0.01" value={form.currentPrice} onChange={(e) => setForm({ ...form, currentPrice: +e.target.value })} />
                </div>
                <div>
                  <Label>Dividendos recebidos</Label>
                  <Input type="number" step="0.01" value={form.dividends} onChange={(e) => setForm({ ...form, dividends: +e.target.value })} />
                </div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    if (!form.ticker) return;
                    addInvestment(form);
                    toast.success("Ativo adicionado");
                    setOpen(false);
                    setForm({ category: "FII", ticker: "", quantity: 0, avgPrice: 0, currentPrice: 0, dividends: 0 });
                  }}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Kpi label="Valor de mercado" value={brl(total)} />
        <Kpi label="Total investido" value={brl(invested)} />
        <Kpi label="Rentabilidade" value={pct(rent)} tone={rent >= 0 ? "success" : "destructive"} />
      </section>

      <div className="glass-card rounded-2xl overflow-hidden">
        {investments.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Nenhum ativo cadastrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="p-3">Categoria</th>
                <th className="p-3">Ticker</th>
                <th className="p-3 text-right">Qtd</th>
                <th className="p-3 text-right">Preço médio</th>
                <th className="p-3 text-right">Cotação</th>
                <th className="p-3 text-right">Posição</th>
                <th className="p-3 text-right">Rent.</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {investments.map((i) => {
                const pos = i.quantity * i.currentPrice;
                const cost = i.quantity * i.avgPrice;
                const r = cost === 0 ? 0 : ((pos - cost) / cost) * 100;
                return (
                  <tr key={i.id} className="border-b border-border/60">
                    <td className="p-3">{i.category}</td>
                    <td className="p-3 font-medium">{i.ticker}</td>
                    <td className="p-3 text-right number-tabular">{i.quantity}</td>
                    <td className="p-3 text-right number-tabular">{brl(i.avgPrice)}</td>
                    <td className="p-3 text-right number-tabular">{brl(i.currentPrice)}</td>
                    <td className="p-3 text-right number-tabular">{brl(pos)}</td>
                    <td className={`p-3 text-right number-tabular ${r >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pct(r)}</td>
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => deleteInvestment(i.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-semibold number-tabular ${tone === "success" ? "text-emerald-400" : tone === "destructive" ? "text-red-400" : ""}`}>{value}</div>
    </div>
  );
}
