import { stores } from "./storage";
import type { Client, Interview, Invoice, Proposal } from "./types";

export type BackupFileV2 = {
  app: "freelance-crm";
  version: 2;
  exportedAt: string;
  clients: Client[];
  proposals: Proposal[];
  interviews: Interview[];
  invoices: Invoice[];
};

export type BackupFileV1 = {
  app: "freelance-crm";
  version: 1;
  exportedAt: string;
  clients: Client[];
  proposals: Proposal[];
  interviews: Interview[];
};

export async function exportBackup(): Promise<BackupFileV2> {
  const [clients, proposals, interviews, invoices] = await Promise.all([
    stores.clients.getAll(),
    stores.proposals.getAll(),
    stores.interviews.getAll(),
    stores.invoices.getAll(),
  ]);
  return {
    app: "freelance-crm",
    version: 2,
    exportedAt: new Date().toISOString(),
    clients,
    proposals,
    interviews,
    invoices,
  };
}

export function validateBackup(data: unknown): BackupFileV2 {
  if (!data || typeof data !== "object") throw new Error("Invalid backup file");
  const d = data as Record<string, unknown>;
  if (d.app !== "freelance-crm") throw new Error("Not a Freelance CRM backup");
  const version = d.version;
  if (version !== 1 && version !== 2) throw new Error("Unsupported backup version");
  const clients = Array.isArray(d.clients) ? (d.clients as Client[]) : [];
  const proposals = Array.isArray(d.proposals) ? (d.proposals as Proposal[]) : [];
  const interviews = Array.isArray(d.interviews) ? (d.interviews as Interview[]) : [];
  const invoices =
    version === 2 && Array.isArray(d.invoices) ? (d.invoices as Invoice[]) : [];
  return {
    app: "freelance-crm",
    version: 2,
    exportedAt: typeof d.exportedAt === "string" ? d.exportedAt : new Date().toISOString(),
    clients,
    proposals,
    interviews,
    invoices,
  };
}

function newer<T extends { id: string; updatedAt: string }>(a: T, b: T): T {
  return new Date(a.updatedAt).getTime() >= new Date(b.updatedAt).getTime() ? a : b;
}

export async function importBackup(
  backup: BackupFileV2,
  mode: "replace" | "merge",
): Promise<{ clients: number; proposals: number; interviews: number; invoices: number }> {
  if (mode === "replace") {
    await Promise.all([
      stores.clients.clear(),
      stores.proposals.clear(),
      stores.interviews.clear(),
      stores.invoices.clear(),
    ]);
  }

  async function importSet<T extends { id: string; updatedAt: string }>(
    store: {
      getAll: () => Promise<unknown[]>;
      setMany: (items: [string, unknown][]) => Promise<void>;
    },
    incoming: T[],
  ) {
    if (mode === "replace") {
      await store.setMany(incoming.map((r) => [r.id, r]));
      return incoming.length;
    }
    const existing = (await store.getAll()) as T[];
    const map = new Map(existing.map((r) => [r.id, r]));
    for (const r of incoming) {
      const prev = map.get(r.id);
      map.set(r.id, prev ? newer(r, prev) : r);
    }
    await store.setMany(Array.from(map.values()).map((r) => [r.id, r]));
    return incoming.length;
  }

  const [c, p, i, iv] = await Promise.all([
    importSet(stores.clients as never, backup.clients),
    importSet(stores.proposals as never, backup.proposals),
    importSet(stores.interviews as never, backup.interviews),
    importSet(stores.invoices as never, backup.invoices),
  ]);
  return { clients: c, proposals: p, interviews: i, invoices: iv };
}

export async function resetAll(): Promise<void> {
  await Promise.all([
    stores.clients.clear(),
    stores.proposals.clear(),
    stores.interviews.clear(),
    stores.invoices.clear(),
    stores.preferences.clear(),
  ]);
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, filename);
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
