import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAppData, useClient } from "@/lib/app-data";
import { formatDate } from "@/lib/format";
import { ClientFormDialog } from "./clients.index";
import { ProposalStateBadge, InvoiceStatusBadge } from "@/components/status-badge";
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
import { ArrowLeft, FileText, Receipt, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/clients/$id")({
  head: () => ({
    meta: [
      { title: "Client — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <ClientDetail />
    </AppShell>
  ),
});

function ClientDetail() {
  const { id } = Route.useParams();
  const client = useClient(id);
  const { proposals, invoices, updateClient, deleteClient } = useAppData();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!client) {
    return (
      <Card className="p-8 text-center">
        <div className="text-lg font-semibold">Client not found</div>
        <Link to="/clients" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back to clients
        </Link>
      </Card>
    );
  }

  const clientProposals = proposals.filter(
    (p) => p.clientId === client.id && p.finalState !== "deleted",
  );
  const clientInvoices = invoices.filter((i) => i.clientId === client.id);

  const contactHref = (c: { label: string; value: string }): string | undefined => {
    const l = c.label.toLowerCase();
    if (l.includes("email")) return `mailto:${c.value}`;
    if (l.includes("phone") || l.includes("tel")) return `tel:${c.value.replace(/\s+/g, "")}`;
    if (/^https?:\/\//i.test(c.value)) return c.value;
    return undefined;
  };

  return (
    <>
      <Link
        to="/clients"
        className="text-sm text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Clients
      </Link>
      <PageHeader
        title={`${client.firstName} ${client.lastName}`.trim()}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate({ to: "/proposals", hash: `new-for-${client.id}` })
              }
            >
              <FileText className="w-4 h-4 mr-1" /> New proposal
            </Button>
            <Button
              onClick={() =>
                navigate({ to: "/invoices/new", search: { client: client.id } as never })
              }
            >
              <Receipt className="w-4 h-4 mr-1" /> New invoice
            </Button>
            <Button
              variant="outline"
              className="text-rose-600"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="font-semibold mb-3">Contacts</div>
          {client.contacts.length === 0 ? (
            <p className="text-sm text-slate-500">No contacts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {client.contacts.map((c) => {
                const href = contactHref(c);
                return (
                  <li key={c.id}>
                    <div className="text-xs text-slate-500">{c.label}</div>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline break-all"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <span className="break-all">{c.value}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 text-xs text-slate-500">
            Created {formatDate(client.createdAt)} · Updated {formatDate(client.updatedAt)}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="font-semibold mb-3">Proposals ({clientProposals.length})</div>
            {clientProposals.length === 0 ? (
              <p className="text-sm text-slate-500">No proposals for this client yet.</p>
            ) : (
              <ul className="divide-y dark:divide-slate-800">
                {clientProposals.map((p) => (
                  <li key={p.id} className="py-2">
                    <Link
                      to="/proposals/$id"
                      params={{ id: p.id }}
                      className="flex justify-between items-center hover:text-indigo-600"
                    >
                      <span className="truncate">{p.workTitle}</span>
                      <ProposalStateBadge state={p.finalState} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-5">
            <div className="font-semibold mb-3">Invoices ({clientInvoices.length})</div>
            {clientInvoices.length === 0 ? (
              <p className="text-sm text-slate-500">No invoices yet.</p>
            ) : (
              <ul className="divide-y dark:divide-slate-800">
                {clientInvoices.map((i) => (
                  <li key={i.id} className="py-2">
                    <Link
                      to="/invoices/$id"
                      params={{ id: i.id }}
                      className="flex justify-between items-center hover:text-indigo-600"
                    >
                      <span className="truncate">
                        {i.invoiceNumber} — {formatDate(i.issueDate)}
                      </span>
                      <InvoiceStatusBadge status={i.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ClientFormDialog
        open={editing}
        client={client}
        onClose={() => setEditing(false)}
        onSave={async (data) => {
          await updateClient(client.id, data);
          toast.success("Client updated");
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              Related proposals and invoices will remain but become unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                await deleteClient(client.id);
                toast.success("Client deleted");
                navigate({ to: "/clients" });
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
