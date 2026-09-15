import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, Wallet, BarChart3, Settings as SettingsIcon, Box } from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/spending", label: "Spending", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { data } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Box className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold">{data.settings.businessName}</p>
            <p className="text-xs text-sidebar-foreground/60">Business Manager</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {[...nav, { to: "/settings", label: "Settings", icon: SettingsIcon }].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-sidebar-accent p-4 text-xs text-sidebar-accent-foreground/80">
          Profit per box
          <p className="font-display text-2xl font-bold text-sidebar-accent-foreground">
            {data.settings.currency}
            {data.settings.profitPerBox}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-4 backdrop-blur lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold text-foreground lg:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground lg:text-sm">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <Link
                to="/settings"
                className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                aria-label="Settings"
              >
                <SettingsIcon className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 lg:px-8 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              isActive(item.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
