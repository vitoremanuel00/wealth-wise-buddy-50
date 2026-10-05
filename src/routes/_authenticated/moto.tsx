import { createFileRoute } from "@tanstack/react-router";
import { EmptyModule } from "@/components/layout/EmptyModule";
import { useStore } from "@/services/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/moto")({
  head: () => ({ meta: [{ title: "Moto · ManyMoney" }] }),
  component: () => {
    const { motorcycle } = useStore();
    return (
      <EmptyModule
        title="Moto"
        subtitle="Modelo, seguro, IPVA, licenciamento, revisões, óleo e pneus."
      >
        <div className="max-w-sm mx-auto text-left">
          <Label>Modelo cadastrado</Label>
          <Input value={motorcycle.model} readOnly placeholder="Cadastre em Configurações" />
        </div>
      </EmptyModule>
    );
  },
});
