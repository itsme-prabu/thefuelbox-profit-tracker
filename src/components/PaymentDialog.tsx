import { useState, type ReactNode } from "react";
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
import type { PaymentType } from "@/lib/data";
import { useApp } from "@/lib/store";

export function PaymentDialog({
  children,
  fixedClientId,
}: {
  children: ReactNode;
  fixedClientId?: string;
}) {
  const { data, addClient, addPayment } = useApp();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState(fixedClientId ?? "");
  const [newName, setNewName] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("month");
  const [duration, setDuration] = useState("30");
  const [boxes, setBoxes] = useState("30");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());

  const ppb = data.settings.profitPerBox;
  const boxProfit = (Number(boxes) || 0) * ppb;

  const reset = () => {
    setClientId(fixedClientId ?? "");
    setNewName("");
    setPaymentType("month");
    setDuration("30");
    setBoxes("30");
    setAmount("");
    setDate(todayISO());
  };

  const submit = () => {
    let id = clientId;
    if (!id || id === "__new") {
      if (!newName.trim()) {
        toast.error("Enter a client name");
        return;
      }
      id = addClient(newName).id;
    }
    if (!Number(boxes) || !Number(amount)) {
      toast.error("Enter boxes and payment amount");
      return;
    }
    addPayment({
      clientId: id,
      paymentType,
      duration: Number(duration) || 1,
      boxes: Number(boxes),
      amount: Number(amount),
      date,
    });
    toast.success(`Payment saved — box profit ${formatMoney(boxProfit, data.settings.currency)}`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Client / Payment</DialogTitle>
          <DialogDescription>
            Box profit is calculated automatically at {formatMoney(ppb, data.settings.currency)} per box.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {!fixedClientId && (
            <div className="grid gap-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client or add new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new">+ New client</SelectItem>
                  {data.clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!clientId || clientId === "__new") && (
                <Input
                  placeholder="Client name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Payment type</Label>
              <Select
                value={paymentType}
                onValueChange={(v: PaymentType) => {
                  setPaymentType(v);
                  setDuration(v === "day" ? "1" : v === "week" ? "7" : "30");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Duration ({paymentType}s)</Label>
              <Input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Number of boxes</Label>
              <Input type="number" min="0" value={boxes} onChange={(e) => setBoxes(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Payment amount</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="rounded-2xl bg-accent p-4 text-accent-foreground">
            <p className="text-xs font-medium opacity-80">Box profit</p>
            <p className="font-display text-2xl font-bold">
              {formatMoney(boxProfit, data.settings.currency)}
            </p>
            <p className="text-xs opacity-70">
              {Number(boxes) || 0} boxes × {formatMoney(ppb, data.settings.currency)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} className="w-full sm:w-auto">
            Save payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
