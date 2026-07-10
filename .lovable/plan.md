
# Plano — Padrão Profissional ManyMoney

Divisão em duas fases claras: **(A)** documentação em `/docs`, **(B)** refatoração das regras de negócio.

---

## Fase A — Documentação (`/docs`)

Criar 6 arquivos em Português. Servem como fonte de verdade para futuras sprints.

1. **`docs/BusinessRules.md`** — regras de negócio:
   - Saldo de conta = `saldo inicial + entradas pagas − saídas pagas` (nunca editável manualmente).
   - Toda transação com `status = "paid"` afeta caixa; `"pending"` não afeta.
   - Cartão de crédito: compras viram parcelas virtuais agrupadas por ciclo (fechamento/vencimento). Fatura só sai do caixa quando um **Pagamento de Fatura** é criado.
   - Financiamento (SAC/PRICE): fórmulas de parcela, cálculo de saldo devedor, amortização extra reduz saldo/parcelas.
   - Patrimônio Líquido = caixa + investimentos + Mercado Pago − dívidas.
   - Recorrência: transação-modelo que gera lançamentos automáticos por N meses.

2. **`docs/Database.md`** — entidades e relacionamentos (formato tabela + diagrama ASCII), com os novos campos: `Transaction.recurring`, `Transaction.invoicePaymentFor`, `Financing.paidInstallments`, `Financing.history`.

3. **`docs/Architecture.md`** — stack (React 19, TanStack Start, Zustand, shadcn), padrão feature-based (`src/features/*`), camadas (routes → features → hooks → services → utils), estratégia de persistência (Zustand + localStorage hoje, Supabase amanhã).

4. **`docs/UI-Guidelines.md`** — tokens de cor, tipografia SF/Inter, espaçamento 4/8/12/16/24, glass-card, estados (empty/loading/error), padrão de Dialog, tabela e badges.

5. **`docs/Roadmap.md`** — fases: MVP local → integração Cloud → multi-usuário → mobile PWA.

6. **`docs/Sprint-01.md`** — escopo desta sprint (itens da Fase B), critérios de aceite, checklist de QA.

---

## Fase B — Refatoração de Regras

### 1. Contas com saldo automático
- Remover qualquer campo de edição manual de saldo atual.
- `useFinance.accountBalance` já é a fonte da verdade — reforçar UI de `/contas` mostrando **Saldo inicial**, **Entradas**, **Saídas** e **Saldo atual** (calculado).

### 2. Cartões — Pagamento de Fatura
- Novo tipo de transação `invoice_payment` (link `invoiceKey` + `cardId` + `accountId`).
- Botão **Pagar fatura** em cada card da lista de faturas → abre modal escolhendo conta de débito e data; cria uma transação `invoice_payment` (sai do caixa da conta) e marca a fatura como paga.
- Fatura ganha status derivado: `paid` quando existe `invoice_payment` correspondente ao `invoiceKey`.

### 3. Tela de Fatura detalhada
- Nova rota `/faturas/$cardId/$invoiceKey` — cabeçalho com cartão, ciclo (fechamento→vencimento), total, status, lista de itens (descrição, categoria, parcela x/y, valor), botão **Pagar fatura**.
- Link "Ver fatura" em cada linha de fatura na tela `/cartoes`.

### 4. Contas Recorrentes
- Novo campo em `Transaction`: `recurrence?: { frequency: "monthly"; installments: number; parentId?: string }`.
- No formulário: checkbox **Repetir mensalmente** + input **por N meses**.
- Ao salvar, gerar N transações (uma por mês) com `parentId` apontando para a primeira, todas com `status = "pending"`.
- Ação **Deletar recorrência** remove todas as filhas + pai.

### 5. Financiamento completo
- Estender `Financing`: `paidInstallments: number`, `history: FinancingEvent[]` (pagamento/amortização com data e valor).
- Ações no store: `payFinancingInstallment(id, {accountId, date})`, `amortizeFinancing(id, {amount, accountId, date, mode: "reduzir_parcela" | "reduzir_prazo"})`.
- Ambas criam transação (tipo `expense` para juros + `amortization` para principal) que debitam a conta selecionada.
- Recalcular `outstanding`, `installment` e `paidInstallments` conforme sistema (SAC/PRICE).
- UI: cartão do financiamento mostra progresso (parcelas pagas / total, % amortizado), botões **Pagar parcela** e **Amortizar**, e histórico.

### 6. Patrimônio e Dashboard automáticos
- Verificar que Dashboard, `/patrimonio` e cards de resumo usam sempre `useFinance` — nada de valores hardcoded.
- Adicionar linha "Dívidas (financiamentos)" e "Patrimônio Líquido" no `/patrimonio` e no Dashboard.

---

## Arquivos afetados

**Novos:** `docs/*.md` (6), `src/routes/faturas.$cardId.$invoiceKey.tsx`, `src/features/financings/FinancingActions.tsx`.

**Modificados:** `src/types/index.ts`, `src/services/store.ts`, `src/hooks/useFinance.ts`, `src/utils/cards.ts`, `src/routes/cartoes.tsx`, `src/routes/contas.tsx`, `src/routes/financiamentos.tsx`, `src/routes/patrimonio.tsx`, `src/routes/index.tsx`, `src/features/transactions/TransactionsView.tsx`, `src/components/layout/AppSidebar.tsx` (link "Faturas" opcional).

---

## Critérios de aceite

- `/docs` completo e revisado.
- Editar conta não expõe campo de saldo atual; saldo muda ao criar/pagar transações.
- Compra no crédito não altera caixa; só o **Pagamento de Fatura** altera.
- Tela `/faturas/:cardId/:invoiceKey` renderiza itens + botão pagar.
- Recorrência gera N lançamentos com um clique.
- Financiamento suporta pagar parcela e amortizar (com efeito no saldo devedor e caixa).
- Dashboard e Patrimônio refletem tudo automaticamente.
