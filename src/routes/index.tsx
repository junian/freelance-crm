import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data";
import { formatDate, formatMoney } from "@/lib/format";
import { ProposalStateBadge, InvoiceStatusBadge } from "@/components/status-badge";
import {
  Users,
  FileText,
  MessagesSquare,
  Receipt,
  TrendingUp,
  Coins,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell>
      <DashboardInner />
    </AppShell>
  );
}

function DashboardInner() {
  const { clients, proposals, interviews, invoices, prefs, deleteDemoData } = useAppData();

  const activeProposals = useMemo(
    () => proposals.filter((p) => p.finalState !== "deleted"),
    [proposals],
  );
  const pending = activeProposals.filter((p) => p.finalState === "pending").length;
  const accepted = activeProposals.filter((p) => p.finalState === "accepted");
  const rejected = activeProposals.filter((p) => p.finalState === "rejected").length;
  const decided = accepted.length + rejected;
  const acceptanceRate = decided > 0 ? Math.round((accepted.length / decided) * 100) : 0;
  const totalCredits = activeProposals.reduce((s, p) => s + (p.credit ?? 0), 0);

  const acceptedFixedByCurrency = new Map<string, number>();
  const acceptedHourlyRatesByCurrency = new Map<string, number[]>();
  accepted.forEach((p) => {
    if (p.budget.type === "fixed") {
      acceptedFixedByCurrency.set(
        p.budget.currency,
        (acceptedFixedByCurrency.get(p.budget.currency) ?? 0) + p.budget.amount,
      );
    } else {
      const arr = acceptedHourlyRatesByCurrency.get(p.budget.currency) ?? [];
      arr.push(p.budget.hourlyRate);
      acceptedHourlyRatesByCurrency.set(p.budget.currency, arr);
    }
  });

  const outstandingByCurrency = new Map<string, number>();
  const paidByCurrency = new Map<string, number>();
  let overdueCount = 0;
  invoices.forEach((inv) => {
    const total = inv.items.reduce((s, it) => {
      if (it.type === "fixed") return s + it.quantity * it.unitPrice;
      return s + it.hours * it.hourlyRate;
    }, 0) - (inv.discountAmount || 0);
    const grand = total + (total * (inv.taxRate || 0)) / 100;
    if (inv.status === "paid") {
      paidByCurrency.set(inv.currency, (paidByCurrency.get(inv.currency) ?? 0) + grand);
    } else if (inv.status === "sent" || inv.status === "overdue" || inv.status === "draft") {
      outstandingByCurrency.set(
        inv.currency,
        (outstandingByCurrency.get(inv.currency) ?? 0) + grand,
      );
    }
    if (inv.status === "overdue") overdueCount++;
    else if (
      inv.status === "sent" &&
      inv.dueDate &&
      new Date(inv.dueDate).getTime() < Date.now()
    )
      overdueCount++;
  });

  const recentProposals = [...activeProposals]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 5);
  const recentInvoices = [...invoices]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="At-a-glance activity from your local records."
      />

      {prefs.hasDemoData && (
        <Card className="p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-500/10">
          <div className="flex items-start gap-3 flex-1">
            <Sparkles className="w-5 h-5 mt-0.5 text-indigo-600 dark:text-indigo-300 shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                You're viewing this app with demo data
              </div>
              <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                Clear the sample clients, proposals, interviews and invoices to start fresh.
              </div>
            </div>
          </div>
          <Button
            onClick={async () => {
              await deleteDemoData();
              toast.success("Demo data removed");
            }}
          >
            Start fresh
          </Button>
        </Card>
      )}


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard to="/clients" icon={Users} label="Clients" value={clients.length} />
        <StatCard
          to="/proposals"
          icon={FileText}
          label="Proposals"
          value={activeProposals.length}
          hint={`${pending} pending · ${accepted.length} accepted`}
        />
        <StatCard
          to="/interviews"
          icon={MessagesSquare}
          label="Interviews"
          value={interviews.length}
        />
        <StatCard
          to="/invoices"
          icon={Receipt}
          label="Invoices"
          value={invoices.length}
          hint={overdueCount ? `${overdueCount} overdue` : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <TrendingUp className="w-4 h-4" /> Acceptance rate
          </div>
          <div className="mt-2 text-3xl font-semibold">{acceptanceRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {accepted.length} accepted / {rejected} rejected
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Coins className="w-4 h-4" /> Credits / Connects spent
          </div>
          <div className="mt-2 text-3xl font-semibold">{totalCredits}</div>
          <div className="text-xs text-slate-500 mt-1">Across all proposals</div>
        </Card>
        <Card className="p-5">
          <div className="text-slate-500 text-sm">Accepted value</div>
          <div className="mt-2 space-y-0.5">
            {acceptedFixedByCurrency.size === 0 && (
              <div className="text-slate-400 text-sm">No accepted fixed-price yet</div>
            )}
            {Array.from(acceptedFixedByCurrency.entries()).map(([cur, v]) => (
              <div key={cur} className="text-lg font-semibold">
                {formatMoney(v, cur)}
              </div>
            ))}
          </div>
          {acceptedHourlyRatesByCurrency.size > 0 && (
            <div className="text-xs text-slate-500 mt-2">
              Avg hourly:{" "}
              {Array.from(acceptedHourlyRatesByCurrency.entries())
                .map(
                  ([cur, arr]) =>
                    `${formatMoney(arr.reduce((s, n) => s + n, 0) / arr.length, cur)}/hr`,
                )
                .join(" · ")}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <Card className="p-5">
          <div className="font-semibold mb-3">Outstanding</div>
          {outstandingByCurrency.size === 0 ? (
            <div className="text-sm text-slate-500">Nothing outstanding.</div>
          ) : (
            <ul className="space-y-1 text-sm">
              {Array.from(outstandingByCurrency.entries()).map(([cur, v]) => (
                <li key={cur} className="flex justify-between">
                  <span>{cur}</span>
                  <span className="font-medium">{formatMoney(v, cur)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-3">Paid</div>
          {paidByCurrency.size === 0 ? (
            <div className="text-sm text-slate-500">No paid invoices yet.</div>
          ) : (
            <ul className="space-y-1 text-sm">
              {Array.from(paidByCurrency.entries()).map(([cur, v]) => (
                <li key={cur} className="flex justify-between">
                  <span>{cur}</span>
                  <span className="font-medium text-emerald-600">{formatMoney(v, cur)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Recent proposals</div>
            <Link to="/proposals" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {recentProposals.length === 0 ? (
            <div className="text-sm text-slate-500">
              No proposals yet.{" "}
              <Link to="/proposals" hash="new" className="text-indigo-600 hover:underline">
                Create the first one
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y dark:divide-slate-800">
              {recentProposals.map((p) => (
                <li key={p.id} className="py-2">
                  <Link
                    to="/proposals/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-between gap-3 hover:text-indigo-600"
                  >
                    <span className="truncate">{p.workTitle || "Untitled"}</span>
                    <ProposalStateBadge state={p.finalState} />
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatDate(p.submittedAt, true)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Recent invoices</div>
            <Link to="/invoices" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="text-sm text-slate-500">
              No invoices yet.{" "}
              <Link to="/invoices/new" className="text-indigo-600 hover:underline">
                Create one
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y dark:divide-slate-800">
              {recentInvoices.map((inv) => (
                <li key={inv.id} className="py-2">
                  <Link
                    to="/invoices/$id"
                    params={{ id: inv.id }}
                    className="flex items-center justify-between gap-3 hover:text-indigo-600"
                  >
                    <span className="truncate">
                      {inv.invoiceNumber} — {inv.clientSnapshot.name || "Unnamed"}
                    </span>
                    <InvoiceStatusBadge status={inv.status} />
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatDate(inv.issueDate)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function StatCard({
  to,
  icon: Icon,
  label,
  value,
  hint,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Link to={to}>
      <Card className="p-5 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Icon className="w-4 h-4" /> {label}
        </div>
        <div className="mt-2 text-3xl font-semibold">{value}</div>
        {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
      </Card>
    </Link>
  );
}
