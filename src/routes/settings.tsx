import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from "@/lib/app-data";
import { seedDemoIfNeeded } from "@/lib/seed";
import {
  downloadCsv,
  downloadJson,
  exportBackup,
  importBackup,
  resetAll,
  validateBackup,
} from "@/lib/backup";
import { calculateInvoice } from "@/lib/money";
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

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Freelance CRM" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AppShell>
      <SettingsPage />
    </AppShell>
  ),
});

function SettingsPage() {
  const { prefs, setPrefs, clients, proposals, interviews, invoices, refresh, deleteDemoData } =
    useAppData();
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
  const [pending, setPending] = useState<null | { data: ReturnType<typeof validateBackup> }>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    const data = await exportBackup();
    downloadJson(`freelance-crm-backup-${new Date().toISOString().slice(0, 10)}.json`, data);
    toast.success("Backup exported");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = validateBackup(parsed);
      setPending({ data });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid backup file");
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    try {
      await importBackup(pending.data, importMode);
      await refresh();
      toast.success("Backup imported");
      setPending(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    }
  };

  const exportProposalsCsv = () => {
    const rows = [
      [
        "Work title",
        "Client",
        "State",
        "Budget type",
        "Amount",
        "Hourly rate",
        "Currency",
        "Credits",
        "Submitted at",
        "Description",
      ],
    ];
    for (const p of proposals) {
      const client = clients.find((c) => c.id === p.clientId);
      rows.push([
        p.workTitle,
        client ? `${client.firstName} ${client.lastName}` : "",
        p.finalState,
        p.budget.type,
        p.budget.type === "fixed" ? String(p.budget.amount) : "",
        p.budget.type === "hourly" ? String(p.budget.hourlyRate) : "",
        p.budget.currency,
        p.credit == null ? "" : String(p.credit),
        p.submittedAt,
        p.workDescription,
      ]);
    }
    downloadCsv(`proposals-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const exportInvoicesCsv = () => {
    const rows = [
      [
        "Invoice #",
        "Recipient",
        "Issue date",
        "Due date",
        "Status",
        "Currency",
        "Subtotal",
        "Discount",
        "Tax",
        "Total",
        "Item count",
      ],
    ];
    for (const inv of invoices) {
      const c = calculateInvoice(inv.items, inv.discountAmount, inv.taxRate, inv.currency);
      rows.push([
        inv.invoiceNumber,
        inv.clientSnapshot.name,
        inv.issueDate,
        inv.dueDate ?? "",
        inv.status,
        inv.currency,
        c.subtotal.toFixed(2),
        c.discount.toFixed(2),
        c.tax.toFixed(2),
        c.total.toFixed(2),
        String(inv.items.length),
      ]);
    }
    downloadCsv(`invoices-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <>
      <PageHeader title="Settings" description="All data lives in this browser." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="font-semibold mb-3">Appearance</div>
          <Label>Theme</Label>
          <Select
            value={prefs.theme}
            onValueChange={(v) => setPrefs({ ...prefs, theme: v as "light" | "dark" | "system" })}
          >
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-5">
          <div className="font-semibold mb-3">Local record counts</div>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between"><span>Clients</span><strong>{clients.length}</strong></li>
            <li className="flex justify-between"><span>Proposals</span><strong>{proposals.length}</strong></li>
            <li className="flex justify-between"><span>Interviews</span><strong>{interviews.length}</strong></li>
            <li className="flex justify-between"><span>Invoices</span><strong>{invoices.length}</strong></li>
          </ul>
        </Card>

        <Card className="p-5">
          <div className="font-semibold mb-3">Backup & restore</div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={doExport}>Export JSON backup</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>Import JSON backup</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Backups are generated locally in your browser. No data leaves your device.
          </p>
        </Card>

        <Card className="p-5">
          <div className="font-semibold mb-3">CSV exports</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportProposalsCsv}>Export proposals CSV</Button>
            <Button variant="outline" onClick={exportInvoicesCsv}>Export invoices CSV</Button>
          </div>
        </Card>

        <StorageUsageCard />



        <Card className="p-5 md:col-span-2 border-rose-200 dark:border-rose-900/50">
          <div className="font-semibold mb-3 text-rose-700 dark:text-rose-400">Danger zone</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={async () => { await deleteDemoData(); toast.success("Demo data removed"); }}>
              Delete demo data
            </Button>
            <Button variant="destructive" onClick={() => setConfirmReset(true)}>
              Reset all data
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Reset permanently deletes every record stored by this app in this browser.
          </p>
        </Card>

        <Card className="p-5 md:col-span-2">
          <div className="font-semibold mb-2">Privacy</div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your CRM and invoice data is stored only in this browser using IndexedDB. It is
            never sent to any server. Clearing browser storage or switching devices will
            remove your local records. Keep regular JSON backups.
          </p>
        </Card>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import backup</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && (
                <>
                  This backup contains {pending.data.clients.length} clients,{" "}
                  {pending.data.proposals.length} proposals, {pending.data.interviews.length} interviews,{" "}
                  and {pending.data.invoices.length} invoices.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label>Import mode</Label>
            <Select value={importMode} onValueChange={(v) => setImportMode(v as "merge" | "replace")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="merge">Merge (newest wins)</SelectItem>
                <SelectItem value="replace">Replace all existing data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReset} onOpenChange={(o) => { if (!o) { setConfirmReset(false); setResetConfirmText(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes every record. Type <strong>DELETE</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={resetConfirmText} onChange={(e) => setResetConfirmText(e.target.value)} placeholder="Type DELETE" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={resetConfirmText !== "DELETE"}
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                await resetAll();
                await seedDemoIfNeeded();
                await refresh();
                toast.success("All data deleted");
                setConfirmReset(false);
                setResetConfirmText("");
              }}
            >
              Reset everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
}

function StorageUsageCard() {
  const { clients, proposals, interviews, invoices, prefs } = useAppData();
  const [estimate, setEstimate] = useState<{ usage: number; quota: number } | null>(null);
  const [supported, setSupported] = useState(true);

  const appUsage = useMemo(() => {
    try {
      const payload = JSON.stringify({ clients, proposals, interviews, invoices, prefs });
      return new Blob([payload]).size;
    } catch {
      return 0;
    }
  }, [clients, proposals, interviews, invoices, prefs]);

  const refresh = async () => {
    if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.estimate) {
      setSupported(false);
      return;
    }
    try {
      const est = await navigator.storage.estimate();
      setEstimate({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
    } catch {
      setSupported(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUsage]);

  const usage = estimate?.usage ?? 0;
  const quota = estimate?.quota ?? 0;
  const other = Math.max(0, usage - appUsage);
  const available = Math.max(0, quota - usage);
  const appPct = quota ? Math.min(100, (appUsage / quota) * 100) : 0;
  const otherPct = quota ? Math.min(100, (other / quota) * 100) : 0;

  return (
    <Card className="p-5 md:col-span-2">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <div className="font-semibold">Storage usage</div>
          <p className="text-xs text-slate-500 mt-1">
            Estimates come from your browser. Quotas vary by device and free disk space.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>
      </div>

      {!supported ? (
        <p className="text-sm text-slate-500">
          Your browser doesn&apos;t expose storage estimates.
        </p>
      ) : (
        <>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-3">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${appPct}%` }}
              title={`This app: ${formatBytes(appUsage)}`}
            />
            <div
              className="h-full bg-slate-400 dark:bg-slate-600"
              style={{ width: `${otherPct}%` }}
              title={`Other site data: ${formatBytes(other)}`}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="This app" value={formatBytes(appUsage)} accent="indigo" />
            <Stat label="Other site data" value={formatBytes(other)} accent="slate" />
            <Stat label="Available" value={formatBytes(available)} />
            <Stat label="Total quota" value={formatBytes(quota)} />
          </div>

          <p className="text-xs text-slate-500 mt-3">
            &quot;Other site data&quot; includes anything this origin has stored outside the CRM
            (browser caches, service worker assets, cookies indexed by storage).
          </p>
        </>
      )}
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "indigo" | "slate";
}) {
  const dot =
    accent === "indigo"
      ? "bg-indigo-500"
      : accent === "slate"
        ? "bg-slate-400 dark:bg-slate-600"
        : "";
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 p-3">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        {dot && <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />}
        {label}
      </div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}

