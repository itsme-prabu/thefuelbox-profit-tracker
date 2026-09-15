export type PaymentType = "day" | "week" | "month";

export type Client = {
  id: string;
  name: string;
  phone?: string;
  active: boolean;
  createdAt: string;
};

export type Payment = {
  id: string;
  clientId: string;
  paymentType: PaymentType;
  duration: number;
  boxes: number;
  amount: number;
  date: string; // yyyy-mm-dd
  note?: string;
};

export type SpendingKind = "client" | "shop" | "overall";

export type Spending = {
  id: string;
  kind: SpendingKind;
  clientId?: string;
  shop?: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
};

export type Settings = {
  businessName: string;
  profitPerBox: number;
  currency: string;
  categories: string[];
  shops: string[];
};

export type AppData = {
  settings: Settings;
  clients: Client[];
  payments: Payment[];
  spendings: Spending[];
};

export const DEFAULT_SETTINGS: Settings = {
  businessName: "The Fuel Box",
  profitPerBox: 40,
  currency: "₹",
  categories: ["Non-Veg", "Fruits", "Vegetables", "Paneer", "Masala Items", "Others"],
  shops: ["Vikram", "Ajith", "Jinto", "Others"],
};

export const uid = () => Math.random().toString(36).slice(2, 10);

const d = (offset: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - offset);
  return dt.toISOString().slice(0, 10);
};

const clientNames = [
  "Anand Kumar",
  "Meera Nair",
  "Rahul Menon",
  "Sneha Pillai",
  "Vishnu Prasad",
  "Divya Raj",
  "Arjun Das",
  "Lakshmi Iyer",
  "Faisal Rahman",
  "Nithya Suresh",
];

export function seedData(): AppData {
  const clients: Client[] = clientNames.map((name, i) => ({
    id: `c${i + 1}`,
    name,
    phone: `98${(470000000 + i * 13571).toString().slice(0, 8)}`,
    active: i < 9,
    createdAt: d(60 - i * 3),
  }));

  const payments: Payment[] = [];
  const types: PaymentType[] = ["day", "week", "month"];
  clients.forEach((c, i) => {
    const count = 2 + (i % 3);
    for (let k = 0; k < count; k++) {
      const paymentType = types[(i + k) % 3];
      const duration = paymentType === "day" ? 1 : paymentType === "week" ? 7 : 30;
      const boxes = duration * (1 + ((i + k) % 3));
      payments.push({
        id: uid(),
        clientId: c.id,
        paymentType,
        duration,
        boxes,
        amount: boxes * (110 + ((i * 7 + k * 5) % 40)),
        date: d(2 + i * 2 + k * 5),
      });
    }
  });

  const cats = DEFAULT_SETTINGS.categories;
  const shops = DEFAULT_SETTINGS.shops;
  const spendings: Spending[] = [
    ...clients.slice(0, 6).map((c, i) => ({
      id: uid(),
      kind: "client" as const,
      clientId: c.id,
      category: cats[i % cats.length],
      amount: 400 + i * 260,
      date: d(3 + i * 3),
      note: `Extra items for ${c.name.split(" ")[0]}`,
    })),
    ...shops.map((s, i) => ({
      id: uid(),
      kind: "shop" as const,
      shop: s,
      category: cats[(i + 2) % cats.length],
      amount: 1200 + i * 850,
      date: d(1 + i * 4),
      note: `Weekly purchase — ${s}`,
    })),
    { id: uid(), kind: "overall", category: "Vegetables", amount: 1000, date: d(4), note: "Common vegetables" },
    { id: uid(), kind: "overall", category: "Masala Items", amount: 1800, date: d(9), note: "Monthly masala stock" },
    { id: uid(), kind: "overall", category: "Others", amount: 900, date: d(14), note: "Gas refill" },
  ];

  return { settings: DEFAULT_SETTINGS, clients, payments, spendings };
}
