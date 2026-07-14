import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Card, EmptyState, PageHeader } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from "@/lib/app-data";
import { formatDate } from "@/lib/format";
import { ProposalStateBadge } from "@/components/status-badge";

export const Route = createFileRoute("/interviews/")({
  head: () => ({
    meta: [
      { title: "Interviews — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <InterviewsPage />
    </AppShell>
  ),
});

function InterviewsPage() {
  const { interviews, proposals, clients } = useAppData();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  const enriched = useMemo(() => {
    return interviews.map((iv) => {
      const p = proposals.find((x) => x.id === iv.proposalId);
      const c = p ? clients.find((cl) => cl.id === p.clientId) : null;
      return { iv, proposal: p, client: c };
    });
  }, [interviews, proposals, clients]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    const list = enriched.filter(({ iv, proposal, client }) => {
      if (!ql) return true;
      const hay = [
        proposal?.workTitle ?? "",
        client ? `${client.firstName} ${client.lastName}` : "",
        iv.notesMarkdown,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(ql);
    });
    list.sort((a, b) => {
      if (sort === "oldest") return a.iv.createdAt.localeCompare(b.iv.createdAt);
      if (sort === "title")
        return (a.proposal?.workTitle ?? "").localeCompare(b.proposal?.workTitle ?? "");
      if (sort === "updated") return b.iv.updatedAt.localeCompare(a.iv.updatedAt);
      return b.iv.createdAt.localeCompare(a.iv.createdAt);
    });
    return list;
  }, [enriched, q, sort]);

  return (
    <>
      <PageHeader
        title="Interviews"
        description={`${interviews.length} interview${interviews.length === 1 ? "" : "s"}`}
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          className="max-w-sm"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="title">Proposal title</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No interviews yet"
          description="Create an interview from a proposal's detail page."
          action={
            <Button asChild>
              <Link to="/proposals">Go to proposals</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y dark:divide-slate-800">
            {filtered.map(({ iv, proposal, client }) => (
              <li key={iv.id}>
                <Link
                  to="/interviews/$id"
                  params={{ id: iv.id }}
                  className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {proposal?.workTitle ?? "(proposal missing)"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {client ? `${client.firstName} ${client.lastName}` : "No client"} · Updated{" "}
                        {formatDate(iv.updatedAt)}
                      </div>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2 whitespace-pre-wrap">
                        {iv.notesMarkdown || "—"}
                      </p>
                    </div>
                    {proposal && <ProposalStateBadge state={proposal.finalState} />}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
