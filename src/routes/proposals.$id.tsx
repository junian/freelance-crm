import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAppData, useClient } from "@/lib/app-data";
import { formatDate, formatMoney } from "@/lib/format";
import { ProposalStateBadge } from "@/components/status-badge";
import { ProposalFormDialog } from "./proposals.index";
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
import { ArrowLeft, Pencil, Copy, MessagesSquare, Trash2, RotateCcw } from "lucide-react";
import type { ProposalFinalState } from "@/lib/types";

export const Route = createFileRoute("/proposals/$id")({
  head: () => ({
    meta: [
      { title: "Proposal — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <ProposalDetail />
    </AppShell>
  ),
});

function ProposalDetail() {
  const { id } = Route.useParams();
  const {
    proposals,
    interviews,
    duplicateProposal,
    softDeleteProposal,
    restoreProposal,
    permanentDeleteProposal,
    createInterview,
    setProposalState,
  } = useAppData();
  const proposal = proposals.find((p) => p.id === id) ?? null;
  const client = useClient(proposal?.clientId);
  const interview = interviews.find((i) => i.id === proposal?.interviewId);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmPermDelete, setConfirmPermDelete] = useState(false);

  if (!proposal) {
    return (
      <Card className="p-8 text-center">
        <div className="text-lg font-semibold">Proposal not found</div>
        <Link to="/proposals" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back to proposals
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Link
        to="/proposals"
        className="text-sm text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Proposals
      </Link>
      <PageHeader
        title={proposal.workTitle || "Untitled proposal"}
        actions={
          <>
            <Select
              value={proposal.finalState}
              onValueChange={(v) => setProposalState(proposal.id, v as ProposalFinalState)}
            >
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const dup = await duplicateProposal(proposal.id);
                if (dup) {
                  toast.success("Duplicated");
                  navigate({ to: "/proposals/$id", params: { id: dup.id } });
                }
              }}
            >
              <Copy className="w-4 h-4 mr-1" /> Duplicate
            </Button>
            {proposal.interviewId ? (
              <Button asChild variant="outline">
                <Link to="/interviews/$id" params={{ id: proposal.interviewId }}>
                  <MessagesSquare className="w-4 h-4 mr-1" /> View interview
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={async () => {
                  const iv = await createInterview(proposal.id);
                  if (iv) {
                    toast.success("Interview created");
                    navigate({ to: "/interviews/$id", params: { id: iv.id } });
                  }
                }}
              >
                <MessagesSquare className="w-4 h-4 mr-1" /> Create interview
              </Button>
            )}
            {proposal.finalState === "deleted" ? (
              <>
                <Button variant="outline" onClick={() => restoreProposal(proposal.id).then(() => toast.success("Restored"))}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Restore
                </Button>
                <Button variant="outline" className="text-rose-600" onClick={() => setConfirmPermDelete(true)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" className="text-rose-600" onClick={() => softDeleteProposal(proposal.id).then(() => toast.success("Moved to deleted"))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1 space-y-3 text-sm">
          <div>
            <div className="text-xs text-slate-500">State</div>
            <ProposalStateBadge state={proposal.finalState} />
          </div>
          <div>
            <div className="text-xs text-slate-500">Client</div>
            {client ? (
              <Link to="/clients/$id" params={{ id: client.id }} className="text-indigo-600 hover:underline">
                {client.firstName} {client.lastName}
              </Link>
            ) : (
              <span className="text-slate-500">No client linked</span>
            )}
          </div>
          <div>
            <div className="text-xs text-slate-500">Submitted</div>
            <div>{formatDate(proposal.submittedAt, true)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Budget</div>
            <div>
              {proposal.budget.type === "fixed"
                ? formatMoney(proposal.budget.amount, proposal.budget.currency)
                : `${formatMoney(proposal.budget.hourlyRate, proposal.budget.currency)}/hr`}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Credits / Connects</div>
            <div>{proposal.credit ?? "—"}</div>
          </div>
        </Card>
        <div className="lg:col-span-2 space-y-4">
          {proposal.workDescription && (
            <Card className="p-5">
              <div className="font-semibold mb-2">Work description</div>
              <p className="whitespace-pre-wrap text-sm">{proposal.workDescription}</p>
            </Card>
          )}
          {proposal.submittedProposal && (
            <Card className="p-5">
              <div className="font-semibold mb-2">Submitted proposal</div>
              <p className="whitespace-pre-wrap text-sm">{proposal.submittedProposal}</p>
            </Card>
          )}
          {proposal.additionalFields.length > 0 && (
            <Card className="p-5">
              <div className="font-semibold mb-2">Additional fields</div>
              <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                {proposal.additionalFields.map((f) => (
                  <div key={f.id}>
                    <dt className="text-xs text-slate-500">{f.label}</dt>
                    <dd className="whitespace-pre-wrap break-words">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}
          {interview && (
            <Card className="p-5">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Interview notes</div>
                <Link
                  to="/interviews/$id"
                  params={{ id: interview.id }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Open editor
                </Link>
              </div>
              <p className="text-sm text-slate-500 line-clamp-4 whitespace-pre-wrap">
                {interview.notesMarkdown || "No notes yet."}
              </p>
            </Card>
          )}
        </div>
      </div>

      <ProposalFormDialog
        open={editing}
        proposal={proposal}
        onClose={() => setEditing(false)}
      />

      <AlertDialog open={confirmPermDelete} onOpenChange={setConfirmPermDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete this proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              Its interview (if any) will also be deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                await permanentDeleteProposal(proposal.id);
                toast.success("Proposal permanently deleted");
                navigate({ to: "/proposals" });
              }}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
