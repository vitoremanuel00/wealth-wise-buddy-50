import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, CreditCard as CardIcon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/services/store";
import { brl } from "@/utils/format";

export const Route = createFileRoute("/cartoes")({
  head: () => ({ meta: [{ title: "Cartões · ManyMoney" }] }),
  component: CartoesPage,
});

function CartoesPage() {
  const { cards, addCard, deleteCard } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", limit: 0, closingDay: 1, dueDay: 10, color: "#8a05be" });

  return (
    <div>
      <PageHeader
        title="Cartões"
        subtitle="Cadastre limites, fechamentos e vencimentos."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="size-4" /> Novo cartão</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo cartão</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Limite</Label>
                  <Input type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: +e.target.value })} />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10" />
                </div>
                <div>
                  <Label>Fechamento (dia)</Label>
                  <Input type="number" min={1} max={31} value={form.closingDay} onChange={(e) => setForm({ ...form, closingDay: +e.target.value })} />
                </div>
                <div>
                  <Label>Vencimento (dia)</Label>
                  <Input type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: +e.target.value })} />
                </div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => {
                    if (!form.name) return;
                    addCard(form);
                    toast.success("Cartão criado");
                    setOpen(false);
                    setForm({ name: "", limit: 0, closingDay: 1, dueDay: 10, color: "#8a05be" });
                  }}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.id}
            className="relative rounded-2xl p-5 h-48 flex flex-col justify-between overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${c.color}, oklch(0.2 0.02 265))`,
            }}
          >
            <div className="flex items-start justify-between">
              <CardIcon className="size-6 text-white/90" />
              <button onClick={() => deleteCard(c.id)} className="text-white/70 hover:text-white">
                <Trash2 className="size-4" />
              </button>
            </div>
            <div>
              <div className="text-white/80 text-xs uppercase tracking-wider">Limite</div>
              <div className="text-white text-2xl font-semibold number-tabular">{brl(c.limit)}</div>
              <div className="mt-2 text-white/80 text-xs">
                {c.name} · fecha dia {c.closingDay} · vence dia {c.dueDay}
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">
            Nenhum cartão cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}
