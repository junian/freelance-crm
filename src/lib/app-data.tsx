import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { stores, uid, getPreferences, savePreferences, DEFAULT_PREFS } from "./storage";
import type {
  Client,
  Interview,
  Invoice,
  InvoiceItem,
  Preferences,
  Proposal,
  ProposalFinalState,
} from "./types";
import { isoNow } from "./format";

type Ctx = {
  ready: boolean;
  clients: Client[];
  proposals: Proposal[];
  interviews: Interview[];
  invoices: Invoice[];
  prefs: Preferences;

  // Clients
  createClient: (data: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<Client>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Proposals
  createProposal: (data: Omit<Proposal, "id" | "createdAt" | "updatedAt" | "interviewId">) => Promise<Proposal>;
  updateProposal: (id: string, patch: Partial<Proposal>) => Promise<void>;
  softDeleteProposal: (id: string) => Promise<void>;
  restoreProposal: (id: string) => Promise<void>;
  permanentDeleteProposal: (id: string) => Promise<void>;
  duplicateProposal: (id: string) => Promise<Proposal | null>;
  setProposalState: (id: string, state: ProposalFinalState) => Promise<void>;

  // Interviews
  createInterview: (proposalId: string, notesMarkdown?: string) => Promise<Interview | null>;
  updateInterview: (id: string, patch: Partial<Interview>) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;

  // Invoices
  createInvoice: (data: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => Promise<Invoice>;
  updateInvoice: (id: string, patch: Partial<Invoice>) => Promise<void>;
  duplicateInvoice: (id: string) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<void>;
  nextInvoiceNumber: () => string;

  setPrefs: (p: Preferences) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppDataContext = createContext<Ctx | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [prefs, setPrefsState] = useState<Preferences>(DEFAULT_PREFS);

  const refresh = useCallback(async () => {
    const [c, p, i, iv, pr] = await Promise.all([
      stores.clients.getAll(),
      stores.proposals.getAll(),
      stores.interviews.getAll(),
      stores.invoices.getAll(),
      getPreferences(),
    ]);
    setClients(c);
    setProposals(p);
    setInterviews(i);
    setInvoices(iv);
    setPrefsState(pr);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  // Apply theme
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const apply = (mode: "light" | "dark") => {
      root.classList.toggle("dark", mode === "dark");
    };
    if (prefs.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    apply(prefs.theme);
  }, [prefs.theme]);

  const createClient: Ctx["createClient"] = async (data) => {
    const now = isoNow();
    const c: Client = { ...data, id: uid(), createdAt: now, updatedAt: now };
    await stores.clients.set(c.id, c);
    await refresh();
    return c;
  };

  const updateClient: Ctx["updateClient"] = async (id, patch) => {
    const existing = await stores.clients.get(id);
    if (!existing) return;
    const updated = { ...existing, ...patch, id, updatedAt: isoNow() };
    await stores.clients.set(id, updated);
    await refresh();
  };

  const deleteClient: Ctx["deleteClient"] = async (id) => {
    const [ps, ivs] = await Promise.all([stores.proposals.getAll(), stores.invoices.getAll()]);
    for (const p of ps) {
      if (p.clientId === id) {
        await stores.proposals.set(p.id, { ...p, clientId: null, updatedAt: isoNow() });
      }
    }
    for (const iv of ivs) {
      if (iv.clientId === id) {
        await stores.invoices.set(iv.id, { ...iv, clientId: null, updatedAt: isoNow() });
      }
    }
    await stores.clients.remove(id);
    await refresh();
  };

  const createProposal: Ctx["createProposal"] = async (data) => {
    const now = isoNow();
    const p: Proposal = { ...data, id: uid(), interviewId: null, createdAt: now, updatedAt: now };
    await stores.proposals.set(p.id, p);
    await refresh();
    return p;
  };

  const updateProposal: Ctx["updateProposal"] = async (id, patch) => {
    const existing = await stores.proposals.get(id);
    if (!existing) return;
    const updated = { ...existing, ...patch, id, updatedAt: isoNow() };
    await stores.proposals.set(id, updated);
    await refresh();
  };

  const softDeleteProposal: Ctx["softDeleteProposal"] = async (id) => {
    const p = await stores.proposals.get(id);
    if (!p) return;
    await stores.proposals.set(id, { ...p, finalState: "deleted", updatedAt: isoNow() });
    await refresh();
  };

  const restoreProposal: Ctx["restoreProposal"] = async (id) => {
    const p = await stores.proposals.get(id);
    if (!p) return;
    await stores.proposals.set(id, { ...p, finalState: "pending", updatedAt: isoNow() });
    await refresh();
  };

  const permanentDeleteProposal: Ctx["permanentDeleteProposal"] = async (id) => {
    const p = await stores.proposals.get(id);
    if (p?.interviewId) await stores.interviews.remove(p.interviewId);
    await stores.proposals.remove(id);
    await refresh();
  };

  const duplicateProposal: Ctx["duplicateProposal"] = async (id) => {
    const p = await stores.proposals.get(id);
    if (!p) return null;
    const now = isoNow();
    const copy: Proposal = {
      ...p,
      id: uid(),
      interviewId: null,
      finalState: "pending",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await stores.proposals.set(copy.id, copy);
    await refresh();
    return copy;
  };

  const setProposalState: Ctx["setProposalState"] = async (id, state) => {
    await updateProposal(id, { finalState: state });
  };

  const createInterview: Ctx["createInterview"] = async (proposalId, notesMarkdown = "") => {
    const p = await stores.proposals.get(proposalId);
    if (!p) return null;
    if (p.interviewId) return null;
    const now = isoNow();
    const iv: Interview = {
      id: uid(),
      proposalId,
      notesMarkdown,
      createdAt: now,
      updatedAt: now,
    };
    await stores.interviews.set(iv.id, iv);
    await stores.proposals.set(p.id, { ...p, interviewId: iv.id, updatedAt: now });
    await refresh();
    return iv;
  };

  const updateInterview: Ctx["updateInterview"] = async (id, patch) => {
    const existing = await stores.interviews.get(id);
    if (!existing) return;
    await stores.interviews.set(id, { ...existing, ...patch, id, updatedAt: isoNow() });
    await refresh();
  };

  const deleteInterview: Ctx["deleteInterview"] = async (id) => {
    const iv = await stores.interviews.get(id);
    if (!iv) return;
    const p = await stores.proposals.get(iv.proposalId);
    if (p) await stores.proposals.set(p.id, { ...p, interviewId: null, updatedAt: isoNow() });
    await stores.interviews.remove(id);
    await refresh();
  };

  const createInvoice: Ctx["createInvoice"] = async (data) => {
    const now = isoNow();
    const inv: Invoice = { ...data, id: uid(), createdAt: now, updatedAt: now };
    await stores.invoices.set(inv.id, inv);
    await refresh();
    return inv;
  };

  const updateInvoice: Ctx["updateInvoice"] = async (id, patch) => {
    const existing = await stores.invoices.get(id);
    if (!existing) return;
    await stores.invoices.set(id, { ...existing, ...patch, id, updatedAt: isoNow() } as Invoice);
    await refresh();
  };

  const duplicateInvoice: Ctx["duplicateInvoice"] = async (id) => {
    const inv = await stores.invoices.get(id);
    if (!inv) return null;
    const now = isoNow();
    const copy: Invoice = {
      ...inv,
      id: uid(),
      invoiceNumber: nextInvoiceNumberFrom(invoices),
      status: "draft",
      items: inv.items.map((it) => ({ ...it, id: uid() }) as InvoiceItem),
      createdAt: now,
      updatedAt: now,
    };
    await stores.invoices.set(copy.id, copy);
    await refresh();
    return copy;
  };

  const deleteInvoice: Ctx["deleteInvoice"] = async (id) => {
    await stores.invoices.remove(id);
    await refresh();
  };

  const nextInvoiceNumber = useCallback(() => nextInvoiceNumberFrom(invoices), [invoices]);

  const setPrefs: Ctx["setPrefs"] = async (p) => {
    await savePreferences(p);
    setPrefsState(p);
  };

  const value: Ctx = useMemo(
    () => ({
      ready,
      clients,
      proposals,
      interviews,
      invoices,
      prefs,
      createClient,
      updateClient,
      deleteClient,
      createProposal,
      updateProposal,
      softDeleteProposal,
      restoreProposal,
      permanentDeleteProposal,
      duplicateProposal,
      setProposalState,
      createInterview,
      updateInterview,
      deleteInterview,
      createInvoice,
      updateInvoice,
      duplicateInvoice,
      deleteInvoice,
      nextInvoiceNumber,
      setPrefs,
      refresh,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, clients, proposals, interviews, invoices, prefs],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

function nextInvoiceNumberFrom(invoices: Invoice[]): string {
  const nums = invoices
    .map((i) => {
      const m = i.invoiceNumber.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

export function useAppData(): Ctx {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function useClient(id: string | null | undefined) {
  const { clients } = useAppData();
  return useMemo(() => clients.find((c) => c.id === id) || null, [clients, id]);
}
