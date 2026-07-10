/**
 * Central data store — Zustand + localStorage persistence.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Account,
  Category,
  CreditCard,
  Financing,
  FinancingEvent,
  Goal,
  HouseItem,
  Investment,
  MercadoPago,
  Motorcycle,
  Transaction,
  TransactionRecurrence,
  Trip,
} from "@/types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

interface State {
  accounts: Account[];
  cards: CreditCard[];
  transactions: Transaction[];
  categories: Category[];
  investments: Investment[];
  financings: Financing[];
  goals: Goal[];
  trips: Trip[];
  house: HouseItem[];
  motorcycle: Motorcycle;
  mercadoPago: MercadoPago;
  currency: string;
}

interface AddTransactionOptions {
  /** If set, generates N monthly occurrences (including the original). */
  recurringMonths?: number;
}

interface PayInvoiceInput {
  cardId: string;
  invoiceKey: string; // YYYY-MM
  amount: number;
  accountId: string;
  date: string; // ISO
  description?: string;
}

interface PayFinancingInstallmentInput {
  financingId: string;
  accountId: string;
  date: string;
}

interface AmortizeFinancingInput {
  financingId: string;
  accountId: string;
  amount: number;
  date: string;
  mode: "reduce_installment" | "reduce_term";
}

interface Actions {
  addTransaction: (
    t: Omit<Transaction, "id" | "createdAt">,
    opts?: AddTransactionOptions,
  ) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  /** Deletes the transaction and, if it is a recurrence parent, all its children. */
  deleteTransaction: (id: string) => void;

  addAccount: (a: Omit<Account, "id">) => void;
  deleteAccount: (id: string) => void;

  addCard: (c: Omit<CreditCard, "id">) => void;
  deleteCard: (id: string) => void;

  addCategory: (c: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addTrip: (t: Omit<Trip, "id">) => void;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  addHouseItem: (h: Omit<HouseItem, "id">) => void;
  updateHouseItem: (id: string, patch: Partial<HouseItem>) => void;
  deleteHouseItem: (id: string) => void;

  addInvestment: (i: Omit<Investment, "id">) => void;
  deleteInvestment: (id: string) => void;

  addFinancing: (
    f: Omit<Financing, "id" | "paidInstallments" | "history"> & {
      paidInstallments?: number;
      history?: FinancingEvent[];
    },
  ) => void;
  updateFinancing: (id: string, patch: Partial<Financing>) => void;
  deleteFinancing: (id: string) => void;
  payFinancingInstallment: (input: PayFinancingInstallmentInput) => void;
  amortizeFinancing: (input: AmortizeFinancingInput) => void;

  payInvoice: (input: PayInvoiceInput) => void;

  setMercadoPago: (patch: Partial<MercadoPago>) => void;
  addMercadoPagoEntry: (e: { type: "aporte" | "retirada" | "rendimento"; amount: number }) => void;

  reset: () => void;
}

const seedCategories: Category[] = [
  { id: uid(), name: "Salário", type: "income", color: "#10b981" },
  { id: uid(), name: "Freelance", type: "income", color: "#06b6d4" },
  { id: uid(), name: "Dividendos", type: "income", color: "#8b5cf6" },
  { id: uid(), name: "Alimentação", type: "expense", color: "#f59e0b" },
  { id: uid(), name: "Transporte", type: "expense", color: "#ef4444" },
  { id: uid(), name: "Moradia", type: "expense", color: "#3b82f6" },
  { id: uid(), name: "Lazer", type: "expense", color: "#ec4899" },
  { id: uid(), name: "Saúde", type: "expense", color: "#14b8a6" },
  { id: uid(), name: "Financiamento", type: "expense", color: "#f97316" },
  { id: uid(), name: "Renda Fixa", type: "investment", color: "#0ea5e9" },
  { id: uid(), name: "Renda Variável", type: "investment", color: "#a855f7" },
  { id: uid(), name: "Reserva Acumulada", type: "opening_balance", color: "#64748b" },
];

const seedAccounts: Account[] = [
  { id: uid(), name: "Mercado Pago", color: "#00b1ea", icon: "wallet", initialBalance: 0 },
  { id: uid(), name: "Nubank", color: "#8a05be", icon: "landmark", initialBalance: 0 },
  { id: uid(), name: "Dinheiro", color: "#10b981", icon: "banknote", initialBalance: 0 },
];

const initial: State = {
  accounts: seedAccounts,
  cards: [],
  transactions: [],
  categories: seedCategories,
  investments: [],
  financings: [],
  goals: [],
  trips: [],
  house: [],
  motorcycle: { model: "", records: [] },
  mercadoPago: { balance: 0, cdiPercent: 100, history: [] },
  currency: "BRL",
};

// ── financing helpers ──────────────────────────────────────────────────────
function monthlyRate(rate: number) {
  return rate / 100 / 12;
}
function priceInstallment(saldo: number, i: number, prazo: number) {
  if (prazo <= 0) return 0;
  if (i === 0) return saldo / prazo;
  return (saldo * i) / (1 - Math.pow(1 + i, -prazo));
}
function sacInstallment(saldo: number, i: number, prazo: number) {
  if (prazo <= 0) return 0;
  return saldo / prazo + saldo * i;
}
function nextInstallment(f: Pick<Financing, "system" | "outstanding" | "rate" | "months" | "paidInstallments">) {
  const remaining = Math.max(1, f.months - f.paidInstallments);
  const i = monthlyRate(f.rate);
  return f.system === "PRICE"
    ? priceInstallment(f.outstanding, i, remaining)
    : sacInstallment(f.outstanding, i, remaining);
}

function addMonthsISO(iso: string, delta: number) {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + delta);
  return d.toISOString().slice(0, 10);
}

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initial,

      addTransaction: (t, opts) =>
        set((s) => {
          const parentId = uid();
          const nowISO = new Date().toISOString();
          const parent: Transaction = { ...t, id: parentId, createdAt: nowISO };

          const months = opts?.recurringMonths ?? 0;
          if (months <= 1) {
            const withMeta = months === 1
              ? {
                  ...parent,
                  recurrence: {
                    frequency: "monthly" as const,
                    installments: 1,
                  } satisfies TransactionRecurrence,
                }
              : parent;
            return { transactions: [withMeta, ...s.transactions] };
          }

          const recMeta: TransactionRecurrence = {
            frequency: "monthly",
            installments: months,
          };
          const parentRec: Transaction = { ...parent, recurrence: recMeta };
          const children: Transaction[] = [];
          for (let i = 1; i < months; i++) {
            children.push({
              ...t,
              id: uid(),
              createdAt: nowISO,
              date: addMonthsISO(t.date, i),
              status: "pending",
              recurrence: { ...recMeta, parentId },
            });
          }
          return { transactions: [parentRec, ...children, ...s.transactions] };
        }),
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter(
            (t) => t.id !== id && t.recurrence?.parentId !== id,
          ),
        })),

      addAccount: (a) => set((s) => ({ accounts: [...s.accounts, { ...a, id: uid() }] })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      addCard: (c) => set((s) => ({ cards: [...s.cards, { ...c, id: uid() }] })),
      deleteCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: uid() }] })),
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addTrip: (t) => set((s) => ({ trips: [...s.trips, { ...t, id: uid() }] })),
      updateTrip: (id, patch) =>
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),

      addHouseItem: (h) => set((s) => ({ house: [...s.house, { ...h, id: uid() }] })),
      updateHouseItem: (id, patch) =>
        set((s) => ({ house: s.house.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
      deleteHouseItem: (id) => set((s) => ({ house: s.house.filter((h) => h.id !== id) })),

      addInvestment: (i) => set((s) => ({ investments: [...s.investments, { ...i, id: uid() }] })),
      deleteInvestment: (id) =>
        set((s) => ({ investments: s.investments.filter((i) => i.id !== id) })),

      addFinancing: (f) =>
        set((s) => ({
          financings: [
            ...s.financings,
            {
              paidInstallments: 0,
              history: [],
              ...f,
              id: uid(),
            } as Financing,
          ],
        })),
      updateFinancing: (id, patch) =>
        set((s) => ({
          financings: s.financings.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      deleteFinancing: (id) =>
        set((s) => ({ financings: s.financings.filter((f) => f.id !== id) })),

      payFinancingInstallment: ({ financingId, accountId, date }) =>
        set((s) => {
          const f = s.financings.find((x) => x.id === financingId);
          if (!f) return {};
          const i = monthlyRate(f.rate);
          const juros = f.outstanding * i;
          const parcela = nextInstallment(f);
          const principal = Math.max(0, parcela - juros);
          const newOutstanding = Math.max(0, f.outstanding - principal);
          const updated: Financing = {
            ...f,
            outstanding: newOutstanding,
            paidInstallments: f.paidInstallments + 1,
            installment: nextInstallment({
              ...f,
              outstanding: newOutstanding,
              paidInstallments: f.paidInstallments + 1,
            }),
            history: [
              { id: uid(), date, type: "payment", amount: parcela, accountId },
              ...f.history,
            ],
          };
          const tx: Transaction = {
            id: uid(),
            createdAt: new Date().toISOString(),
            description: `Parcela ${updated.paidInstallments}/${f.months} — ${f.bank}`,
            category: "Financiamento",
            accountId,
            type: "expense",
            amount: parcela,
            date,
            status: "paid",
            paymentMethod: "debito",
            financingId,
          };
          return {
            financings: s.financings.map((x) => (x.id === financingId ? updated : x)),
            transactions: [tx, ...s.transactions],
          };
        }),

      amortizeFinancing: ({ financingId, accountId, amount, date, mode }) =>
        set((s) => {
          const f = s.financings.find((x) => x.id === financingId);
          if (!f || amount <= 0) return {};
          const newOutstanding = Math.max(0, f.outstanding - amount);
          let newMonths = f.months;
          if (mode === "reduce_term") {
            const remaining = Math.max(1, f.months - f.paidInstallments);
            const i = monthlyRate(f.rate);
            const parcela = f.installment || nextInstallment(f);
            const nRemaining =
              i === 0
                ? Math.ceil(newOutstanding / parcela)
                : Math.ceil(
                    -Math.log(1 - (newOutstanding * i) / parcela) / Math.log(1 + i),
                  );
            newMonths = f.paidInstallments + Math.max(1, Math.min(remaining, nRemaining));
          }
          const updated: Financing = {
            ...f,
            outstanding: newOutstanding,
            amortized: f.amortized + amount,
            months: newMonths,
            installment: nextInstallment({
              ...f,
              outstanding: newOutstanding,
              months: newMonths,
            }),
            history: [
              { id: uid(), date, type: "amortization", amount, accountId },
              ...f.history,
            ],
          };
          const tx: Transaction = {
            id: uid(),
            createdAt: new Date().toISOString(),
            description: `Amortização — ${f.bank}`,
            category: "Financiamento",
            accountId,
            type: "amortization",
            amount,
            date,
            status: "paid",
            paymentMethod: "debito",
            financingId,
          };
          return {
            financings: s.financings.map((x) => (x.id === financingId ? updated : x)),
            transactions: [tx, ...s.transactions],
          };
        }),

      payInvoice: ({ cardId, invoiceKey, amount, accountId, date, description }) =>
        set((s) => {
          const card = s.cards.find((c) => c.id === cardId);
          const tx: Transaction = {
            id: uid(),
            createdAt: new Date().toISOString(),
            description: description ?? `Fatura ${card?.name ?? ""} · ${invoiceKey}`,
            category: "Fatura Cartão",
            accountId,
            type: "invoice_payment",
            amount,
            date,
            status: "paid",
            paymentMethod: "debito",
            cardId,
            invoiceKey,
          };
          return { transactions: [tx, ...s.transactions] };
        }),

      setMercadoPago: (patch) => set((s) => ({ mercadoPago: { ...s.mercadoPago, ...patch } })),
      addMercadoPagoEntry: (e) =>
        set((s) => ({
          mercadoPago: {
            ...s.mercadoPago,
            balance:
              e.type === "retirada"
                ? s.mercadoPago.balance - e.amount
                : s.mercadoPago.balance + e.amount,
            history: [
              { id: uid(), date: new Date().toISOString(), ...e },
              ...s.mercadoPago.history,
            ],
          },
        })),

      reset: () => set(initial),
    }),
    {
      name: "manymoney-store-v2",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    },
  ),
);
