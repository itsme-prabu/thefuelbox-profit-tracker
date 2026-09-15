export type PaymentType = "day" | "week" | "month";

export type Client = {
  id: string;
  name: string;
  phone?: string | undefined;
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
  note?: string | undefined;
};

export type SpendingKind = "client" | "shop" | "overall";

export type Spending = {
  id: string;
  kind: SpendingKind;
  clientId?: string | undefined;
  shop?: string | undefined;
  category: string;
  amount: number;
  date: string;
  note?: string | undefined;
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
