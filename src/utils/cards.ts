/**
 * Credit card computation helpers.
 * Purchases stored as expense + paymentMethod=credito are expanded
 * into per-cycle installments; invoices are grouped by billing cycle.
 * Payment is a separate `invoice_payment` transaction linked by invoiceKey.
 */
import type { CreditCard, Transaction } from "@/types";

export interface CardInstallment {
  transactionId: string;
  description: string;
  category: string;
  purchaseDate: string;
  installmentIndex: number;
  installmentsTotal: number;
  amount: number;
  invoiceKey: string;
  invoiceDueDate: string;
}

export type InvoiceStatus = "open" | "closed" | "future" | "paid";

export interface CardInvoice {
  key: string;
  dueDate: string;
  total: number;
  paid: number;
  items: CardInstallment[];
  status: InvoiceStatus;
}

const pad = (n: number) => String(n).padStart(2, "0");

const clampDay = (year: number, monthIdx: number, day: number) => {
  const last = new Date(year, monthIdx + 1, 0).getDate();
  return Math.min(day, last);
};

function invoiceMonthFor(purchaseISO: string, closingDay: number) {
  const d = new Date(purchaseISO);
  let y = d.getFullYear();
  let m = d.getMonth();
  if (d.getDate() > closingDay) {
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return { year: y, monthIdx: m };
}

function addMonths(year: number, monthIdx: number, delta: number) {
  const total = year * 12 + monthIdx + delta;
  return { year: Math.floor(total / 12), monthIdx: ((total % 12) + 12) % 12 };
}

export function expandCardPurchase(
  t: Transaction,
  card: CreditCard,
): CardInstallment[] {
  const total = Math.max(1, t.installments ?? 1);
  const each = t.amount / total;
  const base = invoiceMonthFor(t.purchaseDate ?? t.date, card.closingDay);
  const out: CardInstallment[] = [];
  for (let i = 0; i < total; i++) {
    const { year, monthIdx } = addMonths(base.year, base.monthIdx, i);
    const day = clampDay(year, monthIdx, card.dueDay);
    const invoiceDueDate = `${year}-${pad(monthIdx + 1)}-${pad(day)}`;
    out.push({
      transactionId: t.id,
      description: t.description,
      category: t.category ?? "",
      purchaseDate: t.purchaseDate ?? t.date,
      installmentIndex: i + 1,
      installmentsTotal: total,
      amount: each,
      invoiceKey: `${year}-${pad(monthIdx + 1)}`,
      invoiceDueDate,
    });
  }
  return out;
}

export function cardInstallments(
  card: CreditCard,
  transactions: Transaction[],
): CardInstallment[] {
  return transactions
    .filter(
      (t) =>
        t.paymentMethod === "credito" &&
        t.cardId === card.id &&
        t.type === "expense" &&
        t.status !== "cancelled",
    )
    .flatMap((t) => expandCardPurchase(t, card))
    .sort((a, b) => a.invoiceDueDate.localeCompare(b.invoiceDueDate));
}

/** Sum of `invoice_payment` transactions applied to a given (card, invoiceKey). */
export function invoicePayments(
  card: CreditCard,
  transactions: Transaction[],
  invoiceKey: string,
) {
  return transactions
    .filter(
      (t) =>
        t.type === "invoice_payment" &&
        t.cardId === card.id &&
        t.invoiceKey === invoiceKey &&
        t.status !== "cancelled",
    )
    .reduce((s, t) => s + t.amount, 0);
}

export function cardInvoices(
  card: CreditCard,
  transactions: Transaction[],
  today: Date = new Date(),
): CardInvoice[] {
  const items = cardInstallments(card, transactions);
  const byKey = new Map<string, CardInstallment[]>();
  for (const it of items) {
    const arr = byKey.get(it.invoiceKey) ?? [];
    arr.push(it);
    byKey.set(it.invoiceKey, arr);
  }
  const currentInvoiceKey = (() => {
    const inv = invoiceMonthFor(today.toISOString(), card.closingDay);
    return `${inv.year}-${pad(inv.monthIdx + 1)}`;
  })();

  return Array.from(byKey.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => {
      const dueDate = list[0].invoiceDueDate;
      const total = list.reduce((s, i) => s + i.amount, 0);
      const paid = invoicePayments(card, transactions, key);
      let status: InvoiceStatus;
      if (paid >= total - 0.005) status = "paid";
      else if (key === currentInvoiceKey) status = "open";
      else if (key < currentInvoiceKey) status = "closed";
      else status = "future";
      return { key, dueDate, total, paid, items: list, status };
    });
}

export function cardUsedLimit(
  card: CreditCard,
  transactions: Transaction[],
  today: Date = new Date(),
): number {
  return cardInvoices(card, transactions, today)
    .filter((inv) => inv.status !== "closed" && inv.status !== "paid")
    .reduce((s, inv) => s + Math.max(0, inv.total - inv.paid), 0);
}

export function cardAvailableLimit(
  card: CreditCard,
  transactions: Transaction[],
  today: Date = new Date(),
): number {
  return Math.max(0, card.limit - cardUsedLimit(card, transactions, today));
}

export function cardOpenInvoice(
  card: CreditCard,
  transactions: Transaction[],
  today: Date = new Date(),
): CardInvoice | undefined {
  return cardInvoices(card, transactions, today).find((i) => i.status === "open");
}
