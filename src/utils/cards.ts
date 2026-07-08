/**
 * Credit card computation helpers.
 *
 * The system does NOT store manual "invoice" transactions.
 * Every purchase is a single expense transaction linked to a card
 * via `cardId` + `installments` + `purchaseDate`. Invoices are
 * derived on the fly by expanding each purchase into its installments
 * and grouping them by billing cycle.
 */
import type { CreditCard, Transaction } from "@/types";

export interface CardInstallment {
  transactionId: string;
  description: string;
  category: string;
  purchaseDate: string;
  installmentIndex: number; // 1-based
  installmentsTotal: number;
  amount: number;
  invoiceKey: string; // YYYY-MM of invoice due date
  invoiceDueDate: string; // ISO date
}

export interface CardInvoice {
  key: string; // YYYY-MM
  dueDate: string; // ISO
  total: number;
  items: CardInstallment[];
  status: "open" | "closed" | "future";
}

const pad = (n: number) => String(n).padStart(2, "0");

const clampDay = (year: number, monthIdx: number, day: number) => {
  const last = new Date(year, monthIdx + 1, 0).getDate();
  return Math.min(day, last);
};

/** Determine invoice year/month index for a purchase given the card closing day. */
function invoiceMonthFor(purchaseISO: string, closingDay: number) {
  const d = new Date(purchaseISO);
  let y = d.getFullYear();
  let m = d.getMonth(); // 0..11
  // Purchases up to and including closingDay land in the same month's invoice;
  // after the closing day they roll to the next month's invoice.
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
      category: t.category,
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

/** All installments belonging to a card, sorted by invoice due date. */
export function cardInstallments(
  card: CreditCard,
  transactions: Transaction[],
): CardInstallment[] {
  return transactions
    .filter(
      (t) =>
        t.paymentMethod === "credito" &&
        t.cardId === card.id &&
        t.status !== "cancelled",
    )
    .flatMap((t) => expandCardPurchase(t, card))
    .sort((a, b) => a.invoiceDueDate.localeCompare(b.invoiceDueDate));
}

/** Group installments into invoices by billing cycle. */
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
      const status: CardInvoice["status"] =
        key === currentInvoiceKey ? "open" : key < currentInvoiceKey ? "closed" : "future";
      return { key, dueDate, total, items: list, status };
    });
}

/** Sum of installments not yet paid off (open + future invoices). */
export function cardUsedLimit(
  card: CreditCard,
  transactions: Transaction[],
  today: Date = new Date(),
): number {
  return cardInvoices(card, transactions, today)
    .filter((inv) => inv.status !== "closed")
    .reduce((s, inv) => s + inv.total, 0);
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
