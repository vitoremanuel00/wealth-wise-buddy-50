import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/features/dashboard/StatCard";
import { EvolutionChart } from "@/features/dashboard/DashboardCharts";
import { useFinance } from "@/hooks/useFinance";
import { useStore } from "@/services/store";
import { brl } from "@/utils/format";
import { Gem, Wallet, LineChart, Building2, Landmark } from "lucide-react";

export const Route = createFileRoute("/patrimonio")({
  head: () => ({ meta: [{ title: "Patrimônio · ManyMoney" }] }),
  component: PatrimonioPage,
});

function PatrimonioPage() {
  const fin = useFinance();
  const { mercadoPago } = useStore();

  return (
    <div>
      <PageHeader title="Patrimônio" subtitle="Composição total do seu patrimônio pessoal." />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Patrimônio Total" value={brl(fin.patrimonioBruto)} icon={Gem} tone="accent" />
        <StatCard label="Patrimônio Líquido" value={brl(fin.patrimonioLiquido)} icon={Wallet} tone="success" />
        <StatCard label="Caixa" value={brl(fin.cashTotal + mercadoPago.balance)} icon={Landmark} />
        <StatCard label="Investimentos" value={brl(fin.investmentsMarketValue)} icon={LineChart} tone="accent" />
      </section>

      <section className="mt-8 glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4">Evolução mensal</h3>
        <EvolutionChart />
      </section>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Composição</h3>
          <Row label="Caixa em contas" value={brl(fin.cashTotal)} />
          <Row label="Mercado Pago" value={brl(mercadoPago.balance)} />
          <Row label="Investimentos" value={brl(fin.investmentsMarketValue)} />
          <Row label="Financiamentos (a pagar)" value={`- ${brl(fin.financingsDebt)}`} negative />
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Categorias de ativo</h3>
          <div className="text-sm text-muted-foreground">
            Cadastre imóveis e veículos nos módulos <b>Casa</b> e <b>Moto</b> para
            incluí-los na composição.
            <div className="mt-3">
              <Row label="Building2" value="" icon={<Building2 className="size-4" />} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, negative, icon }: { label: string; value: string; negative?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-b-0 text-sm">
      <span className="text-muted-foreground flex items-center gap-2">{icon}{label}</span>
      <span className={`number-tabular font-medium ${negative ? "text-red-400" : ""}`}>{value}</span>
    </div>
  );
}
