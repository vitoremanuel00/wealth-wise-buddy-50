# Arquitetura — ManyMoney

## Stack

- **React 19** + **TanStack Start v1** (SSR + file-based routing).
- **Vite 7** como bundler.
- **TypeScript strict**.
- **Tailwind v4** (tokens em `src/styles.css`) + **shadcn/ui** (Radix).
- **Zustand** (`persist` → `localStorage`) — camada de dados atual.
- **TanStack Query** — pronto para dados remotos (Supabase).
- **Recharts** — gráficos.
- **Framer Motion** — micro-interações.
- **Zod** + **react-hook-form** — validação de formulários.

## Padrão Feature-Based

```
src/
├─ routes/              ← file-based routes (URL == arquivo)
├─ features/            ← módulos de negócio (Dashboard, Transactions, …)
│  └─ <feature>/…       ← componentes + hooks internos da feature
├─ components/
│  ├─ layout/           ← Sidebar, PageHeader, etc.
│  └─ ui/               ← primitivos shadcn
├─ hooks/               ← hooks reutilizáveis (useFinance, useMobile)
├─ services/
│  └─ store.ts          ← Zustand (fonte única da verdade)
├─ utils/               ← helpers puros (format, cards, financing)
├─ types/               ← tipos de domínio
└─ styles.css           ← tokens e utilidades globais
```

## Camadas

```
routes  →  features  →  hooks/useFinance  →  services/store  →  storage
                    ↘  utils/*  ↗
```

- **routes/** só orquestra layout + componentes de feature.
- **features/** contém UI e lógica local. Não fala direto com storage.
- **hooks/useFinance** é o único ponto que deriva saldos e patrimônio.
- **services/store** é a única API de leitura/escrita de estado.
- **utils/** são puros (sem estado, sem React).

## Migração planejada para Supabase

O `store` isola a persistência. Para migrar:

1. Substituir `zustand/persist` por um repositório assíncrono
   (`AccountsRepo`, `TransactionsRepo`, …) que fala com o cliente Supabase.
2. Hidratar via `useQuery` no bootstrap; `useMutation` para escritas.
3. Manter as mesmas assinaturas de ações (`addTransaction`, `payInvoice`, …).
4. RLS: uma tabela por entidade, `user_id` obrigatório, políticas por `auth.uid()`.

## Convenções de código

- Componentes de rota exportam `Route = createFileRoute(...)` e a função
  componente é declarada abaixo.
- Formulários: `react-hook-form` + `zodResolver`.
- Sem `any`. Sem `as` em valores inferidos pelo Router.
- Nunca hardcodar cores — usar tokens (`bg-primary`, `text-muted-foreground`).
- Sem acesso direto a `localStorage` fora do `store`.
- Toda tela derivada usa o `useFinance` — NUNCA repete cálculos.
