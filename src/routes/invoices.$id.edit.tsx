import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { InvoiceForm } from "@/components/invoice-form";
import { useAppData } from "@/lib/app-data";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/invoices/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit invoice — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <EditInvoice />
    </AppShell>
  ),
});

function EditInvoice() {
  const { id } = Route.useParams();
  const { invoices } = useAppData();
  const inv = invoices.find((i) => i.id === id);
  if (!inv) {
    return (
      <Card className="p-8 text-center">
        <div className="text-lg font-semibold">Invoice not found</div>
        <Link to="/invoices" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back
        </Link>
      </Card>
    );
  }
  return (
    <>
      <Link
        to="/invoices/$id"
        params={{ id: inv.id }}
        className="text-sm text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Invoice
      </Link>
      <PageHeader title={`Edit ${inv.invoiceNumber}`} />
      <InvoiceForm initial={inv} />
    </>
  );
}
