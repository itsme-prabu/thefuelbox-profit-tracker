import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Box,
  IndianRupee,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PaymentDialog } from "@/components/PaymentDialog";
import { SpendingDialog } from "@/components/SpendingDialog";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { computeTotals, formatDate, formatMoney, presetRange } from "@/lib/calc";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Fuel Box — Business Dashboard" },
      {
        name: "description",
        content:
          "Track boxes, client payments, spending and profit per box for The Fuel Box meal delivery business.",
      },
      { property: "og:title", content: "The Fuel Box — Business Dashboard" },
      {
        property: "og:description",
        content: "Boxes, payments, spending and live profit tracking in one dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useApp();
  const c = data.settings.currency;
  const t = computeTotals(data, presetRange("all"));

  const recent = [
    ...t.payments.map((p) => ({
      id: p.id,
      date: p.date,
      label: data.clients.find((x) => x.id === p.clientId)?.name ?? "Client",
      detail: `${p.boxes} boxes · ${p.paymentType}`,
      amount: p.amount,
      positive: true,
    })),
    ...t.spendings.map((s) => ({
      id: s.id,
      date: s.date,
      label:
        s.kind === "client"
          ? (data.clients.find((x) => x.id === s.clientId)?.name ?? "Client spending")
          : s.kind === "shop"
            ? `Shop · ${s.shop}`
            : "Overall spending",
      detail: s.category,
      amount: s.amount,
      positive: false,
    })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  const ranked = [...t.clientStats].sort((a, b) => b.finalProfit - a.finalProfit);

  return (
    <AppShell
      title="Dashboard"
      subtitle={`${data.settings.businessName} · live business overview`}
      actions={
        <PaymentDialog>
          <Button size="sm" className="hidden sm:inline-flex">
            <Plus className="size-4" /> New Payment
          </Button>
        </PaymentDialog>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Amount"
            value={formatMoney(t.totalAmount, c)}
            hint={`${t.totalPaymentsCount} payments received`}
            icon={IndianRupee}
            tone="primary"
          />
          <StatCard
            label="Total Box Profit"
            value={formatMoney(t.totalBoxProfit, c)}
            hint={`${t.totalBoxes} boxes × ${formatMoney(t.profitPerBox, c)}`}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            label="Total Spending"
            value={formatMoney(t.totalSpending, c)}
            hint="Client + shop + overall"
            icon={TrendingDown}
            tone="destructive"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Clients" value={String(data.clients.length)} hint={`${t.activeClients} active`} icon={Users} />
          <StatCard label="Total Boxes" value={String(t.totalBoxes)} icon={Box} />
          <StatCard label="Payments Received" value={String(t.totalPaymentsCount)} icon={Receipt} />
          <StatCard label="Profit Per Box" value={formatMoney(t.profitPerBox, c)} hint="Set in Settings" icon={IndianRupee} />
          <StatCard label="Total Box Profit" value={formatMoney(t.totalBoxProfit, c)} icon={TrendingUp} />
          <StatCard
            label="Final Profit / Loss"
            value={formatMoney(t.finalProfit, c)}
            hint={t.finalProfit >= 0 ? "Profitable" : "In loss"}
            icon={Wallet}
            tone={t.finalProfit >= 0 ? "success" : "destructive"}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <PaymentDialog>
            <Button size="lg" className="h-14 w-full justify-start rounded-2xl text-base">
              <Plus className="size-5" /> New Client / Payment
            </Button>
          </PaymentDialog>
          <SpendingDialog>
            <Button
              size="lg"
              variant="secondary"
              className="h-14 w-full justify-start rounded-2xl text-base"
            >
              <Plus className="size-5" /> Add Spending
            </Button>
          </SpendingDialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Recent transactions</h2>
              <Link to="/spending" className="text-xs font-medium text-primary">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.detail} · {formatDate(r.date)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${r.positive ? "text-success" : "text-destructive"}`}
                  >
                    {r.positive ? "+" : "−"}
                    {formatMoney(r.amount, c)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Client profitability</h2>
              <Link to="/clients" className="text-xs font-medium text-primary">
                All clients
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {ranked.slice(0, 8).map((s) => (
                <li key={s.client.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to="/clients/$clientId"
                      params={{ clientId: s.client.id }}
                      className="flex min-w-0 items-center gap-1 text-sm font-medium hover:text-primary"
                    >
                      <span className="truncate">{s.client.name}</span>
                      <ArrowUpRight className="size-3.5 shrink-0 opacity-60" />
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.boxes} boxes · spend {formatMoney(s.totalSpending, c)}
                    </p>
                  </div>
                  <Badge
                    variant={s.finalProfit >= 0 ? "default" : "destructive"}
                    className={s.finalProfit >= 0 ? "bg-success text-success-foreground" : ""}
                  >
                    {formatMoney(s.finalProfit, c)}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
