export type ContactField = { id: string; label: string; value: string };

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  contacts: ContactField[];
  createdAt: string;
  updatedAt: string;
};

export type AdditionalField = { id: string; label: string; value: string };

export type ProposalBudget =
  | { type: "fixed"; amount: number; currency: string }
  | { type: "hourly"; hourlyRate: number; currency: string };

export type ProposalFinalState = "pending" | "accepted" | "rejected" | "deleted";

export type Proposal = {
  id: string;
  clientId: string | null;
  workTitle: string;
  workDescription: string;
  submittedProposal: string;
  additionalFields: AdditionalField[];
  submittedAt: string;
  credit: number | null;
  budget: ProposalBudget;
  finalState: ProposalFinalState;
  interviewId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Interview = {
  id: string;
  proposalId: string;
  notesMarkdown: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export type FixedPriceInvoiceItem = {
  id: string;
  type: "fixed";
  description: string;
  quantity: number;
  unitPrice: number;
};

export type HourlyInvoiceItem = {
  id: string;
  type: "hourly";
  description: string;
  hours: number;
  hourlyRate: number;
};

export type InvoiceItem = FixedPriceInvoiceItem | HourlyInvoiceItem;

export type InvoicePartySnapshot = {
  name: string;
  contactLines: string[];
  addressLines: string[];
  taxId: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  clientSnapshot: InvoicePartySnapshot;
  issuer: InvoicePartySnapshot;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  discountAmount: number;
  taxLabel: string;
  taxRate: number;
  notes: string;
  paymentInstructions: string;
  createdAt: string;
  updatedAt: string;
};

export type Preferences = {
  theme: "light" | "dark" | "system";
  defaultIssuer: InvoicePartySnapshot;
  defaultCurrency: string;
  seededDemo: boolean;
};

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY", "PLN", "BRL", "MXN"];
