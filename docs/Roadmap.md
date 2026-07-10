# Roadmap — ManyMoney

## Fase 0 — Fundação (concluída)
- Estrutura de rotas, sidebar, tokens de design.
- CRUD local (Zustand + localStorage).
- Dashboard, Fluxo, Contas, Cartões, Patrimônio, Investimentos,
  Financiamentos (básico), Metas, Viagens.

## Fase 1 — Padrão Profissional (Sprint 01)
- Documentação completa em `/docs`.
- Contas com saldo automático (nunca editado à mão).
- Cartões com fluxo de **Pagamento de Fatura**.
- Tela dedicada de **Fatura** (`/faturas/:cardId/:invoiceKey`).
- **Contas recorrentes** (contas fixas geradas por N meses).
- Financiamento completo (SAC/PRICE) com **pagar parcela** e **amortizar**,
  histórico e recálculo automático.
- Patrimônio e Dashboard 100% derivados.

## Fase 2 — Integração Cloud
- Substituir persistência local por Supabase.
- Auth (email/senha + Google).
- RLS por usuário; migração de schema.
- Sincronização entre dispositivos.

## Fase 3 — Automação Inteligente
- Importação de extrato (OFX/CSV).
- Categorização automática com IA (Lovable AI Gateway).
- Relatórios PDF mensais.
- Alertas por e-mail (vencimento de fatura, meta atingida).

## Fase 4 — Multi-usuário e Mobile
- Compartilhamento de contas familiares (papéis owner/viewer).
- PWA instalável (offline-first).
- App mobile (Capacitor) — reaproveita telas.

## Fase 5 — Inteligência Financeira
- Projeção de fluxo de caixa (12 meses).
- Sugestão automática de amortização ideal.
- Comparador de investimentos com IPCA / CDI.
