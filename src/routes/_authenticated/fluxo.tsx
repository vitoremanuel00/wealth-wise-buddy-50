import { createFileRoute } from "@tanstack/react-router";
import { TransactionsView } from "@/features/transactions/TransactionsView";

export const Route = createFileRoute("/_authenticated/fluxo")({
  head: () => ({ meta: [{ title: "Fluxo Financeiro · ManyMoney" }] }),
  component: () => <TransactionsView />,
});
