import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RangeFilter, type Preset } from "@/components/RangeFilter";
import { SpendingDialog } from "@/components/SpendingDialog";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryTotals,
  computeTotals,
  formatDate,
  formatMoney,
  presetRange,
  shopTotals,
  type Range,
} from "@/lib/calc";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/spending")({
  head: () => ({
    meta: [
      { title: "Spending — The Fuel Box" },
      {
        name: "description",
        content:
          "Client, shop and overall spending with category totals and full transaction logs for The Fuel Box.",
      },
      { property: "og:title", content: "Spending — The Fuel Box" },
      {
        property: "og:description",
        content: "Category totals, shop accounts and editable spending logs.",
      },
    ],
  }),
  component: SpendingPage,
});

function SpendingPage() {
  const { data, deleteSpending } = useApp();
  const c = data.settings.currency;
  const [preset, setPreset] = useState<Preset>("all");
  const [range, setRange] = useState<Range>(presetRange("all"));
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [category, setCategory] = useState("all");

  const t = computeTotals(data, range);
  const clientName = (id?: string) => data.clients.find((x) => x.id === id)?.name ?? "Client";

  const rows = t.spendings
    .filter((s) => (kind === "all" ? true : s.kind === kind))
    .filter((s) => (category === "all" ? true : s.category === category))
    .filter((s) => {
      const hay = `${s.category} ${s.shop ?? ""} ${s.note ?? ""} ${
        s.kind === "client" ? clientName(s.clientId) : s.kind
      }`.toLowerCase();
      return hay.includes(q.toLowerCase());
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <AppShell
      title="Spending"
      subtitle="Client, shop and overall expenses"
      actions={
        <SpendingDialog>
          <Button size="sm">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Spending</span>
          </Button>
        </SpendingDialog>
      }
    >
      <div className="space-y-6">
        <RangeFilter
          preset={preset}
          range={range}
          onChange={(p, r) => {
            setPreset(p);
            setRange(r);
          }}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Spending" value={formatMoney(t.totalSpending, c)} tone="destructive" />
          <StatCard label="Client Spending" value={formatMoney(t.clientSpending, c)} />
          <StatCard label="Shop Spending" value={formatMoney(t.shopSpending, c)} />
          <StatCard
            label="Overall Spending"
            value={formatMoney(t.overallSpending, c)}
            hint={`${formatMoney(t.allocationPerClient, c)} per active client`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 font-display text-base font-bold">Category totals</h2>
            <ul className="space-y-2">
              {categoryTotals(t.spendings, data.settings.categories).map((row) => {
                const pct = t.totalSpending ? (row.amount / t.totalSpending) * 100 : 0;
                return (
                  <li key={row.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{row.category}</span>
                      <span className="font-semibold">{formatMoney(row.amount, c)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 font-display text-base font-bold">Shop accounts</h2>
            <ul className="divide-y divide-border">
              {shopTotals(t.spendings, data.settings.shops).map((row) => (
                <li key={row.shop} className="flex items-center justify-between py-3 text-sm">
                  <span className="truncate">{row.shop}</span>
                  <span className="font-semibold">{formatMoney(row.amount, c)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-display text-base font-bold">Transaction log</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search client, shop, note"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {data.settings.categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ul className="mt-2 divide-y divide-border">
            {rows.map((s) => (
              <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {s.kind === "client"
                        ? clientName(s.clientId)
                        : s.kind === "shop"
                          ? `Shop · ${s.shop}`
                          : "Overall"}
                    </p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {s.category}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(s.date)}
                    {s.note ? ` · ${s.note}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm font-semibold text-destructive">
                    {formatMoney(s.amount, c)}
                  </span>
                  <SpendingDialog editing={s}>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </SpendingDialog>
                  <Button size="icon" variant="ghost" onClick={() => deleteSpending(s.id)} aria-label="Delete">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
            {rows.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">No spending matches these filters.</p>
            )}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
