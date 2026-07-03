import { useMemo } from "react";
import { useStore } from "@/services/store";
import { monthKey } from "@/utils/format";

export function useFinance() {
  const store = useStore();

  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    const paid = store.transactions.filter((t) => t.status === "paid");

    const incomeMonth = paid
      .filter((t) => t.type === "income" && monthKey(t.date) === currentMonth)
      .reduce((s, t) => s + t.amount, 0);

    const expenseMonth = paid
      .filter((t) => t.type === "expense" && monthKey(t.date) === currentMonth)
      .reduce((s, t) => s + t.amount, 0);

    const investedTotal = paid
      .filter((t) => t.type === "investment")
      .reduce((s, t) => s + t.amount, 0);

    const amortizedTotal = paid
      .filter((t) => t.type === "amortization")
      .reduce((s, t) => s + t.amount, 0);

    // Account balances = initial + income - expense (paid only), net transfers
    const accountBalance = (accountId: string) => {
      const init = store.accounts.find((a) => a.id === accountId)?.initialBalance ?? 0;
      const delta = paid
        .filter((t) => t.accountId === accountId)
        .reduce((s, t) => {
          if (t.type === "income") return s + t.amount;
          if (t.type === "expense" || t.type === "investment" || t.type === "amortization")
            return s - t.amount;
          return s;
        }, 0);
      return init + delta;
    };

    const cashTotal = store.accounts.reduce((s, a) => s + accountBalance(a.id), 0);

    const investmentsMarketValue = store.investments.reduce(
      (s, i) => s + i.quantity * i.currentPrice,
      0,
    );

    const financingsDebt = store.financings.reduce((s, f) => s + f.outstanding, 0);

    const patrimonioBruto = cashTotal + investmentsMarketValue + store.mercadoPago.balance;
    const patrimonioLiquido = patrimonioBruto - financingsDebt;

    const balanceMonth = incomeMonth - expenseMonth;

    const pendingCount = store.transactions.filter((t) => t.status === "pending").length;
    const paidCount = paid.length;

    return {
      incomeMonth,
      expenseMonth,
      balanceMonth,
      investedTotal,
      amortizedTotal,
      cashTotal,
      investmentsMarketValue,
      financingsDebt,
      patrimonioBruto,
      patrimonioLiquido,
      pendingCount,
      paidCount,
      accountBalance,
    };
  }, [store]);
}
