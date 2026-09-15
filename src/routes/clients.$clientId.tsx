import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PaymentDialog } from "@/components/PaymentDialog";
import { SpendingDialog } from "@/components/SpendingDialog";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { computeTotals, formatDate, formatMoney, presetRange } from "@/lib/calc";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/clients/$clientId")({
  head: () => ({
    meta: [
      { title: "Client detail — The Fuel Box" },
      {
        name: "description",
        content:
          "Client boxes, payments, box profit, direct spending, allocated overall share and final profit or loss.",
      },
      { property: "og:title", content: "Client detail — The Fuel Box" },
      {
        property: "og:description",
        content: "Full payment and expense history with profitability for one client.",
      },
    ],
  }),
  component: ClientDetail,
});

function ClientDetail() {
  const { clientId } = Route.useParams();
  const { data, updateClient, deletePayment, deleteSpending } = useApp();
  const c = data.settings.currency;
  const t = computeTotals(data, presetRange("all"));
  const stats = t.clientStats.find((s) => s.client.id === clientId);

  if (!stats) {
    return (
      <AppShell title="Client not found">
        <Link to="/clients" className="text-sm font-medium text-primary">
          Back to clients
        </Link>
      </AppShell>
    );
  }

  const payments = data.payments
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const spendings = data.spendings
    .filter((s) => s.clientId === clientId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <AppShell
      title={stats.client.name}
      subtitle={`Client since ${formatDate(stats.client.createdAt)}`}
      actions={
        <PaymentDialog fixedClientId={clientId}>
          <Button size="sm">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Payment</span>
          </Button>
        </PaymentDialog>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All clients
          </Link>
          <Badge
            variant={stats.finalProfit >= 0 ? "default" : "destructive"}
            className={stats.finalProfit >= 0 ? "bg-success text-success-foreground" : ""}
          >
            {stats.finalProfit >= 0 ? "Profitable" : "Loss"} · {formatMoney(stats.finalProfit, c)}
          </Badge>
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            Active client
            <Switch
              checked={stats.client.active}
              onCheckedChange={(v) => updateClient(clientId, { active: v })}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Boxes" value={String(stats.boxes)} />
          <StatCard label="Total Payment" value={formatMoney(stats.payments, c)} />
          <StatCard
            label="Box Profit"
            value={formatMoney(stats.boxProfit, c)}
            hint={`${stats.boxes} × ${formatMoney(t.profitPerBox, c)}`}
            tone="success"
          />
          <StatCard label="Direct Spending" value={formatMoney(stats.directSpending, c)} />
          <StatCard
            label="Allocated Overall Share"
            value={formatMoney(stats.allocatedSpending, c)}
            hint={`${formatMoney(t.overallSpending, c)} ÷ ${t.activeClients} active`}
          />
          <StatCard
            label="Final Profit / Loss"
            value={formatMoney(stats.finalProfit, c)}
            tone={stats.finalProfit >= 0 ? "success" : "destructive"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 font-display text-base font-bold">Payment history</h2>
            <ul className="divide-y divide-border">
              {payments.map((p) => (
                <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {formatMoney(p.amount, c)} · {p.boxes} boxes
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.paymentType} × {p.duration} · {formatDate(p.date)} · box profit{" "}
                      {formatMoney(p.boxes * t.profitPerBox, c)}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deletePayment(p.id)} aria-label="Delete payment">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
              {payments.length === 0 && <p className="py-3 text-sm text-muted-foreground">No payments yet.</p>}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold">Client expenses</h2>
              <SpendingDialog fixedClientId={clientId}>
                <Button size="sm" variant="outline">
                  <Plus className="size-4" /> Add
                </Button>
              </SpendingDialog>
            </div>
            <ul className="divide-y divide-border">
              {spendings.map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {formatMoney(s.amount, c)} · {s.category}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(s.date)}
                      {s.note ? ` · ${s.note}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <SpendingDialog editing={s}>
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </SpendingDialog>
                    <Button size="icon" variant="ghost" onClick={() => deleteSpending(s.id)} aria-label="Delete spending">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
              {spendings.length === 0 && (
                <p className="py-3 text-sm text-muted-foreground">No direct spending recorded.</p>
              )}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
