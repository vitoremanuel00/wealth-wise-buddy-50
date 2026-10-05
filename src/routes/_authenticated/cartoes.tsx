import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, CreditCard as CardIcon, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/services/store";
import { brl, dateBR } from "@/utils/format";
import {
  cardAvailableLimit,
  cardInvoices,
  cardOpenInvoice,
  cardUsedLimit,
  type CardInvoice,
  type InvoiceStatus,
} from "@/utils/cards";
import type { CreditCard, Transaction } from "@/types";

export const Route = createFileRoute("/_authenticated/cartoes")({
  head: () => ({ meta: [{ title: "Cartões · ManyMoney" }] }),
  component: CartoesPage,
});

function CartoesPage() {
  const { cards, transactions, addCard, deleteCard } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    limit: 0,
    closingDay: 1,
    dueDay: 10,
    color: "#8a05be",
  });

  return (
    <div>
      <PageHeader
        title="Cartões"
        subtitle="Limite, fatura aberta e pagamento — calculados a partir das despesas no crédito."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" /> Novo cartão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo cartão</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Limite</Label>
                  <Input
                    type="number"
                    value={form.limit}
                    onChange={(e) => setForm({ ...form, limit: +e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label>Fechamento (dia)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={form.closingDay}
                    onChange={(e) => setForm({ ...form, closingDay: +e.target.value })}
                  />
                </div>
                <div>
                  <Label>Vencimento (dia)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={form.dueDay}
                    onChange={(e) => setForm({ ...form, dueDay: +e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (!form.name) return;
                      addCard(form);
                      toast.success("Cartão criado");
                      setOpen(false);
                      setForm({
                        name: "",
                        limit: 0,
                        closingDay: 1,
                        dueDay: 10,
                        color: "#8a05be",
                      });
                    }}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {cards.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-16 glass-card rounded-2xl">
          Nenhum cartão cadastrado. Clique em <b>Novo cartão</b>.
        </div>
      ) : (
        <div className="space-y-8">
          {cards.map((c) => (
            <CardPanel
              key={c.id}
              card={c}
              transactions={transactions}
              onDelete={() => {
                deleteCard(c.id);
                toast.success("Cartão removido");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CardPanel({
  card,
  transactions,
  onDelete,
}: {
  card: CreditCard;
  transactions: Transaction[];
  onDelete: () => void;
}) {
  const used = cardUsedLimit(card, transactions);
  const available = cardAvailableLimit(card, transactions);
  const open = cardOpenInvoice(card, transactions);
  const invoices = cardInvoices(card, transactions);
  const pctUsed = card.limit > 0 ? Math.min(100, (used / card.limit) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-border">
          <div
            className="relative rounded-2xl p-5 h-48 flex flex-col justify-between overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${card.color}, oklch(0.2 0.02 265))`,
            }}
          >
            <div className="flex items-start justify-between">
              <CardIcon className="size-6 text-white/90" />
              <button
                onClick={onDelete}
                className="text-white/70 hover:text-white"
                aria-label="Remover cartão"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div>
              <div className="text-white/80 text-xs uppercase tracking-wider">
                {card.name}
              </div>
              <div className="text-white text-2xl font-semibold number-tabular">
                {brl(card.limit)}
              </div>
              <div className="mt-1 text-white/80 text-xs">
                fecha dia {card.closingDay} · vence dia {card.dueDay}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Utilizado</span>
                <span className="number-tabular">
                  {brl(used)} / {brl(card.limit)}
                </span>
              </div>
              <Progress value={pctUsed} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Disponível" value={brl(available)} tone="success" />
              <Stat
                label="Fatura aberta"
                value={brl(open?.total ?? 0)}
                tone="warning"
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-semibold mb-3">Faturas</h3>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhuma compra registrada neste cartão. Registre uma despesa com
              forma de pagamento <b>Crédito</b>.
            </p>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <InvoiceRow key={inv.key} card={card} invoice={inv} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ card, invoice }: { card: CreditCard; invoice: CardInvoice }) {
  return (
    <div className="rounded-xl border border-border p-4 flex flex-wrap items-center gap-3 justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Fatura {formatInvoiceMonth(invoice.key)}</span>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Vence {dateBR(invoice.dueDate)} · {invoice.items.length} lançamento(s)
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold number-tabular">{brl(invoice.total)}</div>
          {invoice.paid > 0 && invoice.status !== "paid" && (
            <div className="text-[10px] text-muted-foreground">
              pago {brl(invoice.paid)}
            </div>
          )}
        </div>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link
            to="/faturas/$cardId/$invoiceKey"
            params={{ cardId: card.id, invoiceKey: invoice.key }}
          >
            Ver fatura <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const map = {
    default: "bg-muted/30",
    success: "bg-emerald-500/10 text-emerald-300",
    warning: "bg-amber-500/10 text-amber-300",
  };
  return (
    <div className={`rounded-lg px-3 py-2 ${map[tone]}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold number-tabular">{value}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { label: string; cls: string }> = {
    open: { label: "Aberta", cls: "bg-amber-500/15 text-amber-300" },
    closed: { label: "Fechada", cls: "bg-muted text-muted-foreground" },
    future: { label: "Futura", cls: "bg-sky-500/15 text-sky-300" },
    paid: { label: "Paga", cls: "bg-emerald-500/15 text-emerald-300" },
  };
  const it = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${it.cls}`}
    >
      {status === "paid" && <CheckCircle2 className="size-3" />}
      {it.label}
    </span>
  );
}

export function formatInvoiceMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

// Re-export used by the invoice detail route
export type { CreditCard };

// Payment dialog reused by the invoice detail page
export function PayInvoiceDialog({
  card,
  invoice,
  trigger,
}: {
  card: CreditCard;
  invoice: CardInvoice;
  trigger: React.ReactNode;
}) {
  const { accounts, payInvoice } = useStore();
  const [open, setOpen] = useState(false);
  const outstanding = Math.max(0, invoice.total - invoice.paid);
  const [amount, setAmount] = useState(outstanding);
  const [accountId, setAccountId] = useState(card.accountId ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setAmount(Math.max(0, invoice.total - invoice.paid));
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagar fatura {formatInvoiceMonth(invoice.key)}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Conta de débito</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
            />
          </div>
          <div>
            <Label>Data do pagamento</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-span-2 text-xs text-muted-foreground">
            Total da fatura: <b>{brl(invoice.total)}</b>
            {invoice.paid > 0 && <> · já pago {brl(invoice.paid)}</>}
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!accountId || amount <= 0) return;
                payInvoice({
                  cardId: card.id,
                  invoiceKey: invoice.key,
                  amount,
                  accountId,
                  date,
                });
                toast.success("Fatura paga");
                setOpen(false);
              }}
            >
              Confirmar pagamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
