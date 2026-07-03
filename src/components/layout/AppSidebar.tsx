import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Gem,
  Landmark,
  LineChart,
  Building2,
  Home,
  Bike,
  Target,
  Plane,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: LucideIcon };
type Section = { label: string; items: Item[] };

const nav: Section[] = [
  {
    label: "Visão Geral",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Fluxo Financeiro",
    items: [
      { to: "/fluxo", label: "Movimentações", icon: ArrowLeftRight },
      { to: "/receitas", label: "Receitas", icon: TrendingUp },
      { to: "/despesas", label: "Despesas", icon: TrendingDown },
      { to: "/cartoes", label: "Cartões", icon: CreditCard },
      { to: "/contas", label: "Contas", icon: Wallet },
    ],
  },
  {
    label: "Patrimônio",
    items: [
      { to: "/patrimonio", label: "Patrimônio", icon: Gem },
      { to: "/mercado-pago", label: "Mercado Pago", icon: Landmark },
      { to: "/investimentos", label: "Investimentos", icon: LineChart },
      { to: "/financiamentos", label: "Financiamentos", icon: Building2 },
      { to: "/casa", label: "Casa", icon: Home },
      { to: "/moto", label: "Moto", icon: Bike },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { to: "/metas", label: "Metas", icon: Target },
      { to: "/viagens", label: "Viagens", icon: Plane },
    ],
  },
  {
    label: "Sistema",
    items: [
      { to: "/relatorios", label: "Relatórios", icon: FileText },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-sidebar border-r border-sidebar-border shrink-0">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="size-8 rounded-lg bg-primary/15 grid place-items-center">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">ManyMoney</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Gestão patrimonial
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {nav.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        active
                          ? "text-sidebar-foreground bg-sidebar-accent"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="active-pill"
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border text-[11px] text-muted-foreground">
        MVP single-user · v0.1
      </div>
    </aside>
  );
}
