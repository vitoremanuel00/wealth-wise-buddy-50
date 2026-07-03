/**
 * Central data store — Zustand + localStorage persistence.
 * All feature modules read/write through this store so swapping the
 * persistence layer to Supabase later requires only replacing the
 * `persist` middleware with an async repository.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Account,
  Category,
  CreditCard,
  Financing,
  Goal,
  HouseItem,
  Investment,
  MercadoPago,
  Motorcycle,
  Transaction,
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

interface Actions {
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
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

  addFinancing: (f: Omit<Financing, "id">) => void;
  updateFinancing: (id: string, patch: Partial<Financing>) => void;
  deleteFinancing: (id: string) => void;

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

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initial,

      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: uid(), createdAt: new Date().toISOString() },
            ...s.transactions,
          ],
        })),
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

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

      addFinancing: (f) => set((s) => ({ financings: [...s.financings, { ...f, id: uid() }] })),
      updateFinancing: (id, patch) =>
        set((s) => ({
          financings: s.financings.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      deleteFinancing: (id) =>
        set((s) => ({ financings: s.financings.filter((f) => f.id !== id) })),

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
      name: "manymoney-store-v1",
      storage: createJSONStorage(() => {
        // SSR safety: fall back to no-op storage on server
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
