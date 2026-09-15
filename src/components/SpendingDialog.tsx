import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney, todayISO } from "@/lib/calc";
import type { Spending, SpendingKind } from "@/lib/data";
import { useApp } from "@/lib/store";

export function SpendingDialog({
  children,
  editing,
  fixedClientId,
}: {
  children: ReactNode;
  editing?: Spending;
  fixedClientId?: string;
}) {
  const { data, addSpending, updateSpending } = useApp();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SpendingKind>(fixedClientId ? "client" : "overall");
  const [clientId, setClientId] = useState(fixedClientId ?? "");
  const [shop, setShop] = useState(data.settings.shops[0] ?? "Others");
  const [category, setCategory] = useState(data.settings.categories[0] ?? "Others");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setKind(editing.kind);
      setClientId(editing.clientId ?? "");
      setShop(editing.shop ?? data.settings.shops[0] ?? "Others");
      setCategory(editing.category);
      setAmount(String(editing.amount));
      setDate(editing.date);
      setNote(editing.note ?? "");
    } else {
      setKind(fixedClientId ? "client" : "overall");
      setClientId(fixedClientId ?? "");
      setAmount("");
      setNote("");
      setDate(todayISO());
    }
  }, [open, editing, fixedClientId, data.settings.shops]);

  const activeClients = data.clients.filter((c) => c.active).length;

  const submit = () => {
    const value = Number(amount);
    if (!value) {
      toast.error("Enter an amount");
      return;
    }
    if (kind === "client" && !clientId) {
      toast.error("Select a client");
      return;
    }
    const payload = {
      kind,
      clientId: kind === "client" ? clientId : undefined,
      shop: kind === "shop" ? shop : undefined,
      category,
      amount: value,
      date,
      note: note.trim() || undefined,
    };
    if (editing) {
      updateSpending(editing.id, payload);
      toast.success("Spending updated");
    } else {
      addSpending(payload);
      toast.success("Spending added");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit spending" : "Add spending"}</DialogTitle>
          <DialogDescription>
            Overall spending is shared equally among active clients.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Spending type</Label>
            <Select value={kind} onValueChange={(v: SpendingKind) => setKind(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client spending</SelectItem>
                <SelectItem value="shop">Shop spending</SelectItem>
                <SelectItem value="overall">Overall spending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {kind === "client" && (
            <div className="grid gap-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {data.clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {kind === "shop" && (
            <div className="grid gap-2">
              <Label>Shop account</Label>
              <Select value={shop} onValueChange={setShop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.settings.shops.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.settings.categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <Input
                placeholder="Optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {kind === "overall" && Number(amount) > 0 && activeClients > 0 && (
            <div className="rounded-2xl bg-secondary p-4 text-secondary-foreground">
              <p className="text-xs opacity-80">Share per active client</p>
              <p className="font-display text-2xl font-bold">
                {formatMoney(Number(amount) / activeClients, data.settings.currency)}
              </p>
              <p className="text-xs opacity-70">
                {formatMoney(Number(amount), data.settings.currency)} ÷ {activeClients} active clients
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={submit} className="w-full sm:w-auto">
            {editing ? "Update spending" : "Save spending"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
