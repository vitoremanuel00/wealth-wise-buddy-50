export const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

export const pct = (n: number, digits = 1) =>
  `${(Number.isFinite(n) ? n : 0).toFixed(digits)}%`;

export const dateBR = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
};

export const monthKey = (iso: string) => iso.slice(0, 7); // YYYY-MM

export const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
};
