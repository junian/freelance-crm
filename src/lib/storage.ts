import localforage from "localforage";
import type {
  Client,
  Interview,
  Invoice,
  Preferences,
  Proposal,
} from "./types";

const DB_NAME = "freelance-crm";

function makeStore<T>(name: string) {
  if (typeof window === "undefined") {
    // SSR stub — never touched at server render time in this app.
    return {
      async getAll(): Promise<T[]> {
        return [];
      },
      async get(_id: string): Promise<T | null> {
        return null;
      },
      async set(_id: string, _v: T): Promise<void> {},
      async remove(_id: string): Promise<void> {},
      async clear(): Promise<void> {},
      async setMany(_items: [string, T][]): Promise<void> {},
    };
  }
  const store = localforage.createInstance({
    name: DB_NAME,
    storeName: name,
  });
  return {
    async getAll(): Promise<T[]> {
      const items: T[] = [];
      await store.iterate<T, void>((v) => {
        items.push(v);
      });
      return items;
    },
    async get(id: string): Promise<T | null> {
      return (await store.getItem<T>(id)) ?? null;
    },
    async set(id: string, v: T): Promise<void> {
      await store.setItem(id, v);
    },
    async remove(id: string): Promise<void> {
      await store.removeItem(id);
    },
    async clear(): Promise<void> {
      await store.clear();
    },
    async setMany(items: [string, T][]): Promise<void> {
      for (const [id, v] of items) await store.setItem(id, v);
    },
  };
}

export const stores = {
  clients: makeStore<Client>("freelance-crm-clients"),
  proposals: makeStore<Proposal>("freelance-crm-proposals"),
  interviews: makeStore<Interview>("freelance-crm-interviews"),
  invoices: makeStore<Invoice>("freelance-crm-invoices"),
  preferences: makeStore<unknown>("freelance-crm-preferences"),
};

export const DEFAULT_PREFS: Preferences = {
  theme: "system",
  language: "en",
  defaultCurrency: "USD",
  seededDemo: false,
  hasDemoData: false,
  defaultIssuer: {
    name: "",
    contactLines: [],
    addressLines: [],
    taxId: "",
  },
};

export async function getPreferences(): Promise<Preferences> {
  const p = (await stores.preferences.get("prefs")) as Preferences | null;
  return { ...DEFAULT_PREFS, ...(p || {}) };
}

export async function savePreferences(p: Preferences): Promise<void> {
  await stores.preferences.set("prefs", p);
}

export const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));
