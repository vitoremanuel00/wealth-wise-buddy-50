# UI Guidelines — ManyMoney

Estética: **dark premium**, tipografia limpa, densidade média, foco em números.

## Tokens (definidos em `src/styles.css`)

- Cores: `--background`, `--foreground`, `--card`, `--muted`, `--primary`,
  `--accent`, `--border`, `--sidebar-*`.
- Sempre usar utilitários semânticos: `bg-background`, `text-foreground`,
  `text-muted-foreground`, `bg-card`, `border-border`.
- **Nunca** `bg-white`, `text-black`, `bg-[#hex]` em componentes.

Cores semânticas de status:
- Sucesso / positivo → `emerald-400 / emerald-500/15`
- Alerta / fatura aberta → `amber-300 / amber-500/15`
- Perigo / despesa → `red-400 / red-500/15`
- Info / futuro → `sky-300 / sky-500/15`

## Tipografia

- Títulos: `text-2xl md:text-3xl font-semibold tracking-tight`.
- Seções: `text-sm font-semibold`.
- Números monetários: `.number-tabular` (tabular-nums) + `font-medium`.
- Labels de tabela: `text-xs uppercase tracking-wider text-muted-foreground`.

## Espaçamento

Escala fixa: **4 / 8 / 12 / 16 / 24 / 32** (Tailwind `1 / 2 / 3 / 4 / 6 / 8`).

- Padding padrão de card: `p-5`.
- Gap padrão de grid: `gap-4`.
- Bloco entre seções: `mt-8`.

## Superfícies

- Card padrão: `.glass-card rounded-2xl` (raio grande = 16px).
- Tabela: `overflow-hidden` dentro do card; linhas `border-b border-border/60`.
- Divisor secundário: `divide-border/60`.

## Componentes reutilizáveis

- `PageHeader` — título + subtítulo + slot de ações à direita.
- `StatCard` — número grande + label + ícone + tone (`default | success | accent`).
- `Dialog` (shadcn) para todos os CRUDs; largura `max-w-lg` padrão.
- `Select` (shadcn) para todas as escolhas — nunca `<select>` nativo.

## Estados

- **Vazio:** `p-12 text-center text-sm text-muted-foreground` dentro do card.
  Sempre com CTA em negrito: "Clique em **Nova conta**".
- **Loading:** skeletons (`bg-muted/40 animate-pulse`) do tamanho do conteúdo.
- **Erro:** toast (`sonner`) — nunca alert nativo.

## Formulários

- Grid `grid-cols-2 gap-3` no dialog; campos largos usam `col-span-2`.
- Ordem: campos principais → opcionais → observações → botões.
- Botões alinhados à direita, `Cancelar` como `variant="ghost"`, `Salvar` primário.
- Feedback: toast `sonner` de sucesso/erro em toda operação.

## Ícones

- `lucide-react`, tamanho `size-4` inline, `size-5` em cards.
- Ícones circulares em `size-10 rounded-xl` com background 22% da cor.

## Animação

- Framer Motion para header (`initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}`).
- `layoutId` no pill de nav ativa (sidebar).
- Nunca animar valores monetários (leitura).
