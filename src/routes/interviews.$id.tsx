import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppData } from "@/lib/app-data";
import { renderMarkdown } from "@/lib/markdown";
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
  const [notes, setNotes] = useState(interview?.notesMarkdown ?? "");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const lastLoadedId = useRef<string | null>(null);

  useEffect(() => {
    if (interview && lastLoadedId.current !== interview.id) {
      setNotes(interview.notesMarkdown);
      lastLoadedId.current = interview.id;
      setSaved(true);
    }
  }, [interview]);

  useEffect(() => {
    if (!interview) return;
    if (notes === interview.notesMarkdown) return;
    setSaved(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      setSaving(true);
      await updateInterview(interview.id, { notesMarkdown: notes });
      setSaving(false);
      setSaved(true);
    }, 600);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saved]);

  const rendered = useMemo(() => renderMarkdown(notes), [notes]);

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

      <Tabs defaultValue="split">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <MarkdownToolbar onInsert={(t) => setNotes((n) => n + t)} />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={22}
            className="font-mono text-sm"
          />
        </TabsContent>
        <TabsContent value="preview">
          <Card className="p-6 prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: rendered }} />
          </Card>
        </TabsContent>
        <TabsContent value="split">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <MarkdownToolbar onInsert={(t) => setNotes((n) => n + t)} />
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={22}
                className="font-mono text-sm"
              />
            </div>
            <Card className="p-6 prose prose-slate dark:prose-invert max-w-none overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: rendered }} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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

function MarkdownToolbar({ onInsert }: { onInsert: (t: string) => void }) {
  const buttons = [
    { label: "H2", insert: "\n## " },
    { label: "Bold", insert: "**bold**" },
    { label: "Italic", insert: "_italic_" },
    { label: "List", insert: "\n- item" },
    { label: "Check", insert: "\n- [ ] task" },
    { label: "Quote", insert: "\n> " },
    { label: "Code", insert: "`code`" },
    { label: "Link", insert: "[text](https://)" },
  ];
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {buttons.map((b) => (
        <Button key={b.label} size="sm" variant="outline" onClick={() => onInsert(b.insert)}>
          {b.label}
        </Button>
      ))}
    </div>
  );
}
