import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useStore } from "@/services/store";
import { useFinance } from "@/hooks/useFinance";
import { brl } from "@/utils/format";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios · ManyMoney" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { transactions } = useStore();
  const fin = useFinance();

  const exportCSV = () => {
    const rows = [
      ["Data", "Descrição", "Categoria", "Tipo", "Status", "Valor"],
      ...transactions.map((t) => [t.date, t.description, t.category, t.type, t.status, String(t.amount)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace?.(/"/g, '""') ?? c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "manymoney-relatorio.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ transactions, resumo: fin }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "manymoney-backup.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado");
  };

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Consolide receitas, despesas e patrimônio."
        actions={
          <>
            <Button variant="outline" onClick={exportJSON} className="gap-2"><Download className="size-4" /> JSON</Button>
            <Button onClick={exportCSV} className="gap-2"><Download className="size-4" /> CSV</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Receita do mês" value={brl(fin.incomeMonth)} />
        <Card label="Despesa do mês" value={brl(fin.expenseMonth)} />
        <Card label="Saldo do mês" value={brl(fin.balanceMonth)} />
        <Card label="Patrimônio líquido" value={brl(fin.patrimonioLiquido)} />
        <Card label="Investimentos" value={brl(fin.investmentsMarketValue)} />
        <Card label="Total amortizado" value={brl(fin.amortizedTotal)} />
      </div>

      <div className="mt-6 glass-card rounded-2xl p-5 text-sm text-muted-foreground">
        Exportação PDF pode ser adicionada plugando <code>@react-pdf/renderer</code> — a
        camada de dados já centralizada em <code>useStore</code> torna essa evolução
        trivial.
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold number-tabular">{value}</div>
    </div>
  );
}
