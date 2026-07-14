import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { InvoiceForm } from "@/components/invoice-form";
import { ArrowLeft } from "lucide-react";

type Search = { client?: string };

export const Route = createFileRoute("/invoices/new")({
  head: () => ({
    meta: [
      { title: "New invoice — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    client: typeof s.client === "string" ? s.client : undefined,
  }),
  component: () => (
    <AppShell>
      <NewInvoice />
    </AppShell>
  ),
});

function NewInvoice() {
  const search = Route.useSearch();
  return (
    <>
      <Link
        to="/invoices"
        className="text-sm text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Invoices
      </Link>
      <PageHeader title="New invoice" />
      <InvoiceForm initialClientId={search.client ?? null} />
    </>
  );
}
