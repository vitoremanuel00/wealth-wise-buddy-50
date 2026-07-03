import { createFileRoute } from "@tanstack/react-router";
import { TransactionsView } from "@/features/transactions/TransactionsView";

export const Route = createFileRoute("/despesas")({
  head: () => ({ meta: [{ title: "Despesas · ManyMoney" }] }),
  component: () => (
    <TransactionsView
      defaultType="expense"
      filterType="expense"
      title="Despesas"
      subtitle="Todas as saídas registradas."
    />
  ),
});
