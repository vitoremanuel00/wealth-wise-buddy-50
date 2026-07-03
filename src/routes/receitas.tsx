import { createFileRoute } from "@tanstack/react-router";
import { TransactionsView } from "@/features/transactions/TransactionsView";

export const Route = createFileRoute("/receitas")({
  head: () => ({ meta: [{ title: "Receitas · ManyMoney" }] }),
  component: () => (
    <TransactionsView
      defaultType="income"
      filterType="income"
      title="Receitas"
      subtitle="Todas as entradas registradas."
    />
  ),
});
