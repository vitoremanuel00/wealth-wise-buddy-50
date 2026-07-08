import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/services/store";
import type { Category } from "@/types";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · ManyMoney" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const { categories, addCategory, deleteCategory, currency, reset } = useStore();
  const [form, setForm] = useState<Omit<Category, "id">>({ name: "", type: "expense", color: "#ef4444" });

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Categorias, moeda e dados." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Categorias</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Category["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="opening_balance">Saldo Inicial</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { if (!form.name) return; addCategory(form); toast.success("Categoria criada"); setForm({ name: "", type: "expense", color: "#ef4444" }); }} className="gap-2">
              <Plus className="size-4" /> Adicionar
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {categories.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ background: c.color }} />
                  {c.name}
                  <span className="text-xs text-muted-foreground">({categoryTypeLabel[c.type]})</span>
                </span>
                <Button size="icon" variant="ghost" onClick={() => deleteCategory(c.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">Preferências</h3>
            <Label>Moeda</Label>
            <Input value={currency} readOnly />
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-2">Dados</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Todos os dados estão persistidos localmente. No próximo release,
              serão migrados para Supabase mantendo a mesma API.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Apagar todos os dados?")) { reset(); toast.success("Dados resetados"); }
              }}
            >
              Resetar dados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
