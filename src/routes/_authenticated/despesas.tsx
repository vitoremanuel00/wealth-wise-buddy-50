import { createFileRoute } from "@tanstack/react-router";
import { TransactionsView } from "@/features/transactions/TransactionsView";

export const Route = createFileRoute("/_authenticated/despesas")({
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
