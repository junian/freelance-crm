import { describe, expect, it } from "vitest";

import { validateBackup } from "./backup";
import type { Client, Invoice, Proposal } from "./types";

const stamp = "2026-11-18T00:00:00.000Z";

const client: Client = {
  id: "c1",
  firstName: "Test",
  lastName: "Client",
  contacts: [],
  createdAt: stamp,
  updatedAt: stamp,
};

const proposal: Proposal = {
  id: "p1",
  clientId: client.id,
  workTitle: "Dashboard redesign",
  workDescription: "Modernize the dashboard.",
  submittedProposal: "Happy to help.",
  additionalFields: [],
  submittedAt: stamp,
  credit: 6,
  budget: { type: "fixed", amount: 2500, currency: "USD" },
  finalState: "pending",
  interviewId: null,
  createdAt: stamp,
  updatedAt: stamp,
};

const invoice: Invoice = {
  id: "i1",
  invoiceNumber: "INV-0001",
  clientId: client.id,
  clientSnapshot: {
    name: "Test Client",
    contactLines: ["client@example.test"],
    addressLines: [],
    taxId: "",
  },
  issuer: { name: "Test Studio", contactLines: [], addressLines: [], taxId: "" },
  issueDate: stamp,
  dueDate: null,
  currency: "USD",
  status: "draft",
  items: [],
  discountAmount: 0,
  taxLabel: "Tax",
  taxRate: 0,
  notes: "",
  paymentInstructions: "",
  createdAt: stamp,
  updatedAt: stamp,
};

describe("validateBackup", () => {
  it("accepts a version 2 backup", () => {
    const result = validateBackup({
      app: "freelance-crm",
      version: 2,
      exportedAt: stamp,
      clients: [client],
      proposals: [proposal],
      interviews: [],
      invoices: [invoice],
    });

    expect(result.version).toBe(2);
    expect(result.exportedAt).toBe(stamp);
    expect(result.clients).toEqual([client]);
    expect(result.proposals).toEqual([proposal]);
    expect(result.invoices).toEqual([invoice]);
  });

  it("accepts a version 1 backup and ignores its invoices", () => {
    const result = validateBackup({
      app: "freelance-crm",
      version: 1,
      exportedAt: stamp,
      clients: [client],
      proposals: [proposal],
      interviews: [],
      invoices: [invoice],
    });

    expect(result.version).toBe(2);
    expect(result.invoices).toEqual([]);
  });

  it("defaults missing arrays to empty arrays", () => {
    const result = validateBackup({
      app: "freelance-crm",
      version: 2,
      exportedAt: stamp,
    });

    expect(result.clients).toEqual([]);
    expect(result.proposals).toEqual([]);
    expect(result.interviews).toEqual([]);
    expect(result.invoices).toEqual([]);
  });

  it("replaces a missing or invalid exportedAt with a valid timestamp", () => {
    const result = validateBackup({
      app: "freelance-crm",
      version: 2,
      exportedAt: 123,
      clients: [],
      proposals: [],
      interviews: [],
      invoices: [],
    });

    expect(typeof result.exportedAt).toBe("string");
    expect(Number.isNaN(Date.parse(result.exportedAt))).toBe(false);
  });

  it.each([
    ["null", null],
    ["a string", "not an object"],
    ["an array", []],
    ["a different app", { app: "other", version: 2 }],
    ["an unsupported version", { app: "freelance-crm", version: 3 }],
  ])("rejects %s", (_label, value) => {
    expect(() => validateBackup(value)).toThrow();
  });
});
