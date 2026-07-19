import {
  createRxDatabase,
  addRxPlugin,
  type RxDatabase,
  type RxCollection,
  type RxStorage,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import type {
  Client,
  Interview,
  Invoice,
  Preferences,
  Proposal,
} from "./types";

const DB_NAME = "freelance_crm";

if (import.meta.env.DEV && typeof window !== "undefined") {
  // Load dev-mode plugin lazily so it never ships to production.
  import("rxdb/plugins/dev-mode")
    .then(({ RxDBDevModePlugin, disableWarnings }) => {
      disableWarnings?.();
      addRxPlugin(RxDBDevModePlugin);
    })
    .catch(() => {
      /* ignore */
    });
}

type Row = { id: string; json: string };
type RowCollection = RxCollection<Row>;

const STORE_NAMES = [
  "clients",
  "proposals",
  "interviews",
  "invoices",
  "preferences",
] as const;

type StoreName = (typeof STORE_NAMES)[number];

const rowSchema = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 128 },
    json: { type: "string" },
  },
  required: ["id", "json"],
} as const;

let dbPromise: Promise<RxDatabase<Record<StoreName, RowCollection>>> | null =
  null;

function getStorage(): RxStorage<unknown, unknown> {
  const storage = getRxStorageDexie();
  return import.meta.env.DEV ? wrappedValidateAjvStorage({ storage }) : storage;
}

function getDb() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("RxDB is only available in the browser"));
  }
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await createRxDatabase<Record<StoreName, RowCollection>>({
        name: DB_NAME,
        storage: getStorage(),
        ignoreDuplicate: import.meta.env.DEV,
      });
      const collections = Object.fromEntries(
        STORE_NAMES.map((name) => [name, { schema: rowSchema }]),
      ) as Record<StoreName, { schema: typeof rowSchema }>;
      await db.addCollections(collections);
      return db;
    })().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

function makeStore<T>(name: StoreName) {
  if (typeof window === "undefined") {
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
  const col = async () => (await getDb())[name];
  const parse = (r: Row): T => JSON.parse(r.json) as T;
  return {
    async getAll(): Promise<T[]> {
      const c = await col();
      const docs = await c.find().exec();
      return docs.map((d) => parse(d.toJSON() as Row));
    },
    async get(id: string): Promise<T | null> {
      const c = await col();
      const doc = await c.findOne(id).exec();
      return doc ? parse(doc.toJSON() as Row) : null;
    },
    async set(id: string, v: T): Promise<void> {
      const c = await col();
      await c.upsert({ id, json: JSON.stringify(v) });
    },
    async remove(id: string): Promise<void> {
      const c = await col();
      const doc = await c.findOne(id).exec();
      if (doc) await doc.remove();
    },
    async clear(): Promise<void> {
      const c = await col();
      await c.find().remove();
    },
    async setMany(items: [string, T][]): Promise<void> {
      const c = await col();
      if (items.length === 0) return;
      await c.bulkUpsert(
        items.map(([id, v]) => ({ id, json: JSON.stringify(v) })),
      );
    },
  };
}

export const STORE_LIST = STORE_NAMES;
export async function getRawCollection(name: StoreName): Promise<RowCollection> {
  const db = await getDb();
  return db[name];
}

export const stores = {
  clients: makeStore<Client>("clients"),
  proposals: makeStore<Proposal>("proposals"),
  interviews: makeStore<Interview>("interviews"),
  invoices: makeStore<Invoice>("invoices"),
  preferences: makeStore<unknown>("preferences"),
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
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
