# Modelo de Dados — ManyMoney

Persistência atual: Zustand + `localStorage` (chave `manymoney-store-v1`).
Estrutura preparada para migração ao Supabase (ver `Architecture.md`).

## Diagrama

```text
                 ┌────────────┐         ┌────────────┐
                 │  Account   │         │ CreditCard │
                 │────────────│         │────────────│
                 │ id         │◄────┐   │ id         │
                 │ name       │     │   │ name       │
                 │ color      │     │   │ limit      │
                 │ initialBal │     │   │ closingDay │
                 └────────────┘     │   │ dueDay     │
                       ▲            │   │ accountId  │──┐
                       │            │   └────────────┘  │
                       │ accountId  │ cardId            │
                       │            │                   │
                 ┌─────┴──────────────────────────┐     │
                 │           Transaction          │     │
                 │────────────────────────────────│     │
                 │ id                             │     │
                 │ description                    │     │
                 │ type (income|expense|          │     │
                 │       transfer|investment|     │     │
                 │       amortization|            │     │
                 │       opening_balance|         │     │
                 │       invoice_payment)         │     │
                 │ amount, date, status           │     │
                 │ category                       │     │
                 │ paymentMethod                  │     │
                 │ cardId, installments,          │─────┘
                 │ purchaseDate                   │
                 │ invoiceKey (YYYY-MM)           │  ← para invoice_payment
                 │ financingId                    │  ← para pagamento/amortização
                 │ recurrence { frequency,        │
                 │              installments,     │
                 │              parentId }        │
                 └────────────────────────────────┘

┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
│ Investment │   │ Financing  │   │  Category  │   │    Goal    │
└────────────┘   └────────────┘   └────────────┘   └────────────┘
```

## Entidades

### Account
| Campo          | Tipo   | Observação                          |
|----------------|--------|-------------------------------------|
| id             | UUID   | PK                                  |
| name           | string | ex.: "Nubank"                       |
| color          | string | hex                                 |
| icon           | string | lucide slug                         |
| initialBalance | number | saldo inicial (data de criação)     |

Saldo atual é **derivado** de `Transaction`; não é armazenado.

### CreditCard
| Campo      | Tipo   | Observação                         |
|------------|--------|------------------------------------|
| id         | UUID   | PK                                 |
| name       | string |                                    |
| limit      | number | limite total                       |
| closingDay | 1..31  | dia do fechamento                  |
| dueDay     | 1..31  | dia do vencimento                  |
| accountId  | UUID?  | conta preferida para pagar fatura  |
| color      | string | hex                                |

Faturas são **derivadas** das compras (`type=expense`, `paymentMethod=credito`).

### Transaction
| Campo          | Tipo                 | Observação                                                       |
|----------------|----------------------|------------------------------------------------------------------|
| id             | UUID                 | PK                                                               |
| description    | string               |                                                                  |
| category       | string?              | nome (link fraco para `Category.name`)                           |
| accountId      | UUID?                | obrigatório para tudo que afeta caixa                            |
| type           | enum                 | ver BusinessRules §1                                             |
| amount         | number > 0           |                                                                  |
| date           | ISO date             |                                                                  |
| status         | paid \| pending \| cancelled |                                                          |
| paymentMethod  | enum?                | obrigatório em `expense`                                         |
| cardId         | UUID?                | obrigatório se `paymentMethod = credito`                         |
| installments   | int 1..48?           | idem                                                             |
| purchaseDate   | ISO date?            | idem                                                             |
| invoiceKey     | `YYYY-MM`?           | apenas em `invoice_payment` — identifica a fatura paga           |
| financingId    | UUID?                | apenas em pagamentos/amortizações de financiamento               |
| recurrence     | objeto?              | `{ frequency: "monthly", installments: N, parentId? }`           |
| notes          | string?              |                                                                  |
| createdAt      | ISO date-time        |                                                                  |

### Financing
| Campo             | Tipo         | Observação                             |
|-------------------|--------------|----------------------------------------|
| id                | UUID         | PK                                     |
| bank              | string       |                                        |
| financed          | number       | valor original                         |
| outstanding       | number       | saldo devedor atual (derivado)         |
| system            | SAC \| PRICE |                                        |
| rate              | number       | % ao ano                               |
| months            | int          | prazo total                            |
| installment       | number       | parcela atual (recalculada)            |
| amortized         | number       | total amortizado extra acumulado       |
| paidInstallments  | int          | parcelas já pagas                      |
| history           | evento[]     | `{ id, date, type, amount, accountId }`|

Tipos de evento no histórico:
- `payment` — pagamento de parcela regular.
- `amortization` — amortização extra.

### Category
`{ id, name, type: income|expense|investment|opening_balance, color }`

### Investment / Goal / Trip / HouseItem / Motorcycle / MercadoPago
Ver `src/types/index.ts` — sem mudanças estruturais nesta sprint.

## Índices lógicos (para PostgreSQL futuro)
- `transactions (accountId, status, date)` — cálculo de saldo.
- `transactions (cardId, purchaseDate)` — expansão de faturas.
- `transactions (recurrence.parentId)` — recorrências.
- `transactions (financingId)` — histórico de financiamento.
