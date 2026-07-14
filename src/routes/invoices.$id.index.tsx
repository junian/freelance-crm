import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data";
import { formatDate, formatMoney } from "@/lib/format";
import { InvoiceStatusBadge } from "@/components/status-badge";
import { calculateInvoice } from "@/lib/money";
import { ArrowLeft, Pencil, Copy, Printer, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { InvoiceStatus } from "@/lib/types";

export const Route = createFileRoute("/invoices/$id/")({
  head: () => ({
    meta: [
      { title: "Invoice — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <InvoiceDetail />
    </AppShell>
  ),
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const { invoices, updateInvoice, deleteInvoice, duplicateInvoice } = useAppData();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
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
  const calc = calculateInvoice(inv.items, inv.discountAmount, inv.taxRate, inv.currency);

  return (
    <>
      <Link to="/invoices" className="text-sm text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Invoices
      </Link>
      <PageHeader
        title={`Invoice ${inv.invoiceNumber}`}
        actions={
          <>
            <Select
              value={inv.status}
              onValueChange={(v) => updateInvoice(inv.id, { status: v as InvoiceStatus })}
            >
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild variant="outline">
              <Link to="/invoices/$id/edit" params={{ id: inv.id }}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const dup = await duplicateInvoice(inv.id);
                if (dup) {
                  toast.success("Duplicated");
                  navigate({ to: "/invoices/$id", params: { id: dup.id } });
                }
              }}
            >
              <Copy className="w-4 h-4 mr-1" /> Duplicate
            </Button>
            <Button asChild>
              <Link to="/invoices/$id/print" params={{ id: inv.id }}>
                <Printer className="w-4 h-4 mr-1" /> Print / PDF
              </Link>
            </Button>
            <Button variant="outline" className="text-rose-600" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <Card className="p-5">
          <div className="text-xs text-slate-500 mb-1">From</div>
          <div className="font-medium">{inv.issuer.name}</div>
          {inv.issuer.contactLines.map((l, i) => <div key={i} className="text-sm">{l}</div>)}
          {inv.issuer.addressLines.map((l, i) => <div key={i} className="text-sm text-slate-500">{l}</div>)}
          {inv.issuer.taxId && <div className="text-xs text-slate-500 mt-1">Tax ID: {inv.issuer.taxId}</div>}
        </Card>
        <Card className="p-5">
          <div className="text-xs text-slate-500 mb-1">Bill to</div>
          <div className="font-medium">{inv.clientSnapshot.name || "—"}</div>
          {inv.clientSnapshot.contactLines.map((l, i) => <div key={i} className="text-sm">{l}</div>)}
          {inv.clientSnapshot.addressLines.map((l, i) => <div key={i} className="text-sm text-slate-500">{l}</div>)}
          {inv.clientSnapshot.taxId && <div className="text-xs text-slate-500 mt-1">Tax ID: {inv.clientSnapshot.taxId}</div>}
        </Card>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <div className="text-xs text-slate-500">Issue date</div>
            <div>{formatDate(inv.issueDate)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Due date</div>
            <div>{formatDate(inv.dueDate)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Status</div>
            <InvoiceStatusBadge status={inv.status} />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b dark:border-slate-800">
            <tr>
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty/Hrs</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it) => (
              <tr key={it.id} className="border-b last:border-0 dark:border-slate-800">
                <td className="py-2">{it.description}</td>
                <td className="py-2 text-right">
                  {it.type === "fixed" ? it.quantity : `${it.hours}h`}
                </td>
                <td className="py-2 text-right">
                  {formatMoney(it.type === "fixed" ? it.unitPrice : it.hourlyRate, inv.currency)}
                </td>
                <td className="py-2 text-right">
                  {formatMoney(
                    it.type === "fixed" ? it.quantity * it.unitPrice : it.hours * it.hourlyRate,
                    inv.currency,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(calc.subtotal, inv.currency)}</span></div>
          {calc.discount > 0 && (
            <div className="flex justify-between"><span>Discount</span><span>−{formatMoney(calc.discount, inv.currency)}</span></div>
          )}
          {inv.taxRate > 0 && (
            <div className="flex justify-between">
              <span>{inv.taxLabel} ({inv.taxRate}%)</span>
              <span>{formatMoney(calc.tax, inv.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold border-t pt-2 dark:border-slate-800">
            <span>Total</span><span>{formatMoney(calc.total, inv.currency)}</span>
          </div>
        </div>

        {(inv.notes || inv.paymentInstructions) && (
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            {inv.notes && (
              <div>
                <div className="text-xs text-slate-500">Notes</div>
                <p className="text-sm whitespace-pre-wrap">{inv.notes}</p>
              </div>
            )}
            {inv.paymentInstructions && (
              <div>
                <div className="text-xs text-slate-500">Payment instructions</div>
                <p className="text-sm whitespace-pre-wrap">{inv.paymentInstructions}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the invoice. The linked client (if any) is not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                await deleteInvoice(inv.id);
                toast.success("Invoice deleted");
                navigate({ to: "/invoices" });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
