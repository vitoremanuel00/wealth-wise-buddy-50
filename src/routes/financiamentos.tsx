import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { brl } from "@/utils/format";
import type { Financing } from "@/types";

export const Route = createFileRoute("/financiamentos")({
  head: () => ({ meta: [{ title: "Financiamentos · ManyMoney" }] }),
  component: FinanciamentosPage,
});

function FinanciamentosPage() {
  const { financings, addFinancing, deleteFinancing } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Financing, "id">>({
    bank: "", financed: 0, outstanding: 0, system: "SAC", rate: 10, months: 360, installment: 0, amortized: 0,
  });

  const [simAmort, setSimAmort] = useState(0);
  const [simTarget, setSimTarget] = useState<string>(financings[0]?.id ?? "");
  const target = financings.find((f) => f.id === simTarget);

  const simulation = useMemo(() => {
    if (!target || !simAmort) return null;
    const newOutstanding = Math.max(0, target.outstanding - simAmort);
    const monthlyRate = target.rate / 100 / 12;
    const newParcela = target.system === "PRICE"
      ? (newOutstanding * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -target.months))
      : newOutstanding / target.months + newOutstanding * monthlyRate;
    const monthsSaved = Math.floor(simAmort / (target.installment || 1));
    return { newOutstanding, newParcela, monthsSaved };
  }, [target, simAmort]);

  return (
    <div>
      <PageHeader
        title="Financiamentos"
        subtitle="SAC e PRICE, com simulador de amortização."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="size-4" /> Novo financiamento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo financiamento</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Banco</Label><Input value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} /></div>
                <div><Label>Valor financiado</Label><Input type="number" value={form.financed} onChange={(e) => setForm({ ...form, financed: +e.target.value, outstanding: +e.target.value })} /></div>
                <div><Label>Saldo devedor</Label><Input type="number" value={form.outstanding} onChange={(e) => setForm({ ...form, outstanding: +e.target.value })} /></div>
                <div><Label>Sistema</Label>
                  <Select value={form.system} onValueChange={(v) => setForm({ ...form, system: v as "SAC" | "PRICE" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="SAC">SAC</SelectItem><SelectItem value="PRICE">PRICE</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Taxa (% a.a.)</Label><Input type="number" step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: +e.target.value })} /></div>
                <div><Label>Prazo (meses)</Label><Input type="number" value={form.months} onChange={(e) => setForm({ ...form, months: +e.target.value })} /></div>
                <div><Label>Parcela atual</Label><Input type="number" value={form.installment} onChange={(e) => setForm({ ...form, installment: +e.target.value })} /></div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => { if (!form.bank) return; addFinancing(form); toast.success("Criado"); setOpen(false); }}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl overflow-hidden">
          {financings.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Nenhum financiamento.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="p-3">Banco</th><th className="p-3">Sistema</th>
                  <th className="p-3 text-right">Saldo</th><th className="p-3 text-right">Parcela</th><th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {financings.map((f) => (
                  <tr key={f.id} className="border-b border-border/60">
                    <td className="p-3">{f.bank}</td>
                    <td className="p-3">{f.system}</td>
                    <td className="p-3 text-right number-tabular">{brl(f.outstanding)}</td>
                    <td className="p-3 text-right number-tabular">{brl(f.installment)}</td>
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => deleteFinancing(f.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Simulador de amortização</h3>
          {financings.length === 0 ? (
            <div className="text-sm text-muted-foreground">Cadastre um financiamento primeiro.</div>
          ) : (
            <div className="grid gap-3">
              <div>
                <Label>Financiamento</Label>
                <Select value={simTarget} onValueChange={setSimTarget}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {financings.map((f) => <SelectItem key={f.id} value={f.id}>{f.bank}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor a amortizar</Label>
                <Input type="number" value={simAmort} onChange={(e) => setSimAmort(+e.target.value)} />
              </div>
              {simulation && (
                <div className="mt-2 rounded-xl bg-muted/40 p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span>Novo saldo devedor</span><b className="number-tabular">{brl(simulation.newOutstanding)}</b></div>
                  <div className="flex justify-between"><span>Nova parcela estimada</span><b className="number-tabular">{brl(simulation.newParcela)}</b></div>
                  <div className="flex justify-between"><span>Parcelas equivalentes</span><b>{simulation.monthsSaved}</b></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
