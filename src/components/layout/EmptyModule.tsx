import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { Construction } from "lucide-react";

export function EmptyModule({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="glass-card rounded-2xl p-10 text-center">
        <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center mb-4">
          <Construction className="size-5 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Módulo em construção</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Este módulo já está estruturado no store central e pronto para receber a
          UI completa. Os dados persistem em <code>localStorage</code> e podem ser
          migrados para Supabase sem refatoração.
        </p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
