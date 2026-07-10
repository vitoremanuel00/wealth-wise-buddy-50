# Regras de Negócio — ManyMoney

Este documento é a fonte de verdade das regras financeiras do sistema.
Nenhum cálculo pode ser feito fora dessas regras.

## 1. Movimentações (Transactions)

Toda movimentação financeira do sistema é uma `Transaction`.

**Tipos:**
- `income` — receita (aumenta saldo da conta).
- `expense` — despesa (reduz saldo da conta, exceto quando forma de pagamento = `credito`).
- `transfer` — transferência entre contas.
- `investment` — aporte em investimento (reduz saldo da conta e alimenta o total investido).
- `amortization` — amortização de financiamento (reduz saldo e reduz dívida).
- `opening_balance` — saldo inicial informado (aumenta saldo sem contar como receita mensal).
- `invoice_payment` — **pagamento de fatura de cartão** (reduz saldo da conta e quita a fatura correspondente).

**Status:**
- `paid` — afeta o caixa imediatamente.
- `pending` — NÃO afeta o caixa; aparece nos "a vencer".
- `cancelled` — ignorada.

**Regra-mãe:** somente transações com `status = "paid"` alteram o saldo das contas
e do patrimônio. `pending` é apenas planejamento.

## 2. Contas (Accounts)

O **saldo atual de uma conta nunca é editado manualmente**.
Ele é sempre derivado:

```
saldo_atual =
    saldo_inicial
  + Σ (income  onde accountId = conta e status = paid)
  + Σ (opening_balance onde accountId = conta e status = paid)
  − Σ (expense onde accountId = conta e status = paid)   // ignora expense com paymentMethod = credito
  − Σ (investment onde accountId = conta e status = paid)
  − Σ (amortization onde accountId = conta e status = paid)
  − Σ (invoice_payment onde accountId = conta e status = paid)
```

A UI de conta mostra: saldo inicial, entradas, saídas e o saldo atual calculado.
Editar o campo `initialBalance` é permitido (é um dado da conta),
mas o saldo atual é sempre recalculado.

## 3. Cartões de Crédito

Cartão de crédito **não é uma conta**. Ele não guarda saldo próprio.

- Toda compra no crédito é uma `expense` com `paymentMethod = "credito"`,
  `cardId`, `installments >= 1` e `purchaseDate`.
- Essa despesa **NÃO reduz o saldo de nenhuma conta** enquanto for uma compra no crédito.
- O sistema expande a compra em N parcelas virtuais, agrupadas por ciclo
  (fechamento/vencimento) do cartão — ver `src/utils/cards.ts`.
- Cada ciclo forma uma **Fatura** (`CardInvoice`).

**Pagamento de fatura:**
- Quando o usuário paga uma fatura, o sistema cria uma transação
  `invoice_payment` com `cardId`, `invoiceKey` (`YYYY-MM`) e `accountId`
  (conta de onde saiu o dinheiro).
- O saldo da conta cai pelo valor da fatura.
- A fatura passa a ser considerada **paga**.

Status derivado de uma fatura:
- `paid` — existe `invoice_payment` para aquela `invoiceKey` no cartão.
- `open` — é a fatura do ciclo atual (ainda em aberto).
- `future` — ciclo futuro.
- `closed` — ciclo passado sem pagamento registrado.

## 4. Financiamentos (SAC / PRICE)

Um financiamento é armazenado em `Financing`:
`financed`, `outstanding`, `system` (SAC ou PRICE),
`rate` (% a.a.), `months`, `installment`, `amortized`,
`paidInstallments`, `history[]`.

**Fórmulas mensais** (taxa mensal `i = rate/100/12`):

- **PRICE** (parcela fixa):
  `parcela = saldo * i / (1 − (1 + i) ^ −prazo_restante)`
- **SAC** (amortização constante):
  `amortização = saldo / prazo_restante`
  `parcela = amortização + saldo * i`

**Pagar parcela:**
- Debita `installment` da conta escolhida (transação `expense` categoria
  "Financiamento" + `amortization` para a parte de principal, ou uma única
  `expense` no MVP — ver `Sprint-01.md`).
- Aumenta `paidInstallments` em 1.
- Reduz `outstanding` pela parte de principal.
- Recalcula `installment` conforme o sistema.

**Amortizar (extra):**
- Debita `amount` da conta escolhida (transação `amortization`).
- Reduz `outstanding` pelo valor amortizado.
- Recalcula `installment` (modo padrão) OU reduz `months` restantes
  (modo "reduzir prazo").
- Registra no `history`.

## 5. Patrimônio

```
Patrimônio Bruto    = caixa_total + investimentos_mercado + mercado_pago
Patrimônio Líquido  = Patrimônio Bruto − Σ outstanding dos financiamentos
```

Ambos são derivados no `useFinance`. Nenhuma tela guarda esses valores.

## 6. Recorrência

Transações recorrentes (contas fixas) usam o campo
`recurrence = { frequency: "monthly", installments: N, parentId?: string }`.

Ao criar uma transação marcada como recorrente por N meses:
1. Salva a transação original (mês atual) com `status = pending` (ou o que o usuário escolher).
2. Gera automaticamente N-1 filhas com a mesma descrição e valor, uma por mês subsequente,
   todas com `parentId = transacao_original.id` e `status = pending`.
3. O usuário pode marcar cada mês como `paid` individualmente.

Deletar a transação pai remove todas as filhas.

## 7. Invariantes

- Não existe nenhum campo "editar saldo atual". Saldo é sempre calculado.
- Não existe transação manual do tipo "Fatura" — só `invoice_payment`.
- Toda amortização de financiamento **precisa** debitar de uma conta.
- Toda compra no crédito **precisa** ter `cardId` e `purchaseDate`.
- `opening_balance` **não** entra no cálculo de "Receita do mês".
