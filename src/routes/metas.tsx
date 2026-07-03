import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/services/store";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/metas")({
  head: () => ({ meta: [{ title: "Metas · ManyMoney" }] }),
  component: MetasPage,
});

function MetasPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", target: 0, current: 0, color: "#10b981" });

  return (
    <div>
      <PageHeader
        title="Metas"
        subtitle="Reserva, viagens, moto, projetos pessoais."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Nova meta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova meta</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Objetivo</Label><Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: +e.target.value })} /></div>
                  <div><Label>Atual</Label><Input type="number" value={form.current} onChange={(e) => setForm({ ...form, current: +e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => { if (!form.name) return; addGoal(form); toast.success("Meta criada"); setOpen(false); setForm({ name: "", target: 0, current: 0, color: "#10b981" }); }}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = Math.min(100, (g.current / Math.max(1, g.target)) * 100);
          return (
            <div key={g.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {brl(g.current)} de {brl(g.target)}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteGoal(g.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1"><Progress value={pct} /></div>
                <div className="text-sm font-semibold number-tabular">{pct.toFixed(0)}%</div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Adicionar valor"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = +(e.currentTarget.value || 0);
                      if (v) {
                        updateGoal(g.id, { current: g.current + v });
                        e.currentTarget.value = "";
                        toast.success("Atualizado");
                      }
                    }
                  }}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">Enter para somar</span>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">
            Nenhuma meta cadastrada.
          </div>
        )}
      </div>
    </div>
  );
}
