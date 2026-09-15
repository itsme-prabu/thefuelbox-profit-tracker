import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RangeFilter, type Preset } from "@/components/RangeFilter";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { computeTotals, formatMoney, presetRange, type Range } from "@/lib/calc";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — The Fuel Box" },
      {
        name: "description",
        content:
          "Daily, weekly, monthly and custom-range business reports with client-wise profit comparison.",
      },
      { property: "og:title", content: "Reports — The Fuel Box" },
      {
        property: "og:description",
        content: "Overall and client-wise reports for boxes, payments, spending and profit.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useApp();
  const c = data.settings.currency;
  const [preset, setPreset] = useState<Preset>("month");
  const [range, setRange] = useState<Range>(presetRange("month"));
  const [q, setQ] = useState("");

  const t = computeTotals(data, range);
  const rows = t.clientStats
    .filter((s) => s.client.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.finalProfit - a.finalProfit);

  return (
    <AppShell title="Reports" subtitle={`${range.from} → ${range.to}`}>
      <div className="space-y-6">
        <RangeFilter
          preset={preset}
          range={range}
          onChange={(p, r) => {
            setPreset(p);
            setRange(r);
          }}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Amount" value={formatMoney(t.totalAmount, c)} tone="primary" />
          <StatCard label="Total Boxes" value={String(t.totalBoxes)} />
          <StatCard label="Payments" value={String(t.totalPaymentsCount)} />
          <StatCard label="Box Profit" value={formatMoney(t.totalBoxProfit, c)} tone="success" />
          <StatCard label="Spending" value={formatMoney(t.totalSpending, c)} tone="destructive" />
          <StatCard
            label="Final Profit / Loss"
            value={formatMoney(t.finalProfit, c)}
            tone={t.finalProfit >= 0 ? "success" : "destructive"}
          />
        </div>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="font-display text-base font-bold">Client-wise breakdown</h2>
            <div className="relative w-40 sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search client"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Boxes</TableHead>
                  <TableHead className="text-right">Payments</TableHead>
                  <TableHead className="text-right">Box Profit</TableHead>
                  <TableHead className="text-right">Spending</TableHead>
                  <TableHead className="text-right">Final P/L</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.client.id}>
                    <TableCell className="font-medium">{s.client.name}</TableCell>
                    <TableCell className="text-right">{s.boxes}</TableCell>
                    <TableCell className="text-right">{formatMoney(s.payments, c)}</TableCell>
                    <TableCell className="text-right">{formatMoney(s.boxProfit, c)}</TableCell>
                    <TableCell className="text-right">{formatMoney(s.totalSpending, c)}</TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        s.finalProfit >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {formatMoney(s.finalProfit, c)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={s.finalProfit >= 0 ? "default" : "destructive"}
                        className={s.finalProfit >= 0 ? "bg-success text-success-foreground" : ""}
                      >
                        {s.finalProfit >= 0 ? "Profit" : "Loss"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
