import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/services/store";
import { brl, dateBR } from "@/utils/format";
import type { PaymentMethod, TransactionStatus, TransactionType } from "@/types";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    description: z.string().min(1, "Obrigatório"),
    amount: z.coerce.number().positive("Valor > 0"),
    date: z.string().min(1),
    type: z.enum([
      "income",
      "expense",
      "transfer",
      "investment",
      "amortization",
      "opening_balance",
    ]),
    status: z.enum(["paid", "pending", "cancelled"]),
    category: z.string().optional(),
    accountId: z.string().optional(),
    paymentMethod: z
      .enum(["pix", "debito", "dinheiro", "transferencia", "credito"])
      .optional(),
    cardId: z.string().optional(),
    installments: z.coerce.number().int().min(1).max(48).optional(),
    purchaseDate: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type !== "transfer" && !v.category) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "Selecione a categoria" });
    }
    if (v.type === "expense" && !v.paymentMethod) {
      ctx.addIssue({ code: "custom", path: ["paymentMethod"], message: "Selecione a forma" });
    }
    if (v.paymentMethod === "credito") {
      if (!v.cardId)
        ctx.addIssue({ code: "custom", path: ["cardId"], message: "Selecione o cartão" });
      if (!v.purchaseDate)
        ctx.addIssue({ code: "custom", path: ["purchaseDate"], message: "Data obrigatória" });
    } else if (v.type !== "income" && v.type !== "transfer") {
      // non-credit outflows / opening balances still need an account
      if (!v.accountId)
        ctx.addIssue({ code: "custom", path: ["accountId"], message: "Selecione a conta" });
    }
  });

type FormValues = z.infer<typeof schema>;

const typeLabel: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
  transfer: "Transferência",
  investment: "Investimento",
  amortization: "Amortização",
  opening_balance: "Saldo Inicial",
};

const statusLabel: Record<TransactionStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
  cancelled: "Cancelado",
};

const paymentLabel: Record<PaymentMethod, string> = {
  pix: "PIX",
  debito: "Débito",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
  credito: "Crédito",
};

interface Props {
  defaultType?: TransactionType;
  title?: string;
  subtitle?: string;
  filterType?: TransactionType;
}

export function TransactionsView({ defaultType, title, subtitle, filterType }: Props) {
  const { transactions, accounts, categories, cards, addTransaction, deleteTransaction, updateTransaction } =
    useStore();
  const [open, setOpen] = useState(false);

  const list = filterType ? transactions.filter((t) => t.type === filterType) : transactions;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      type: defaultType ?? "expense",
      status: "paid",
      category: categories[0]?.name ?? "",
      accountId: accounts[0]?.id ?? "",
      paymentMethod: (defaultType ?? "expense") === "expense" ? "pix" : undefined,
      cardId: undefined,
      installments: 1,
      purchaseDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload = { ...values };
    if (payload.paymentMethod === "credito") {
      // Credit purchases don't hit an account — the invoice payment will.
      payload.accountId = undefined;
    } else {
      payload.cardId = undefined;
      payload.installments = undefined;
      payload.purchaseDate = undefined;
    }
    addTransaction(payload);
    toast.success("Movimentação registrada");
    form.reset({
      ...values,
      description: "",
      amount: 0,
      notes: "",
    });
    setOpen(false);
  };

  const type = form.watch("type");
  const categoryOptions =
    type === "transfer"
      ? []
      : type === "opening_balance"
        ? categories.filter((c) => c.type === "opening_balance")
        : categories.filter((c) => c.type === type);

  return (
    <div>
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {title ?? "Fluxo Financeiro"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle ?? "Registre todas as movimentações — receitas, despesas, transferências, investimentos e amortizações."}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" /> Nova movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova movimentação</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Descrição</Label>
                <Input {...form.register("description")} placeholder="Ex: Salário" />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" {...form.register("amount")} />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => {
                    form.setValue("type", v as TransactionType);
                    form.setValue("category", "");
                    if (v !== "expense") form.setValue("paymentMethod", undefined);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabel).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v as TransactionStatus)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabel).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {type !== "transfer" && (
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={form.watch("category") ?? ""}
                    onValueChange={(v) => form.setValue("category", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.length === 0 ? (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          Nenhuma categoria — cadastre em <b>Configurações</b>
                        </div>
                      ) : (
                        categoryOptions.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {type === "expense" && (
                <div>
                  <Label>Forma de pagamento</Label>
                  <Select
                    value={form.watch("paymentMethod") ?? ""}
                    onValueChange={(v) => form.setValue("paymentMethod", v as PaymentMethod)}
                  >
                    <SelectTrigger><SelectValue placeholder="Forma" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentLabel).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.watch("paymentMethod") !== "credito" && (
                <div>
                  <Label>Conta</Label>
                  <Select
                    value={form.watch("accountId") ?? ""}
                    onValueChange={(v) => form.setValue("accountId", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Conta" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.watch("paymentMethod") === "credito" && (
                <>
                  <div className="col-span-2">
                    <Label>Cartão</Label>
                    <Select
                      value={form.watch("cardId") ?? ""}
                      onValueChange={(v) => form.setValue("cardId", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione o cartão" /></SelectTrigger>
                      <SelectContent>
                        {cards.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                        {cards.length === 0 && (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">
                            Cadastre um cartão em <b>Cartões</b>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Parcelas</Label>
                    <Input
                      type="number"
                      min={1}
                      max={48}
                      {...form.register("installments")}
                    />
                  </div>
                  <div>
                    <Label>Data da compra</Label>
                    <Input type="date" {...form.register("purchaseDate")} />
                  </div>
                </>
              )}
              <div className="col-span-2">
                <Label>Observação</Label>
                <Textarea rows={2} {...form.register("notes")} />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.header>

      <div className="glass-card rounded-2xl overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhuma movimentação encontrada. Clique em <b>Nova movimentação</b>.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="p-3">Descrição</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Conta</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Data</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const account = accounts.find((a) => a.id === t.accountId);
                return (
                  <tr key={t.id} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="p-3">{t.description}</td>
                    <td className="p-3 text-muted-foreground">{t.category}</td>
                    <td className="p-3 text-muted-foreground">{account?.name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{typeLabel[t.type]}</td>
                    <td className="p-3 text-muted-foreground">{dateBR(t.date)}</td>
                    <td
                      className={cn(
                        "p-3 text-right number-tabular font-medium",
                        t.type === "income" && "text-emerald-400",
                        t.type === "expense" && "text-red-400",
                      )}
                    >
                      {t.type === "expense" ? "-" : "+"}
                      {brl(t.amount)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const next: TransactionStatus =
                            t.status === "paid" ? "pending" : t.status === "pending" ? "cancelled" : "paid";
                          updateTransaction(t.id, { status: next });
                        }}
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] uppercase tracking-wider px-2 py-1 rounded-full",
                          t.status === "paid" && "bg-emerald-500/15 text-emerald-400",
                          t.status === "pending" && "bg-amber-500/15 text-amber-400",
                          t.status === "cancelled" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {t.status === "paid" && <CheckCircle2 className="size-3" />}
                        {t.status === "pending" && <Clock className="size-3" />}
                        {t.status === "cancelled" && <XCircle className="size-3" />}
                        {statusLabel[t.status]}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          deleteTransaction(t.id);
                          toast.success("Removido");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
