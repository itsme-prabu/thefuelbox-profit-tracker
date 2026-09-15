import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PaymentDialog } from "@/components/PaymentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeTotals, formatMoney, presetRange } from "@/lib/calc";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — The Fuel Box" },
      {
        name: "description",
        content: "All Fuel Box clients with boxes, payments, spending share and profit or loss.",
      },
      { property: "og:title", content: "Clients — The Fuel Box" },
      {
        property: "og:description",
        content: "Client list with boxes, payments and profitability at a glance.",
      },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const { data } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "profit" | "loss">("all");
  const c = data.settings.currency;
  const t = computeTotals(data, presetRange("all"));

  const list = t.clientStats
    .filter((s) => s.client.name.toLowerCase().includes(q.toLowerCase()))
    .filter((s) =>
      filter === "all" ? true : filter === "profit" ? s.finalProfit >= 0 : s.finalProfit < 0,
    )
    .sort((a, b) => b.finalProfit - a.finalProfit);

  return (
    <AppShell
      title="Clients"
      subtitle={`${data.clients.length} clients · ${t.activeClients} active`}
      actions={
        <PaymentDialog>
          <Button size="sm">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Client / Payment</span>
          </Button>
        </PaymentDialog>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search clients"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "profit", "loss"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <Link
              key={s.client.id}
              to="/clients/$clientId"
              params={{ clientId: s.client.id }}
              className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">{s.client.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.client.active ? "Active" : "Inactive"} · {s.boxes} boxes
                  </p>
                </div>
                <Badge
                  variant={s.finalProfit >= 0 ? "default" : "destructive"}
                  className={s.finalProfit >= 0 ? "bg-success text-success-foreground" : ""}
                >
                  {s.finalProfit >= 0 ? "Profitable" : "Loss"}
                </Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <Row label="Payments" value={formatMoney(s.payments, c)} />
                <Row label="Box profit" value={formatMoney(s.boxProfit, c)} />
                <Row label="Spending" value={formatMoney(s.totalSpending, c)} />
                <Row
                  label="Final P/L"
                  value={formatMoney(s.finalProfit, c)}
                  tone={s.finalProfit >= 0 ? "success" : "destructive"}
                />
              </dl>
            </Link>
          ))}
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">No clients match your search.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
}) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`font-display text-sm font-bold ${
          tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
