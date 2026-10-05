import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, CheckCircle2, TrendingDown, History } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/services/store";
import { brl, dateBR } from "@/utils/format";
import type { Financing } from "@/types";

export const Route = createFileRoute("/_authenticated/financiamentos")({
  head: () => ({ meta: [{ title: "Financiamentos · ManyMoney" }] }),
  component: FinanciamentosPage,
});

function FinanciamentosPage() {
  const { financings, addFinancing, deleteFinancing } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<
    Omit<Financing, "id" | "paidInstallments" | "history">
  >({
    bank: "", financed: 0, outstanding: 0, system: "SAC", rate: 10, months: 360, installment: 0, amortized: 0,
  });

  return (
    <div>
      <PageHeader
        title="Financiamentos"
        subtitle="SAC e PRICE, com pagamento de parcela, amortização e histórico."
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
                <div className="col-span-2"><Label>Parcela atual estimada</Label><Input type="number" value={form.installment} onChange={(e) => setForm({ ...form, installment: +e.target.value })} /></div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    if (!form.bank) return;
                    addFinancing(form);
                    toast.success("Criado");
                    setOpen(false);
                  }}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {financings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-sm text-muted-foreground">
          Nenhum financiamento. Clique em <b>Novo financiamento</b>.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {financings.map((f) => (
            <FinancingCard
              key={f.id}
              financing={f}
              onDelete={() => { deleteFinancing(f.id); toast.success("Removido"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FinancingCard({
  financing: f,
  onDelete,
}: {
  financing: Financing;
  onDelete: () => void;
}) {
  const pctPaid = f.months > 0 ? (f.paidInstallments / f.months) * 100 : 0;
  const pctAmort = f.financed > 0 ? Math.min(100, ((f.financed - f.outstanding) / f.financed) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {f.system} · {f.rate}% a.a.
              </div>
              <div className="text-lg font-semibold mt-0.5">{f.bank}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Saldo devedor" value={brl(f.outstanding)} />
            <Metric label="Financiado" value={brl(f.financed)} />
            <Metric label="Parcela atual" value={brl(f.installment)} />
            <Metric
              label="Parcelas pagas"
              value={`${f.paidInstallments} / ${f.months}`}
            />
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso de parcelas</span><span>{pctPaid.toFixed(1)}%</span>
            </div>
            <Progress value={pctPaid} className="mt-1.5" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Amortização acumulada</span><span>{pctAmort.toFixed(1)}%</span>
            </div>
            <Progress value={pctAmort} className="mt-1.5" />
          </div>

          <div className="mt-5 flex gap-2 flex-wrap">
            <PayInstallmentDialog financing={f} />
            <AmortizeDialog financing={f} />
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <History className="size-4" /> Histórico
          </h3>
          {f.history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Nenhum evento ainda. Registre um pagamento ou amortização.
            </p>
          ) : (
            <ul className="divide-y divide-border/60 text-sm">
              {f.history.slice(0, 10).map((h) => (
                <li key={h.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="capitalize">
                      {h.type === "payment" ? "Pagamento de parcela" : "Amortização extra"}
                    </div>
                    <div className="text-xs text-muted-foreground">{dateBR(h.date)}</div>
                  </div>
                  <div className="number-tabular font-medium">{brl(h.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold number-tabular">{value}</div>
    </div>
  );
}

function PayInstallmentDialog({ financing: f }: { financing: Financing }) {
  const { accounts, payFinancingInstallment } = useStore();
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const done = f.paidInstallments >= f.months || f.outstanding <= 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={done}>
          <CheckCircle2 className="size-4" /> Pagar parcela
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Pagar parcela — {f.bank}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Conta de débito</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="col-span-2 rounded-lg bg-muted/40 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Parcela estimada</span><b className="number-tabular">{brl(f.installment)}</b></div>
            <div className="flex justify-between"><span>Nº da parcela</span><b>{f.paidInstallments + 1} / {f.months}</b></div>
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!accountId) return;
              payFinancingInstallment({ financingId: f.id, accountId, date });
              toast.success("Parcela paga");
              setOpen(false);
            }}>Confirmar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AmortizeDialog({ financing: f }: { financing: Financing }) {
  const { accounts, amortizeFinancing } = useStore();
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<"reduce_installment" | "reduce_term">("reduce_installment");

  const preview = useMemo(() => {
    if (!amount || amount <= 0) return null;
    const newOutstanding = Math.max(0, f.outstanding - amount);
    const i = f.rate / 100 / 12;
    const remaining = Math.max(1, f.months - f.paidInstallments);
    const newParcela = f.system === "PRICE"
      ? (i === 0 ? newOutstanding / remaining : (newOutstanding * i) / (1 - Math.pow(1 + i, -remaining)))
      : newOutstanding / remaining + newOutstanding * i;
    return { newOutstanding, newParcela };
  }, [amount, f]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={f.outstanding <= 0}>
          <TrendingDown className="size-4" /> Amortizar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Amortizar — {f.bank}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Valor</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} /></div>
          <div><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="col-span-2">
            <Label>Conta de débito</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Modo</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reduce_installment">Reduzir parcela</SelectItem>
                <SelectItem value="reduce_term">Reduzir prazo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {preview && (
            <div className="col-span-2 rounded-lg bg-muted/40 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span>Novo saldo devedor</span><b className="number-tabular">{brl(preview.newOutstanding)}</b></div>
              {mode === "reduce_installment" && (
                <div className="flex justify-between"><span>Nova parcela estimada</span><b className="number-tabular">{brl(preview.newParcela)}</b></div>
              )}
            </div>
          )}
          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (!accountId || amount <= 0) return;
              amortizeFinancing({ financingId: f.id, accountId, amount, date, mode });
              toast.success("Amortização registrada");
              setOpen(false);
              setAmount(0);
            }}>Confirmar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
