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
import { Switch } from "@/components/ui/switch";
import type { Client } from "@/lib/data";
import { useApp } from "@/lib/store";

export function ClientDialog({ children, editing }: { children: ReactNode; editing: Client }) {
  const { updateClient } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(editing.name);
  const [phone, setPhone] = useState(editing.phone ?? "");
  const [active, setActive] = useState(editing.active);

  useEffect(() => {
    if (!open) return;
    setName(editing.name);
    setPhone(editing.phone ?? "");
    setActive(editing.active);
  }, [editing, open]);

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Enter a client name");
      return;
    }
    updateClient(editing.id, { name: trimmedName, phone: phone.trim() || undefined, active });
    toast.success("Client updated");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>Update this client's details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client-name">Name</Label>
            <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-phone">Phone</Label>
            <Input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            Active client
            <Switch checked={active} onCheckedChange={setActive} />
          </label>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}