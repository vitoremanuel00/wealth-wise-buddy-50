export type UUID = string;

export type TransactionType =
  | "income"
  | "expense"
  | "transfer"
  | "investment"
  | "amortization"
  | "opening_balance";

export type TransactionStatus = "paid" | "pending" | "cancelled";

export type PaymentMethod =
  | "pix"
  | "debito"
  | "dinheiro"
  | "transferencia"
  | "credito";

export interface Transaction {
  id: UUID;
  description: string;
  category?: string;
  accountId?: UUID;
  type: TransactionType;
  amount: number;
  date: string; // ISO
  notes?: string;
  status: TransactionStatus;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  /** Credit card link (payment method = "credito") */
  cardId?: UUID;
  installments?: number;
  purchaseDate?: string;
}

export interface Account {
  id: UUID;
  name: string;
  color: string;
  icon: string;
  initialBalance: number;
}

export interface CreditCard {
  id: UUID;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  accountId?: UUID;
  color: string;
}

export interface Investment {
  id: UUID;
  category: "FII" | "ACAO" | "TESOURO" | "CDB" | "LCI" | "LCA";
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  dividends: number;
}

export interface Financing {
  id: UUID;
  bank: string;
  financed: number;
  outstanding: number;
  system: "SAC" | "PRICE";
  rate: number; // % a.a.
  months: number;
  installment: number;
  amortized: number;
}

export interface Goal {
  id: UUID;
  name: string;
  target: number;
  current: number;
  color?: string;
}

export interface Trip {
  id: UUID;
  destination: string;
  target: number;
  saved: number;
  date: string;
}

export interface HouseItem {
  id: UUID;
  name: string;
  category: "moveis" | "eletrodomesticos" | "decoracao";
  status: "comprado" | "pago" | "instalado" | "pendente";
  price?: number;
}

export interface MotorcycleRecord {
  id: UUID;
  type: "seguro" | "parcela" | "ipva" | "licenciamento" | "revisao" | "oleo" | "pneus";
  description: string;
  amount: number;
  date: string;
}

export interface Motorcycle {
  model: string;
  records: MotorcycleRecord[];
}

export interface MercadoPago {
  balance: number;
  cdiPercent: number;
  history: { id: UUID; date: string; type: "aporte" | "retirada" | "rendimento"; amount: number }[];
}

export interface Category {
  id: UUID;
  name: string;
  type: "income" | "expense" | "investment" | "opening_balance";
  color: string;
}
