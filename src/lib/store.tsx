import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  uid,
  type AppData,
  type Client,
  type Payment,
  type Settings,
  type Spending,
} from "./data";

const KEY = "fuelbox.data.v2";

type Ctx = {
  data: AppData;
  ready: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  addClient: (name: string, phone?: string | undefined) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addPayment: (p: Omit<Payment, "id">) => void;
  deletePayment: (id: string) => void;
  addSpending: (s: Omit<Spending, "id">) => void;
  updateSpending: (id: string, patch: Partial<Spending>) => void;
  deleteSpending: (id: string) => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => ({
    settings: DEFAULT_SETTINGS,
    clients: [],
    payments: [],
    spendings: [],
  }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        setData({ ...seedEmpty(parsed) });
      } else {
        setData(seedEmpty({}));
      }
    } catch {
      setData(seedEmpty({}));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, ready]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const addClient = useCallback((name: string, phone?: string | undefined) => {
    const client: Client = {
      id: uid(),
      name: name.trim(),
      phone: phone ?? undefined,
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setData((d) => ({ ...d, clients: [client, ...d.clients] }));
    return client;
  }, []);

  const value: Ctx = useMemo(
    () => ({
      data,
      ready,
      updateSettings,
      addClient,
      updateClient: (id, patch) =>
        setData((d) => ({
          ...d,
          clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteClient: (id) =>
        setData((d) => ({
          ...d,
          clients: d.clients.filter((c) => c.id !== id),
          payments: d.payments.filter((p) => p.clientId !== id),
          spendings: d.spendings.filter((s) => s.clientId !== id),
        })),
      addPayment: (p) => setData((d) => ({ ...d, payments: [{ ...p, id: uid() }, ...d.payments] })),
      deletePayment: (id) =>
        setData((d) => ({ ...d, payments: d.payments.filter((p) => p.id !== id) })),
      addSpending: (s) =>
        setData((d) => ({ ...d, spendings: [{ ...s, id: uid() }, ...d.spendings] })),
      updateSpending: (id, patch) =>
        setData((d) => ({
          ...d,
          spendings: d.spendings.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      deleteSpending: (id) =>
        setData((d) => ({ ...d, spendings: d.spendings.filter((s) => s.id !== id) })),
    }),
    [data, ready, updateSettings, addClient],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function seedEmpty(d: Partial<AppData>): AppData {
  return {
    settings: { ...DEFAULT_SETTINGS, ...(d.settings ?? {}) },
    clients: d.clients ?? [],
    payments: d.payments ?? [],
    spendings: d.spendings ?? [],
  };
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
