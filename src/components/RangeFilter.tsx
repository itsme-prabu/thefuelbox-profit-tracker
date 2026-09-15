import { Input } from "@/components/ui/input";
import { presetRange, type Range } from "@/lib/calc";
import { cn } from "@/lib/utils";

export type Preset = "day" | "week" | "month" | "all" | "custom";

export function RangeFilter({
  preset,
  range,
  onChange,
}: {
  preset: Preset;
  range: Range;
  onChange: (preset: Preset, range: Range) => void;
}) {
  const presets: { key: Preset; label: string }[] = [
    { key: "day", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "all", label: "All time" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() =>
              onChange(p.key, p.key === "custom" ? range : presetRange(p.key as "day" | "week" | "month" | "all"))
            }
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              preset === p.key
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="grid grid-cols-2 gap-2 sm:max-w-md">
          <Input
            type="date"
            value={range.from}
            onChange={(e) => onChange("custom", { ...range, from: e.target.value })}
          />
          <Input
            type="date"
            value={range.to}
            onChange={(e) => onChange("custom", { ...range, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
