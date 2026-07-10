import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, CreditCard as CardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/services/store";
import { brl, dateBR } from "@/utils/format";
import { cardInvoices } from "@/utils/cards";
import {
  PayInvoiceDialog,
  StatusBadge,
  formatInvoiceMonth,
} from "./cartoes";

export const Route = createFileRoute("/faturas/$cardId/$invoiceKey")({
  head: () => ({ meta: [{ title: "Fatura · ManyMoney" }] }),
  component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
  const { cardId, invoiceKey } = Route.useParams();
  const { cards, transactions } = useStore();
  const card = cards.find((c) => c.id === cardId);
  if (!card) throw notFound();
  const invoice = cardInvoices(card, transactions).find((i) => i.key === invoiceKey);
  if (!invoice) throw notFound();

  const outstanding = Math.max(0, invoice.total - invoice.paid);

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link to="/cartoes">
            <ArrowLeft className="size-4" /> Voltar para Cartões
          </Link>
        </Button>
      </div>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="size-12 rounded-xl grid place-items-center"
              style={{ backgroundColor: `${card.color}22`, color: card.color }}
            >
              <CardIcon className="size-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {card.name}
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Fatura {formatInvoiceMonth(invoice.key)}
              </h1>
              <div className="text-sm text-muted-foreground mt-1">
                Fecha dia {card.closingDay} · vence {dateBR(invoice.dueDate)}
              </div>
            </div>
          </div>

          <div className="text-right">
            <StatusBadge status={invoice.status} />
            <div className="mt-2 text-3xl font-semibold number-tabular">
              {brl(invoice.total)}
            </div>
            {invoice.paid > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Pago {brl(invoice.paid)} · Restante {brl(outstanding)}
              </div>
            )}
            {invoice.status !== "paid" && (
              <div className="mt-3">
                <PayInvoiceDialog
                  card={card}
                  invoice={invoice}
                  trigger={
                    <Button className="gap-2">
                      <CheckCircle2 className="size-4" /> Pagar fatura
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Lançamentos ({invoice.items.length})</h2>
          <span className="text-xs text-muted-foreground">
            Total {brl(invoice.total)}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="p-3">Descrição</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Compra</th>
              <th className="p-3">Parcela</th>
              <th className="p-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr
                key={`${it.transactionId}-${it.installmentIndex}`}
                className="border-b border-border/60"
              >
                <td className="p-3">{it.description}</td>
                <td className="p-3 text-muted-foreground">{it.category || "—"}</td>
                <td className="p-3 text-muted-foreground">{dateBR(it.purchaseDate)}</td>
                <td className="p-3 text-muted-foreground">
                  {it.installmentIndex}/{it.installmentsTotal}
                </td>
                <td className="p-3 text-right number-tabular font-medium">
                  {brl(it.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
