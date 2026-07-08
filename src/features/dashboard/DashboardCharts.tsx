import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/services/store";
import { useFinance } from "@/hooks/useFinance";
import { brl, monthKey, monthLabel } from "@/utils/format";

const chartColors = ["#22c55e", "#06b6d4", "#a855f7", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

const axisProps = {
  stroke: "rgba(255,255,255,0.35)",
  tick: { fill: "rgba(255,255,255,0.6)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.22 0.018 265)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: "rgba(255,255,255,0.7)" },
};

export function EvolutionChart() {
  const { transactions } = useStore();
  const fin = useFinance();

  const data = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    let running = 0;
    return months.map((m) => {
      const income = transactions
        .filter((t) => t.status === "paid" && t.type === "income" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.status === "paid" && t.type === "expense" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      running += income - expense;
      return { month: monthLabel(m), patrimonio: Math.round(running + fin.patrimonioLiquido * 0.6) };
    });
  }, [transactions, fin.patrimonioLiquido]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => brl(v).replace("R$", "").trim()} width={70} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} />
        <Line
          type="monotone"
          dataKey="patrimonio"
          stroke="var(--primary)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--primary)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ExpensesPieChart() {
  const { transactions } = useStore();
  const data = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.status === "paid" && t.type === "expense")
      .forEach((t) => { const k = t.category ?? "Sem categoria"; map.set(k, (map.get(k) ?? 0) + t.amount); });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [transactions]);

  if (!data.length) return <EmptyChart label="Sem despesas registradas" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function IncomesBarChart() {
  const { transactions } = useStore();
  const data = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.status === "paid" && t.type === "income")
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [transactions]);

  if (!data.length) return <EmptyChart label="Sem receitas registradas" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => brl(v).replace("R$", "").trim()} width={70} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={chartColors[i % chartColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CashflowAreaChart() {
  const { transactions } = useStore();
  const data = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    return months.map((m) => {
      const income = transactions
        .filter((t) => t.status === "paid" && t.type === "income" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      const expense = transactions
        .filter((t) => t.status === "paid" && t.type === "expense" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      return { month: monthLabel(m), receitas: income, despesas: expense };
    });
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gIn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gOut" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => brl(v).replace("R$", "").trim()} width={70} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => brl(v)} />
        <Area type="monotone" dataKey="receitas" stroke="#22c55e" fill="url(#gIn)" strokeWidth={2} />
        <Area type="monotone" dataKey="despesas" stroke="#ef4444" fill="url(#gOut)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[260px] grid place-items-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
