import { cn } from "@/lib/utils";
import type { InvoiceStatus, ProposalFinalState } from "@/lib/types";

const proposalStyles: Record<ProposalFinalState, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  accepted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  deleted: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 line-through",
};

const invoiceStyles: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  sent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  overdue: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  void: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export function ProposalStateBadge({ state }: { state: ProposalFinalState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        proposalStyles[state],
      )}
    >
      {state}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        invoiceStyles[status],
      )}
    >
      {status}
    </span>
  );
}
