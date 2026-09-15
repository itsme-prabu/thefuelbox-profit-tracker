import type { AppData, Client, Payment, Spending } from "./data";

export type Range = { from: string; to: string };

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function shiftDays(days: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - days);
  return dt.toISOString().slice(0, 10);
}

export function presetRange(preset: "day" | "week" | "month" | "all"): Range {
  if (preset === "all") return { from: "1970-01-01", to: todayISO() };
  const days = preset === "day" ? 0 : preset === "week" ? 6 : 29;
  return { from: shiftDays(days), to: todayISO() };
}

export const inRange = (date: string, r: Range) => date >= r.from && date <= r.to;

export function formatMoney(amount: number, currency = "₹") {
  const n = Math.round(amount);
  return `${currency}${n.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string) {
  const dt = new Date(`${iso}T00:00:00`);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export type ClientStats = {
  client: Client;
  boxes: number;
  payments: number;
  boxProfit: number;
  directSpending: number;
  allocatedSpending: number;
  totalSpending: number;
  finalProfit: number;
};

export type Totals = {
  totalAmount: number;
  totalBoxes: number;
  totalPaymentsCount: number;
  profitPerBox: number;
  totalBoxProfit: number;
  totalSpending: number;
  clientSpending: number;
  shopSpending: number;
  overallSpending: number;
  finalProfit: number;
  activeClients: number;
  allocationPerClient: number;
  clientStats: ClientStats[];
  payments: Payment[];
  spendings: Spending[];
};

export function computeTotals(data: AppData, range: Range): Totals {
  const ppb = data.settings.profitPerBox;
  const payments = data.payments.filter((p) => inRange(p.date, range));
  const spendings = data.spendings.filter((s) => inRange(s.date, range));

  const totalAmount = payments.reduce((a, p) => a + p.amount, 0);
  const totalBoxes = payments.reduce((a, p) => a + p.boxes, 0);
  const totalBoxProfit = totalBoxes * ppb;

  const clientSpending = sum(spendings.filter((s) => s.kind === "client"));
  const shopSpending = sum(spendings.filter((s) => s.kind === "shop"));
  const overallSpending = sum(spendings.filter((s) => s.kind === "overall"));
  const totalSpending = clientSpending + shopSpending + overallSpending;

  const activeList = data.clients.filter((c) => c.active);
  const activeClients = activeList.length;
  const allocationPerClient = activeClients > 0 ? overallSpending / activeClients : 0;

  const clientStats: ClientStats[] = data.clients.map((client) => {
    const cp = payments.filter((p) => p.clientId === client.id);
    const boxes = cp.reduce((a, p) => a + p.boxes, 0);
    const paymentsTotal = cp.reduce((a, p) => a + p.amount, 0);
    const directSpending = sum(spendings.filter((s) => s.kind === "client" && s.clientId === client.id));
    const allocatedSpending = client.active ? allocationPerClient : 0;
    const boxProfit = boxes * ppb;
    return {
      client,
      boxes,
      payments: paymentsTotal,
      boxProfit,
      directSpending,
      allocatedSpending,
      totalSpending: directSpending + allocatedSpending,
      finalProfit: boxProfit - directSpending - allocatedSpending,
    };
  });

  return {
    totalAmount,
    totalBoxes,
    totalPaymentsCount: payments.length,
    profitPerBox: ppb,
    totalBoxProfit,
    totalSpending,
    clientSpending,
    shopSpending,
    overallSpending,
    finalProfit: totalBoxProfit - totalSpending,
    activeClients,
    allocationPerClient,
    clientStats,
    payments,
    spendings,
  };
}

const sum = (list: Spending[]) => list.reduce((a, s) => a + s.amount, 0);

export function categoryTotals(spendings: Spending[], categories: string[]) {
  return categories
    .map((category) => ({
      category,
      amount: spendings.filter((s) => s.category === category).reduce((a, s) => a + s.amount, 0),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function shopTotals(spendings: Spending[], shops: string[]) {
  return shops
    .map((shop) => ({
      shop,
      amount: spendings
        .filter((s) => s.kind === "shop" && s.shop === shop)
        .reduce((a, s) => a + s.amount, 0),
    }))
    .sort((a, b) => b.amount - a.amount);
}
