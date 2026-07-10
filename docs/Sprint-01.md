# Sprint 01 — Padrão Profissional

## Objetivo
Consolidar o MVP em um sistema com regras de negócio corretas,
documentado e pronto para escalar.

## Escopo

### 1. Contas (`/contas`)
- Remover qualquer input de "saldo atual".
- Card da conta exibe: saldo inicial, entradas do mês, saídas do mês, saldo atual (derivado).
- Ao criar conta, apenas nome / saldo inicial / cor.

### 2. Cartões (`/cartoes`)
- Cartão exibe limite, utilizado, disponível, fatura aberta.
- Cada fatura tem botão **Pagar fatura** (abre modal com conta e data).
- Pagamento cria transação `invoice_payment` (debita conta, marca fatura como paga).
- Cada fatura tem link **Ver detalhes** → nova rota `/faturas/:cardId/:invoiceKey`.

### 3. Tela de Fatura (`/faturas/$cardId/$invoiceKey`)
- Cabeçalho: nome do cartão, ciclo (fechamento → vencimento), total, status.
- Lista de itens: descrição, categoria, parcela x/y, data da compra, valor.
- Ações: **Pagar fatura** (se aberta ou fechada).

### 4. Recorrência (formulário de movimentação)
- Checkbox **Repetir mensalmente**.
- Input **por N meses** (2..48).
- Salva N transações: a original + N-1 filhas com `parentId`.

### 5. Financiamento (`/financiamentos`)
- Cartão do financiamento com progresso (`paidInstallments/months`).
- Botão **Pagar parcela** — modal escolhe conta + data; cria `expense` linkada,
  atualiza saldo devedor e `paidInstallments`.
- Botão **Amortizar** — modal escolhe valor + conta + modo (reduzir parcela | reduzir prazo);
  cria `amortization`, recalcula parcela.
- Histórico do financiamento visível (último 10 eventos).

### 6. Patrimônio e Dashboard
- `/patrimonio` lista: caixa, MP, investimentos, dívidas, PL destacado.
- Dashboard tem card **Patrimônio Líquido**.
- Zero valor hardcoded.

## Critérios de aceite

- [ ] `/docs` completo (6 arquivos).
- [ ] Não existe input de "saldo atual" em `/contas`.
- [ ] Compra no crédito não muda saldo de conta.
- [ ] Ao pagar fatura, saldo da conta escolhida cai; fatura muda para "Paga".
- [ ] `/faturas/:cardId/:invoiceKey` acessível pelo botão da lista.
- [ ] Recorrência gera N transações com um clique; remover a mãe apaga todas.
- [ ] "Pagar parcela" e "Amortizar" reduzem `outstanding` e criam movimentação.
- [ ] Dashboard exibe Patrimônio Líquido corretamente com/sem financiamento.

## Checklist de QA

1. Criar conta "Nubank" com saldo inicial R$ 1.000.
2. Registrar receita "Salário" R$ 5.000, paga → saldo Nubank = 6.000.
3. Registrar despesa "Mercado" R$ 300 no débito Nubank → saldo = 5.700.
4. Cadastrar cartão "Nubank Ultravioleta" limite 10k, fecha 25, vence 5.
5. Registrar despesa R$ 1.200 no crédito em 3x → saldo Nubank inalterado (5.700).
6. Verificar fatura: parcelas de R$ 400 em 3 ciclos consecutivos.
7. Pagar fatura aberta debitando Nubank → saldo cai; fatura vira "Paga".
8. Criar despesa "Aluguel" R$ 1.500 recorrente por 12 meses → 12 transações pending.
9. Deletar a original → 11 filhas também somem.
10. Criar financiamento imóvel R$ 300k SAC 360 meses 10% a.a.
11. Pagar 1ª parcela debitando Nubank → `paidInstallments = 1`, `outstanding` cai.
12. Amortizar R$ 20k (reduzir parcela) → nova parcela menor, `outstanding` cai R$ 20k.
13. Dashboard: PL = caixa + investimentos + MP − outstanding financiamento.
