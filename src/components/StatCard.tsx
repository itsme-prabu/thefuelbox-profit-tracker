import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "destructive";
}) {
  const tones = {
    default: "bg-card text-card-foreground border-border",
    primary: "bg-primary text-primary-foreground border-transparent",
    success: "bg-success text-success-foreground border-transparent",
    destructive: "bg-destructive text-destructive-foreground border-transparent",
  } as const;

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", tones[tone])}>
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-xs font-medium", tone === "default" ? "text-muted-foreground" : "opacity-80")}>
          {label}
        </p>
        {Icon ? <Icon className="size-4 shrink-0 opacity-70" /> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
      {hint ? (
        <p className={cn("mt-1 text-xs", tone === "default" ? "text-muted-foreground" : "opacity-80")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
