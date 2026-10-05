# My Financial Compass

Você é um Desenvolvedor Full Stack Senior especializado em React, TypeScript, UX/UI e arquitetura de software.

Crie um sistema chamado "ManyMoney".

O objetivo NÃO é ser um aplicativo de controle de gastos comum.

O objetivo é ser um sistema de Gestão Financeira e Patrimonial pessoal.

Este projeto será usado inicialmente por apenas um usuário (MVP).

NÃO implementar autenticação nesta versão.

NÃO implementar login.

NÃO implementar cadastro.

O sistema deve iniciar diretamente no Dashboard.

O projeto deverá ser preparado para futuramente receber autenticação Supabase sem grandes alterações.

======================================================

TECNOLOGIAS

Utilize obrigatoriamente:

- React

- Vite

- TypeScript

- TailwindCSS

- shadcn/ui

- React Router

- TanStack Query

- React Hook Form

- Zod

- Recharts

- Framer Motion

- Lucide React

Banco:

Supabase PostgreSQL

Hospedagem futura:

Vercel

======================================================

ARQUITETURA

Utilizar arquitetura Feature Based.

Organização:

src

components

features

dashboard

transactions

accounts

cards

investments

financing

goals

travel

motorcycle

house

reports

services

hooks

types

utils

pages

layouts

======================================================

DESIGN

Criar interface premium.

Inspirar-se em:

Nubank

Inter

Stripe Dashboard

Apple

Linear

Tema Dark.

Visual minimalista.

Muito espaço em branco.

Cards modernos.

Animações suaves.

Responsivo.

======================================================

MENU LATERAL

Dashboard

Fluxo Financeiro

Receitas

Despesas

Cartões

Contas

Patrimônio

Mercado Pago

Investimentos

Financiamentos

Casa

Moto

Metas

Viagens

Relatórios

Configurações

======================================================

DASHBOARD

Essa deve ser a principal tela.

Mostrar:

Patrimônio Atual

Patrimônio Líquido

Receita do mês

Despesa do mês

Saldo disponível

Investimentos

Total amortizado

Contas pendentes

Contas pagas

Gráficos:

Linha

Evolução do patrimônio

Pizza

Despesas por categoria

Barras

Receitas por categoria

Área

Fluxo de Caixa

Mostrar também:

Últimas movimentações

Próximos vencimentos

Metas

Alertas

======================================================

FLUXO FINANCEIRO

Toda movimentação deve possuir:

Descrição

Categoria

Conta

Tipo

Receita

Despesa

Transferência

Investimento

Amortização

Valor

Data

Observação

Status

Pago

Pendente

Cancelado

Ao marcar como "Pago"

Todos os indicadores do Dashboard devem atualizar automaticamente.

======================================================

CONTAS

Cadastrar contas.

Exemplos:

Mercado Pago

Santander

Caixa

Nubank

Dinheiro

Cada conta possui:

Saldo Inicial

Saldo Atual

Cor

Ícone

Histórico

======================================================

CARTÕES

Cadastrar cartões.

Limite

Fechamento

Vencimento

Parcelas

Fatura

Ao pagar a fatura

Atualizar automaticamente o saldo da conta vinculada.

======================================================

PATRIMÔNIO

Página exclusiva.

Mostrar:

Patrimônio Total

Patrimônio Líquido

Caixa

Investimentos

Veículos

Imóveis

Gráfico mensal

Gráfico anual

======================================================

MERCADO PAGO

Página exclusiva.

Campos:

Saldo

Percentual CDI

Rendimento Diário

Rendimento Mensal

Rendimento Anual

Aportes

Retiradas

Histórico

Permitir inserir rendimento manualmente.

======================================================

INVESTIMENTOS

Criar módulo.

Categorias:

FIIs

Ações

Tesouro

CDB

LCI

LCA

Cada investimento possui:

Quantidade

Preço Médio

Cotação

Dividendos

Rentabilidade

======================================================

FINANCIAMENTOS

Criar módulo.

Campos:

Banco

Valor Financiado

Saldo Devedor

Sistema

SAC

PRICE

Taxa

Prazo

Parcela

Amortizações

Criar simulador de amortização.

======================================================

CASA

Criar checklist.

Categoria

Móveis

Eletrodomésticos

Decoração

Status

Comprado

Pago

Instalado

Mostrar percentual da casa concluída.

======================================================

MOTO

Cadastrar:

Modelo

Seguro

Parcelas

IPVA

Licenciamento

Revisões

Troca de óleo

Pneus

======================================================

METAS

Permitir criar metas.

Exemplos:

Reserva

100 mil

250 mil

Viagem

Moto

Cada meta possui:

Valor atual

Objetivo

Percentual

Barra de progresso

======================================================

VIAGENS

Destino

Valor

Data

Valor Guardado

Percentual

======================================================

RELATÓRIOS

Mensal

Anual

Receitas

Despesas

Patrimônio

Exportar PDF

Exportar Excel

======================================================

CONFIGURAÇÕES

Categorias

Contas

Tema

Moeda

======================================================

IMPORTANTE

Todo o sistema deve ser preparado para crescimento.

Criar componentes reutilizáveis.

Separar lógica da interface.

Utilizar React Query.

Utilizar Zod.

Utilizar React Hook Form.

Utilizar Recharts.

Utilizar Framer Motion.

Não utilizar dados mockados espalhados pelo projeto.

Centralizar os dados.

Escrever código limpo.

Criar estrutura preparada para no futuro adicionar:

- Login

- Múltiplos usuários

- Open Finance

- IA financeira

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4298c9c4-50fa-49a7-a298-feae3844150b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
