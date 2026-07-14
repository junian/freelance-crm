import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, Card, EmptyState, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { uid } from "@/lib/storage";
import type { AdditionalField, Proposal, ProposalBudget, ProposalFinalState } from "@/lib/types";
import { CURRENCIES } from "@/lib/types";
import { formatDate, isoNow, fromLocalDateTimeInput, localDateTimeInputValue } from "@/lib/format";
import { ProposalStateBadge } from "@/components/status-badge";
import { ClientFormDialog } from "./clients.index";

export const Route = createFileRoute("/proposals/")({
  head: () => ({
    meta: [
      { title: "Proposals — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <ProposalsPage />
    </AppShell>
  ),
});

function ProposalsPage() {
  const { proposals, clients } = useAppData();
  const [q, setQ] = useState("");
  const [state, setState] = useState<string>("active");
  const [clientId, setClientId] = useState<string>("all");
  const [budgetType, setBudgetType] = useState<string>("all");
  const [sort, setSort] = useState("newest");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    if (hash === "new") setCreating(true);
    else if (hash?.startsWith("new-for-")) setCreating(true);
  }, [hash]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    let list = proposals.filter((p) => {
      if (state === "active" && p.finalState === "deleted") return false;
      if (state !== "active" && state !== "all" && p.finalState !== state) return false;
      if (state === "all" && p.finalState === "deleted") {
        /* keep */
      }
      if (clientId !== "all") {
        if (clientId === "none" && p.clientId !== null) return false;
        if (clientId !== "none" && p.clientId !== clientId) return false;
      }
      if (budgetType !== "all" && p.budget.type !== budgetType) return false;
      if (ql) {
        const client = clients.find((c) => c.id === p.clientId);
        const hay = [
          p.workTitle,
          p.workDescription,
          p.submittedProposal,
          client ? `${client.firstName} ${client.lastName}` : "",
          ...p.additionalFields.map((f) => `${f.label} ${f.value}`),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    list = list.sort((a, b) => {
      if (sort === "oldest") return a.submittedAt.localeCompare(b.submittedAt);
      if (sort === "credit") return (b.credit ?? 0) - (a.credit ?? 0);
      if (sort === "budget") {
        const av = a.budget.type === "fixed" ? a.budget.amount : a.budget.hourlyRate;
        const bv = b.budget.type === "fixed" ? b.budget.amount : b.budget.hourlyRate;
        return bv - av;
      }
      if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
      return b.submittedAt.localeCompare(a.submittedAt);
    });
    return list;
  }, [proposals, clients, q, state, clientId, budgetType, sort]);

  const clearFilters = () => {
    setQ("");
    setState("active");
    setClientId("all");
    setBudgetType("all");
    setSort("newest");
  };

  return (
    <>
      <PageHeader
        title="Proposals"
        description={`${proposals.filter((p) => p.finalState !== "deleted").length} active`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-1" /> New proposal
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid gap-2 md:grid-cols-6">
          <Input
            className="md:col-span-2"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={state} onValueChange={setState}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              <SelectItem value="none">No client</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={budgetType} onValueChange={setBudgetType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any budget</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="credit">Credits</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-2">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No proposals"
          description="Create your first proposal to track a submission."
          action={<Button onClick={() => setCreating(true)}>New proposal</Button>}
        />
      ) : (
        <Card>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Budget</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">State</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId);
                  return (
                    <tr key={p.id} className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3">
                        <Link
                          to="/proposals/$id"
                          params={{ id: p.id }}
                          className="font-medium hover:text-indigo-600"
                        >
                          {p.workTitle || "Untitled"}
                        </Link>
                        {p.interviewId && (
                          <span className="ml-2 text-xs text-indigo-600">• interview</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {client ? `${client.firstName} ${client.lastName}` : "—"}
                      </td>
                      <td className="p-3 text-slate-500">{formatDate(p.submittedAt)}</td>
                      <td className="p-3">
                        {p.budget.type === "fixed"
                          ? `${p.budget.amount} ${p.budget.currency}`
                          : `${p.budget.hourlyRate} ${p.budget.currency}/hr`}
                      </td>
                      <td className="p-3">{p.credit ?? "—"}</td>
                      <td className="p-3"><ProposalStateBadge state={p.finalState} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y dark:divide-slate-800">
            {filtered.map((p) => {
              const client = clients.find((c) => c.id === p.clientId);
              return (
                <Link
                  key={p.id}
                  to="/proposals/$id"
                  params={{ id: p.id }}
                  className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="font-medium truncate">{p.workTitle || "Untitled"}</div>
                    <ProposalStateBadge state={p.finalState} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {client ? `${client.firstName} ${client.lastName}` : "No client"} · {formatDate(p.submittedAt)}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      <ProposalFormDialog
        open={creating || editing !== null}
        proposal={editing}
        initialClientId={hash?.startsWith("new-for-") ? hash.slice("new-for-".length) : null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </>
  );
}

export function ProposalFormDialog({
  open,
  proposal,
  initialClientId,
  onClose,
}: {
  open: boolean;
  proposal: Proposal | null;
  initialClientId?: string | null;
  onClose: () => void;
}) {
  const { clients, createProposal, updateProposal, prefs } = useAppData();
  const [clientId, setClientId] = useState<string>("none");
  const [workTitle, setWorkTitle] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [submittedProposal, setSubmittedProposal] = useState("");
  const [additionalFields, setAdditionalFields] = useState<AdditionalField[]>([]);
  const [submittedAt, setSubmittedAt] = useState(() => localDateTimeInputValue(isoNow()));
  const [credit, setCredit] = useState<string>("");
  const [budgetType, setBudgetType] = useState<"fixed" | "hourly">("fixed");
  const [amount, setAmount] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [finalState, setFinalState] = useState<ProposalFinalState>("pending");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openNewClient, setOpenNewClient] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClientId(proposal?.clientId ?? initialClientId ?? "none");
    setWorkTitle(proposal?.workTitle ?? "");
    setWorkDescription(proposal?.workDescription ?? "");
    setSubmittedProposal(proposal?.submittedProposal ?? "");
    setAdditionalFields(proposal?.additionalFields ?? []);
    setSubmittedAt(localDateTimeInputValue(proposal?.submittedAt ?? isoNow()));
    setCredit(proposal?.credit == null ? "" : String(proposal.credit));
    setBudgetType(proposal?.budget.type ?? "fixed");
    if (proposal?.budget.type === "fixed") setAmount(String(proposal.budget.amount));
    else setAmount("");
    if (proposal?.budget.type === "hourly") setHourlyRate(String(proposal.budget.hourlyRate));
    else setHourlyRate("");
    setCurrency(proposal?.budget.currency ?? prefs.defaultCurrency ?? "USD");
    setFinalState(proposal?.finalState ?? "pending");
    setErrors({});
  }, [open, proposal, initialClientId, prefs.defaultCurrency]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!workTitle.trim()) errs.workTitle = "Required";
    if (budgetType === "fixed") {
      const n = parseFloat(amount);
      if (!Number.isFinite(n) || n < 0) errs.amount = "Enter a valid amount";
    } else {
      const n = parseFloat(hourlyRate);
      if (!Number.isFinite(n) || n < 0) errs.hourlyRate = "Enter a valid rate";
    }
    if (credit !== "") {
      const c = parseInt(credit, 10);
      if (!Number.isInteger(c) || c < 0) errs.credit = "Enter 0 or a positive integer";
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const budget: ProposalBudget =
      budgetType === "fixed"
        ? { type: "fixed", amount: parseFloat(amount), currency }
        : { type: "hourly", hourlyRate: parseFloat(hourlyRate), currency };

    const data = {
      clientId: clientId === "none" ? null : clientId,
      workTitle: workTitle.trim(),
      workDescription,
      submittedProposal,
      additionalFields,
      submittedAt: fromLocalDateTimeInput(submittedAt),
      credit: credit === "" ? null : parseInt(credit, 10),
      budget,
      finalState,
    };

    if (proposal) {
      await updateProposal(proposal.id, data);
      toast.success("Proposal updated");
    } else {
      await createProposal(data);
      toast.success("Proposal created");
    }
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{proposal ? "Edit proposal" : "New proposal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Client</Label>
                <div className="flex gap-2">
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No client</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpenNewClient(true)}>
                    +
                  </Button>
                </div>
              </div>
              <div>
                <Label>Submitted at</Label>
                <Input
                  type="datetime-local"
                  value={submittedAt}
                  onChange={(e) => setSubmittedAt(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Work title *</Label>
              <Input value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} />
              {errors.workTitle && <p className="text-xs text-rose-600 mt-1">{errors.workTitle}</p>}
            </div>
            <div>
              <Label>Work description</Label>
              <Textarea rows={3} value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} />
            </div>
            <div>
              <Label>Submitted proposal</Label>
              <Textarea rows={6} value={submittedProposal} onChange={(e) => setSubmittedProposal(e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-1">
                <Label>Credits / Connects</Label>
                <Input
                  type="number"
                  min={0}
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                />
                {errors.credit && <p className="text-xs text-rose-600 mt-1">{errors.credit}</p>}
              </div>
              <div>
                <Label>Budget type</Label>
                <Select value={budgetType} onValueChange={(v) => setBudgetType(v as "fixed" | "hourly")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {budgetType === "fixed" ? (
                <div>
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
                  {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                </div>
              ) : (
                <div>
                  <Label>Hourly rate</Label>
                  <Input type="number" step="0.01" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                  {errors.hourlyRate && <p className="text-xs text-rose-600 mt-1">{errors.hourlyRate}</p>}
                </div>
              )}
              <div>
                <Label>Currency</Label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))} list="currencies" />
                <datalist id="currencies">
                  {CURRENCIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Additional fields</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setAdditionalFields((a) => [...a, { id: uid(), label: "Notes", value: "" }])
                  }
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {additionalFields.map((f, idx) => (
                  <div key={f.id} className="flex gap-2">
                    <Input
                      className="w-40"
                      list="add-suggestions"
                      value={f.label}
                      onChange={(e) =>
                        setAdditionalFields((a) => a.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                      }
                    />
                    <Input
                      className="flex-1"
                      value={f.value}
                      onChange={(e) =>
                        setAdditionalFields((a) => a.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdditionalFields((a) => a.filter((_, i) => i !== idx))}
                      className="text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <datalist id="add-suggestions">
                  <option value="Screening Question" />
                  <option value="Screening Answer" />
                  <option value="Attachment" />
                  <option value="Job URL" />
                  <option value="Notes" />
                </datalist>
              </div>
            </div>
            <div>
              <Label>Final state</Label>
              <Select value={finalState} onValueChange={(v) => setFinalState(v as ProposalFinalState)}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save proposal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ClientFormDialog
        open={openNewClient}
        client={null}
        onClose={() => setOpenNewClient(false)}
        onSave={async () => {}}
      />
    </>
  );
}

// unused import silencer
void Pencil;
