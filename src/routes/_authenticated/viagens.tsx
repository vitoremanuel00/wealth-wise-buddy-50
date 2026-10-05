import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Plane } from "lucide-react";
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
import { brl, dateBR } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/viagens")({
  head: () => ({ meta: [{ title: "Viagens · ManyMoney" }] }),
  component: ViagensPage,
});

function ViagensPage() {
  const { trips, addTrip, deleteTrip, updateTrip } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ destination: "", target: 0, saved: 0, date: new Date().toISOString().slice(0, 10) });

  return (
    <div>
      <PageHeader
        title="Viagens"
        subtitle="Planeje destinos e acompanhe o quanto já guardou."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Nova viagem</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova viagem</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Destino</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
                <div><Label>Data</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label>Valor total</Label><Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: +e.target.value })} /></div>
                <div><Label>Guardado</Label><Input type="number" value={form.saved} onChange={(e) => setForm({ ...form, saved: +e.target.value })} /></div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => { if (!form.destination) return; addTrip(form); toast.success("Viagem criada"); setOpen(false); }}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((t) => {
          const pct = Math.min(100, (t.saved / Math.max(1, t.target)) * 100);
          return (
            <div key={t.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-sky-500/15 text-sky-400 grid place-items-center">
                    <Plane className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium">{t.destination}</div>
                    <div className="text-xs text-muted-foreground">{dateBR(t.date)}</div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteTrip(t.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {brl(t.saved)} <span className="opacity-60">/ {brl(t.target)}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1"><Progress value={pct} /></div>
                <div className="text-sm font-semibold number-tabular">{pct.toFixed(0)}%</div>
              </div>
              <Input
                type="number"
                className="mt-3"
                placeholder="Guardar mais (Enter)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = +(e.currentTarget.value || 0);
                    if (v) {
                      updateTrip(t.id, { saved: t.saved + v });
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </div>
          );
        })}
        {trips.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">
            Nenhuma viagem cadastrada.
          </div>
        )}
      </div>
    </div>
  );
}
