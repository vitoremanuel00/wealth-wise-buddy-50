import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart,
  Building2,
  CheckCircle2,
  Clock,
  Gem,
  Coins,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/features/dashboard/StatCard";
import {
  EvolutionChart,
  ExpensesPieChart,
  IncomesBarChart,
  CashflowAreaChart,
} from "@/features/dashboard/DashboardCharts";
import { useFinance } from "@/hooks/useFinance";
import { useStore } from "@/services/store";
import { brl, dateBR } from "@/utils/format";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: "Dashboard · ManyMoney" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fin = useFinance();
  const { transactions, goals } = useStore();

  const latest = transactions.slice(0, 6);
  const upcoming = transactions
    .filter((t) => t.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão consolidada do seu patrimônio e fluxo financeiro."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Patrimônio Bruto"
          value={brl(fin.patrimonioBruto)}
          icon={Gem}
          tone="accent"
          delay={0}
        />
        <StatCard
          label="Patrimônio Líquido"
          value={brl(fin.patrimonioLiquido)}
          hint={`Dívidas ${brl(fin.financingsDebt)}`}
          icon={Wallet}
          tone="success"
          delay={0.05}
        />
        <StatCard
          label="Receita do mês"
          value={brl(fin.incomeMonth)}
          icon={TrendingUp}
          tone="success"
          delay={0.1}
        />
        <StatCard
          label="Despesa do mês"
          value={brl(fin.expenseMonth)}
          icon={TrendingDown}
          tone="destructive"
          delay={0.15}
        />

        <StatCard
          label="Saldo disponível"
          value={brl(fin.cashTotal)}
          icon={Coins}
          delay={0.2}
        />
        <StatCard
          label="Investimentos"
          value={brl(fin.investmentsMarketValue)}
          icon={LineChart}
          tone="accent"
          delay={0.25}
        />
        <StatCard
          label="Total amortizado"
          value={brl(fin.amortizedTotal)}
          icon={Building2}
          delay={0.3}
        />
        <StatCard
          label="Contas pagas / pendentes"
          value={`${fin.paidCount} / ${fin.pendingCount}`}
          icon={PiggyBank}
          tone="warning"
          delay={0.35}
        />
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Evolução do Patrimônio" className="lg:col-span-2">
          <EvolutionChart />
        </ChartCard>
        <ChartCard title="Despesas por categoria">
          <ExpensesPieChart />
        </ChartCard>
      </section>

      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Receitas por categoria">
          <IncomesBarChart />
        </ChartCard>
        <ChartCard title="Fluxo de Caixa (6 meses)">
          <CashflowAreaChart />
        </ChartCard>
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Últimas movimentações</h3>
            <span className="text-xs text-muted-foreground">{transactions.length} total</span>
          </div>
          {latest.length === 0 ? (
            <EmptyRow label="Nenhuma movimentação registrada ainda." />
          ) : (
            <ul className="divide-y divide-border">
              {latest.map((t) => (
                <li key={t.id} className="py-3 flex items-center gap-3">
                  <div
                    className={`size-8 rounded-lg grid place-items-center ${
                      t.type === "income"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : t.type === "expense"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-sky-500/15 text-sky-400"
                    }`}
                  >
                    {t.type === "income" ? (
                      <TrendingUp className="size-4" />
                    ) : t.type === "expense" ? (
                      <TrendingDown className="size-4" />
                    ) : (
                      <LineChart className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{t.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.category} · {dateBR(t.date)}
                    </div>
                  </div>
                  <div className="text-sm font-medium number-tabular">
                    {t.type === "expense" ? "-" : "+"}
                    {brl(t.amount)}
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      t.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : t.status === "pending"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.status === "paid" ? (
                      <CheckCircle2 className="inline size-3 -mt-0.5" />
                    ) : t.status === "pending" ? (
                      <Clock className="inline size-3 -mt-0.5" />
                    ) : null}{" "}
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Próximos vencimentos</h3>
          {upcoming.length === 0 ? (
            <EmptyRow label="Nada pendente. Bom trabalho." />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="truncate">{t.description}</div>
                    <div className="text-xs text-muted-foreground">{dateBR(t.date)}</div>
                  </div>
                  <div className="text-sm font-medium number-tabular text-amber-400">
                    {brl(t.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Metas</h3>
          {goals.length === 0 ? (
            <EmptyRow label="Nenhuma meta criada ainda." />
          ) : (
            <ul className="space-y-4">
              {goals.slice(0, 4).map((g) => {
                const pct = Math.min(100, (g.current / Math.max(1, g.target)) * 100);
                return (
                  <li key={g.id}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>{g.name}</span>
                      <span className="text-muted-foreground number-tabular">
                        {brl(g.current)} / {brl(g.target)}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Alertas</h3>
          <ul className="space-y-3 text-sm">
            {fin.expenseMonth > fin.incomeMonth && fin.incomeMonth > 0 && (
              <Alert tone="destructive">
                Suas despesas do mês superaram as receitas em{" "}
                {brl(fin.expenseMonth - fin.incomeMonth)}.
              </Alert>
            )}
            {fin.pendingCount > 0 && (
              <Alert tone="warning">
                Você tem {fin.pendingCount} conta(s) pendente(s) para pagamento.
              </Alert>
            )}
            {fin.patrimonioLiquido < 0 && (
              <Alert tone="destructive">
                Patrimônio líquido negativo. Revise seus financiamentos.
              </Alert>
            )}
            {transactions.length === 0 && (
              <Alert tone="default">
                Cadastre sua primeira movimentação em <b>Fluxo Financeiro</b> para
                começar a acompanhar seu dinheiro.
              </Alert>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-2xl p-5 ${className}`}
    >
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <div className="text-sm text-muted-foreground py-8 text-center">{label}</div>;
}

function Alert({
  tone,
  children,
}: {
  tone: "default" | "warning" | "destructive";
  children: React.ReactNode;
}) {
  const map = {
    default: "border-border bg-muted/40",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    destructive: "border-red-500/30 bg-red-500/10 text-red-200",
  };
  return (
    <li className={`rounded-lg border px-3 py-2 text-sm ${map[tone]}`}>{children}</li>
  );
}
