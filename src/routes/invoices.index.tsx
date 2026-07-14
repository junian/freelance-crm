import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Card, EmptyState, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from "@/lib/app-data";
import { formatDate, formatMoney } from "@/lib/format";
import { InvoiceStatusBadge } from "@/components/status-badge";
import { calculateInvoice } from "@/lib/money";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/invoices/")({
  head: () => ({
    meta: [
      { title: "Invoices — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <InvoicesPage />
    </AppShell>
  ),
});

function InvoicesPage() {
  const { invoices, clients } = useAppData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [clientId, setClientId] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [sort, setSort] = useState("newest");

  const currencies = useMemo(() => Array.from(new Set(invoices.map((i) => i.currency))), [invoices]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    let list = invoices.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (clientId !== "all") {
        if (clientId === "none" && inv.clientId !== null) return false;
        if (clientId !== "none" && inv.clientId !== clientId) return false;
      }
      if (currency !== "all" && inv.currency !== currency) return false;
      if (ql) {
        const hay = [
          inv.invoiceNumber,
          inv.clientSnapshot.name,
          ...inv.items.map((it) => it.description),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      const at = calculateInvoice(a.items, a.discountAmount, a.taxRate, a.currency).total;
      const bt = calculateInvoice(b.items, b.discountAmount, b.taxRate, b.currency).total;
      if (sort === "oldest") return a.issueDate.localeCompare(b.issueDate);
      if (sort === "due") return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
      if (sort === "number") return a.invoiceNumber.localeCompare(b.invoiceNumber);
      if (sort === "total") return bt - at;
      if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
      return b.issueDate.localeCompare(a.issueDate);
    });
    return list;
  }, [invoices, q, status, clientId, currency, sort]);

  return (
    <>
      <PageHeader
        title="Invoices"
        description={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link to="/invoices/new">
              <Plus className="w-4 h-4 mr-1" /> New invoice
            </Link>
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid gap-2 md:grid-cols-6">
          <Input className="md:col-span-2" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              <SelectItem value="none">No client</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All currencies</SelectItem>
              {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="due">Due date</SelectItem>
              <SelectItem value="number">Invoice #</SelectItem>
              <SelectItem value="total">Total</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="Create your first invoice."
          action={<Button asChild><Link to="/invoices/new">New invoice</Link></Button>}
        />
      ) : (
        <Card>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Issued</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const calc = calculateInvoice(inv.items, inv.discountAmount, inv.taxRate, inv.currency);
                  return (
                    <tr key={inv.id} className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-medium">
                        <Link to="/invoices/$id" params={{ id: inv.id }} className="hover:text-indigo-600">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="p-3">{inv.clientSnapshot.name || "—"}</td>
                      <td className="p-3 text-slate-500">{formatDate(inv.issueDate)}</td>
                      <td className="p-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                      <td className="p-3"><InvoiceStatusBadge status={inv.status} /></td>
                      <td className="p-3 text-right font-medium">{formatMoney(calc.total, inv.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y dark:divide-slate-800">
            {filtered.map((inv) => {
              const calc = calculateInvoice(inv.items, inv.discountAmount, inv.taxRate, inv.currency);
              return (
                <Link key={inv.id} to="/invoices/$id" params={{ id: inv.id }} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{inv.invoiceNumber}</div>
                      <div className="text-xs text-slate-500">{inv.clientSnapshot.name || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatMoney(calc.total, inv.currency)}</div>
                      <InvoiceStatusBadge status={inv.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

void useNavigate;
void useRouterState;
