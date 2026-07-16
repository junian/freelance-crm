import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/markdown-editor";
import { useAppData } from "@/lib/app-data";
import { ArrowLeft, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/interviews/$id")({
  head: () => ({
    meta: [
      { title: "Interview — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <InterviewEditor />
    </AppShell>
  ),
});

function InterviewEditor() {
  const { id } = Route.useParams();
  const { interviews, proposals, updateInterview, deleteInterview } = useAppData();
  const interview = interviews.find((i) => i.id === id) ?? null;
  const proposal = interview ? proposals.find((p) => p.id === interview.proposalId) : null;
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();
  const savedRef = useRef(true);

  const initialMarkdown = interview?.notesMarkdown ?? "";

  const handleChange = useCallback(
    async (md: string) => {
      if (!interview) return;
      if (md === interview.notesMarkdown) {
        setSaved(true);
        savedRef.current = true;
        return;
      }
      setSaved(false);
      savedRef.current = false;
      setSaving(true);
      await updateInterview(interview.id, { notesMarkdown: md });
      setSaving(false);
      setSaved(true);
      savedRef.current = true;
    },
    [interview, updateInterview],
  );

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!savedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  if (!interview) {
    return (
      <Card className="p-8 text-center">
        <div className="text-lg font-semibold">Interview not found</div>
        <Link to="/interviews" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Link
        to="/interviews"
        className="text-sm text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Interviews
      </Link>
      <PageHeader
        title={proposal?.workTitle ?? "Interview"}
        description={saving ? "Saving…" : saved ? "Saved locally" : "Unsaved changes"}
        actions={
          <>
            {proposal && (
              <Button asChild variant="outline">
                <Link to="/proposals/$id" params={{ id: proposal.id }}>Open proposal</Link>
              </Button>
            )}
            <Button variant="outline" className="text-rose-600" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        }
      />

      <MarkdownEditor
        key={interview.id}
        value={initialMarkdown}
        onChange={handleChange}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this interview?</AlertDialogTitle>
            <AlertDialogDescription>
              The related proposal will be unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                await deleteInterview(interview.id);
                toast.success("Interview deleted");
                navigate({ to: "/interviews" });
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
