import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Pencil } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { uid } from "@/lib/storage";
import type { Client, ContactField } from "@/lib/types";
import { formatDate } from "@/lib/format";
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

export const Route = createFileRoute("/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <ClientsPage />
    </AppShell>
  ),
});

const CONTACT_SUGGESTIONS = [
  "Email",
  "Phone",
  "Upwork Profile",
  "LinkedIn",
  "Website",
  "Telegram",
  "Other",
];

function ClientsPage() {
  const { clients, proposals, invoices, createClient, updateClient, deleteClient } = useAppData();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    if (hash === "new") setCreating(true);
  }, [hash]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    const list = clients.filter((c) => {
      if (!ql) return true;
      if (c.firstName.toLowerCase().includes(ql)) return true;
      if (c.lastName.toLowerCase().includes(ql)) return true;
      return c.contacts.some((cf) => cf.value.toLowerCase().includes(ql));
    });
    return list.sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });
  }, [clients, q, sort]);

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${clients.length} record${clients.length === 1 ? "" : "s"} stored locally.`}
        actions={
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New client
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Search name or contact…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="newest">Sort: Newest</SelectItem>
            <SelectItem value="updated">Sort: Recently updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={clients.length === 0 ? "No clients yet" : "No matches"}
          description={
            clients.length === 0 ? "Create your first client to get started." : "Try a different search."
          }
          action={
            clients.length === 0 && (
              <Button onClick={() => setCreating(true)}>Create first client</Button>
            )
          }
        />
      ) : (
        <Card>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Primary contact</th>
                  <th className="p-3">Proposals</th>
                  <th className="p-3">Invoices</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const pcount = proposals.filter(
                    (p) => p.clientId === c.id && p.finalState !== "deleted",
                  ).length;
                  const icount = invoices.filter((i) => i.clientId === c.id).length;
                  const primary = c.contacts[0]?.value ?? "—";
                  return (
                    <tr key={c.id} className="border-b last:border-0 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3">
                        <Link
                          to="/clients/$id"
                          params={{ id: c.id }}
                          className="font-medium hover:text-indigo-600"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 truncate max-w-[220px]">
                        {primary}
                      </td>
                      <td className="p-3">{pcount}</td>
                      <td className="p-3">{icount}</td>
                      <td className="p-3 text-slate-500">{formatDate(c.updatedAt)}</td>
                      <td className="p-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(c.id)}
                          className="text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y dark:divide-slate-800">
            {filtered.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex justify-between">
                  <Link
                    to="/clients/$id"
                    params={{ id: c.id }}
                    className="font-medium hover:text-indigo-600"
                  >
                    {c.firstName} {c.lastName}
                  </Link>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(c.id)}
                      className="text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-slate-500 mt-1">{c.contacts[0]?.value ?? "—"}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ClientFormDialog
        open={creating || editing !== null}
        client={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={async (data) => {
          if (editing) {
            await updateClient(editing.id, data);
            toast.success("Client updated");
          } else {
            await createClient(data);
            toast.success("Client created");
          }
        }}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              Related proposals and invoices will remain but become unlinked. Invoice recipient
              snapshots are preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) {
                  await deleteClient(deleteId);
                  toast.success("Client deleted");
                  setDeleteId(null);
                }
              }}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ClientFormDialog({
  open,
  client,
  onClose,
  onSave,
}: {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (data: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contacts, setContacts] = useState<ContactField[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFirstName(client?.firstName ?? "");
      setLastName(client?.lastName ?? "");
      setContacts(client?.contacts ?? []);
      setErrors({});
    }
  }, [open, client]);

  const addContact = () =>
    setContacts((c) => [...c, { id: uid(), label: "Email", value: "" }]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    contacts.forEach((c) => {
      if (c.label.toLowerCase().includes("email") && c.value) {
        if (!/^\S+@\S+\.\S+$/.test(c.value)) errs[c.id] = "Invalid email";
      }
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    await onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contacts: contacts.filter((c) => c.label && c.value),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "New client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>First name *</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label>Last name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Contacts</Label>
              <Button type="button" size="sm" variant="outline" onClick={addContact}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {contacts.map((c, idx) => (
                <div key={c.id} className="flex gap-2 items-start">
                  <Select
                    value={c.label}
                    onValueChange={(v) =>
                      setContacts((arr) => arr.map((x, i) => (i === idx ? { ...x, label: v } : x)))
                    }
                  >
                    <SelectTrigger className="w-36 flex-shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_SUGGESTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1">
                    <Input
                      value={c.value}
                      onChange={(e) =>
                        setContacts((arr) =>
                          arr.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)),
                        )
                      }
                      placeholder="Value"
                    />
                    {errors[c.id] && (
                      <p className="text-xs text-rose-600 mt-1">{errors[c.id]}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setContacts((arr) => arr.filter((_, i) => i !== idx))
                    }
                    className="text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="text-xs text-slate-500">No contacts yet.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Suppress unused-import warnings when navigate isn't needed here
void useNavigate;
