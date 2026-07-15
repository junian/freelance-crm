import { stores, uid, getPreferences, savePreferences } from "./storage";
import type { Client, Interview, Invoice, Proposal } from "./types";
import { isoNow } from "./format";

export async function seedDemoIfNeeded() {
  const prefs = await getPreferences();
  if (prefs.seededDemo) return;

  const now = isoNow();
  const c1: Client = {
    id: uid(),
    firstName: "Ada",
    lastName: "Lovelace",
    contacts: [
      { id: uid(), label: "Email", value: "ada@example.com" },
      { id: uid(), label: "Upwork Profile", value: "https://upwork.com/freelancers/ada" },
    ],
    createdAt: now,
    updatedAt: now,
  };
  const c2: Client = {
    id: uid(),
    firstName: "Grace",
    lastName: "Hopper",
    contacts: [{ id: uid(), label: "Email", value: "grace@example.com" }],
    createdAt: now,
    updatedAt: now,
  };
  await stores.clients.set(c1.id, c1);
  await stores.clients.set(c2.id, c2);

  const p1: Proposal = {
    id: uid(),
    clientId: c1.id,
    workTitle: "React dashboard redesign",
    workDescription: "Modernize an existing analytics dashboard.",
    submittedProposal: "Hi Ada,\n\nI'd love to help redesign your dashboard...",
    additionalFields: [
      { id: uid(), label: "Job URL", value: "https://upwork.com/jobs/example" },
    ],
    submittedAt: now,
    credit: 6,
    budget: { type: "hourly", hourlyRate: 65, currency: "USD" },
    finalState: "accepted",
    interviewId: null,
    createdAt: now,
    updatedAt: now,
  };
  const p2: Proposal = {
    id: uid(),
    clientId: c2.id,
    workTitle: "Marketing site build",
    workDescription: "5-page Next.js marketing site.",
    submittedProposal: "Happy to build your marketing site...",
    additionalFields: [],
    submittedAt: now,
    credit: 4,
    budget: { type: "fixed", amount: 2500, currency: "USD" },
    finalState: "pending",
    interviewId: null,
    createdAt: now,
    updatedAt: now,
  };
  await stores.proposals.set(p1.id, p1);
  await stores.proposals.set(p2.id, p2);

  const iv: Interview = {
    id: uid(),
    proposalId: p1.id,
    notesMarkdown:
      "## Kickoff call\n\n- Discussed goals\n- Timeline: **4 weeks**\n\n> Client wants indigo palette.",
    createdAt: now,
    updatedAt: now,
  };
  p1.interviewId = iv.id;
  await stores.proposals.set(p1.id, p1);
  await stores.interviews.set(iv.id, iv);

  const inv: Invoice = {
    id: uid(),
    invoiceNumber: "INV-0001",
    clientId: c1.id,
    clientSnapshot: {
      name: "Ada Lovelace",
      contactLines: ["ada@example.com"],
      addressLines: [],
      taxId: "",
    },
    issuer: {
      name: "Your Studio",
      contactLines: ["hello@yourstudio.com"],
      addressLines: [],
      taxId: "",
    },
    issueDate: now,
    dueDate: null,
    currency: "USD",
    status: "sent",
    items: [
      { id: uid(), type: "hourly", description: "Design work", hours: 12, hourlyRate: 65 },
      { id: uid(), type: "fixed", description: "Style guide", quantity: 1, unitPrice: 400 },
    ],
    discountAmount: 0,
    taxLabel: "Tax",
    taxRate: 0,
    notes: "Thank you for your business.",
    paymentInstructions: "Wire transfer — details on request.",
    createdAt: now,
    updatedAt: now,
  };
  await stores.invoices.set(inv.id, inv);

  await savePreferences({ ...prefs, seededDemo: true, hasDemoData: true });
}
