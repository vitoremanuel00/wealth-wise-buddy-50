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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/services/store";
import { brl } from "@/utils/format";
import type { HouseItem } from "@/types";

export const Route = createFileRoute("/_authenticated/casa")({
  head: () => ({ meta: [{ title: "Casa · ManyMoney" }] }),
  component: CasaPage,
});

const catLabel: Record<HouseItem["category"], string> = {
  moveis: "Móveis", eletrodomesticos: "Eletrodomésticos", decoracao: "Decoração",
};
const statusLabel: Record<HouseItem["status"], string> = {
  pendente: "Pendente", comprado: "Comprado", pago: "Pago", instalado: "Instalado",
};

function CasaPage() {
  const { house, addHouseItem, updateHouseItem, deleteHouseItem } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<HouseItem, "id">>({ name: "", category: "moveis", status: "pendente", price: 0 });

  const total = house.length;
  const done = house.filter((i) => i.status === "instalado").length;
  const pct = total ? (done / total) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="Casa"
        subtitle="Checklist de móveis, eletrodomésticos e decoração."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" /> Novo item</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo item</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as HouseItem["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(catLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Preço estimado</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
                <div className="col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={() => { if (!form.name) return; addHouseItem(form); toast.success("Adicionado"); setOpen(false); setForm({ name: "", category: "moveis", status: "pendente", price: 0 }); }}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Progresso da casa</div>
            <div className="text-xs text-muted-foreground">{done} de {total} itens instalados</div>
          </div>
          <div className="text-2xl font-semibold number-tabular">{pct.toFixed(0)}%</div>
        </div>
        <Progress value={pct} />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {house.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Nenhum item no checklist.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="p-3">Item</th><th className="p-3">Categoria</th>
                <th className="p-3 text-right">Preço</th><th className="p-3">Status</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {house.map((i) => (
                <tr key={i.id} className="border-b border-border/60">
                  <td className="p-3">{i.name}</td>
                  <td className="p-3 text-muted-foreground">{catLabel[i.category]}</td>
                  <td className="p-3 text-right number-tabular">{brl(i.price ?? 0)}</td>
                  <td className="p-3">
                    <Select value={i.status} onValueChange={(v) => updateHouseItem(i.id, { status: v as HouseItem["status"] })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(statusLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => deleteHouseItem(i.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
