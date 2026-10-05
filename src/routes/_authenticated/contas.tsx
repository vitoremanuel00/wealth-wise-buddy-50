import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Trash2, Wallet, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/services/store";
import { useFinance } from "@/hooks/useFinance";
import { brl, monthKey } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/contas")({
  head: () => ({ meta: [{ title: "Contas · ManyMoney" }] }),
  component: ContasPage,
});

function ContasPage() {
  const { accounts, transactions, addAccount, deleteAccount } = useStore();
  const fin = useFinance();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#10b981");
  const [initial, setInitial] = useState(0);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const perAccount = useMemo(() => {
    return accounts.map((a) => {
      const monthTx = transactions.filter(
        (t) => t.accountId === a.id && t.status === "paid" && monthKey(t.date) === currentMonth,
      );
      const income = monthTx
        .filter((t) => t.type === "income" || t.type === "opening_balance")
        .reduce((s, t) => s + t.amount, 0);
      const expense = monthTx
        .filter(
          (t) =>
            (t.type === "expense" && t.paymentMethod !== "credito") ||
            t.type === "investment" ||
            t.type === "amortization" ||
            t.type === "invoice_payment",
        )
        .reduce((s, t) => s + t.amount, 0);
      return { account: a, income, expense };
    });
  }, [accounts, transactions, currentMonth]);

  return (
    <div>
      <PageHeader
        title="Contas"
        subtitle="Saldo calculado automaticamente a partir das movimentações."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="size-4" /> Nova conta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova conta</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Santander" />
                </div>
                <div>
                  <Label>Saldo inicial (R$)</Label>
                  <Input type="number" value={initial} onChange={(e) => setInitial(+e.target.value)} />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    O saldo atual da conta é sempre calculado — nunca editado manualmente.
                  </p>
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20 p-1" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button
                    onClick={() => {
                      if (!name) return;
                      addAccount({ name, color, icon: "wallet", initialBalance: initial });
                      toast.success("Conta criada");
                      setOpen(false);
                      setName(""); setInitial(0);
                    }}
                  >Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {perAccount.map(({ account: a, income, expense }) => (
          <div key={a.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xl grid place-items-center"
                  style={{ backgroundColor: `${a.color}22`, color: a.color }}
                >
                  <Wallet className="size-5" />
                </div>
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Saldo inicial {brl(a.initialBalance)}
                  </div>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteAccount(a.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="mt-4 text-2xl font-semibold number-tabular">
              {brl(fin.accountBalance(a.id))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Saldo atual (calculado)</div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-emerald-500/10 text-emerald-300 p-2">
                <div className="flex items-center gap-1 opacity-80">
                  <ArrowUp className="size-3" /> Entradas do mês
                </div>
                <div className="mt-0.5 number-tabular font-semibold">{brl(income)}</div>
              </div>
              <div className="rounded-lg bg-red-500/10 text-red-300 p-2">
                <div className="flex items-center gap-1 opacity-80">
                  <ArrowDown className="size-3" /> Saídas do mês
                </div>
                <div className="mt-0.5 number-tabular font-semibold">{brl(expense)}</div>
              </div>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">
            Nenhuma conta cadastrada.
          </div>
        )}
      </div>
    </div>
  );
}
