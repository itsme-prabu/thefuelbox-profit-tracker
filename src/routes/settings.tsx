import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — The Fuel Box" },
      {
        name: "description",
        content:
          "Configure business name, profit per box, currency, spending categories and shop accounts.",
      },
      { property: "og:title", content: "Settings — The Fuel Box" },
      {
        property: "og:description",
        content: "Business preferences including the default profit per box.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, updateSettings, resetSampleData } = useApp();
  const s = data.settings;
  const [newCategory, setNewCategory] = useState("");
  const [newShop, setNewShop] = useState("");

  return (
    <AppShell title="Settings" subtitle="Business preferences and business rules">
      <div className="grid max-w-3xl gap-6">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-4 font-display text-base font-bold">Business</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Business name</Label>
              <Input
                value={s.businessName}
                onChange={(e) => updateSettings({ businessName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Input value={s.currency} onChange={(e) => updateSettings({ currency: e.target.value })} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Profit per box (default 40)</Label>
              <Input
                type="number"
                min="0"
                value={s.profitPerBox}
                onChange={(e) => updateSettings({ profitPerBox: Number(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Every box earns {s.currency}
                {s.profitPerBox}. All box profit figures recalculate automatically.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-4 font-display text-base font-bold">Spending categories</h2>
          <div className="flex flex-wrap gap-2">
            {s.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1 py-1.5">
                {cat}
                <button
                  onClick={() =>
                    updateSettings({ categories: s.categories.filter((x) => x !== cat) })
                  }
                  aria-label={`Remove ${cat}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button
              onClick={() => {
                const v = newCategory.trim();
                if (!v) return;
                updateSettings({ categories: [...new Set([...s.categories, v])] });
                setNewCategory("");
              }}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-4 font-display text-base font-bold">Shop accounts</h2>
          <div className="flex flex-wrap gap-2">
            {s.shops.map((shop) => (
              <Badge key={shop} variant="secondary" className="gap-1 py-1.5">
                {shop}
                <button
                  onClick={() => updateSettings({ shops: s.shops.filter((x) => x !== shop) })}
                  aria-label={`Remove ${shop}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="New shop" value={newShop} onChange={(e) => setNewShop(e.target.value)} />
            <Button
              onClick={() => {
                const v = newShop.trim();
                if (!v) return;
                updateSettings({ shops: [...new Set([...s.shops, v])] });
                setNewShop("");
              }}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 font-display text-base font-bold">Sample data</h2>
          <p className="text-sm text-muted-foreground">
            Restore the demo clients, payments and spending records.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              resetSampleData();
              toast.success("Sample data restored");
            }}
          >
            <RotateCcw className="size-4" /> Reset to sample data
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
