import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/features/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/services/store";
import { brl, dateBR } from "@/utils/format";
import { Landmark, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/mercado-pago")({
  head: () => ({ meta: [{ title: "Mercado Pago · ManyMoney" }] }),
  component: MercadoPagoPage,
});

function MercadoPagoPage() {
  const { mercadoPago, setMercadoPago, addMercadoPagoEntry } = useStore();
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"aporte" | "retirada" | "rendimento">("aporte");

  const cdi = mercadoPago.cdiPercent;
  // Aproximação: CDI ~ 11,15% a.a.
  const anualRate = 0.1115 * (cdi / 100);
  const rendMonth = mercadoPago.balance * (Math.pow(1 + anualRate, 1 / 12) - 1);
  const rendDay = mercadoPago.balance * (Math.pow(1 + anualRate, 1 / 365) - 1);
  const rendYear = mercadoPago.balance * anualRate;

  return (
    <div>
      <PageHeader title="Mercado Pago" subtitle="Saldo e rendimento diário estimado." />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Saldo" value={brl(mercadoPago.balance)} icon={Landmark} tone="accent" />
        <StatCard label="Rendimento diário" value={brl(rendDay)} icon={TrendingUp} tone="success" />
        <StatCard label="Rendimento mensal" value={brl(rendMonth)} tone="success" />
        <StatCard label="Rendimento anual" value={brl(rendYear)} tone="success" />
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Configuração</h3>
          <Label>% do CDI</Label>
          <Input
            type="number"
            value={mercadoPago.cdiPercent}
            onChange={(e) => setMercadoPago({ cdiPercent: +e.target.value })}
          />
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Movimentação</h3>
          <div className="grid gap-3">
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aporte">Aporte</SelectItem>
                <SelectItem value="retirada">Retirada</SelectItem>
                <SelectItem value="rendimento">Rendimento</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Valor" value={amount} onChange={(e) => setAmount(+e.target.value)} />
            <Button onClick={() => {
              if (!amount) return;
              addMercadoPagoEntry({ type, amount });
              toast.success("Registrado");
              setAmount(0);
            }}>Registrar</Button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold mb-4">Histórico</h3>
          {mercadoPago.history.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem movimentações.</div>
          ) : (
            <ul className="divide-y divide-border max-h-80 overflow-y-auto">
              {mercadoPago.history.map((h) => (
                <li key={h.id} className="py-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{dateBR(h.date)} · {h.type}</span>
                  <span className="number-tabular">{brl(h.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
