import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive" | "accent";
  delay?: number;
}

const toneMap = {
  default: "text-foreground",
  success: "text-[color:var(--success)]",
  warning: "text-[color:var(--warning)]",
  destructive: "text-[color:var(--destructive)]",
  accent: "text-[color:var(--accent)]",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {Icon && (
          <div className="size-8 rounded-lg bg-muted/60 grid place-items-center">
            <Icon className={cn("size-4", toneMap[tone])} />
          </div>
        )}
      </div>
      <div
        className={cn(
          "mt-3 text-2xl md:text-[26px] font-semibold number-tabular",
          toneMap[tone],
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </motion.div>
  );
}
