import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/app-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Copy } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { uid } from "@/lib/storage";
import type {
  Invoice,
  InvoiceItem,
  InvoicePartySnapshot,
  InvoiceStatus,
  FixedPriceInvoiceItem,
  HourlyInvoiceItem,
} from "@/lib/types";
import { CURRENCIES } from "@/lib/types";
import { localDateInputValue, formatMoney } from "@/lib/format";
import { calculateInvoice } from "@/lib/money";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  initial?: Invoice;
  initialClientId?: string | null;
  onSaved?: (inv: Invoice) => void;
};

const emptyParty = (): InvoicePartySnapshot => ({
  name: "",
  contactLines: [],
  addressLines: [],
  taxId: "",
});

export function InvoiceForm({ initial, initialClientId, onSaved }: Props) {
  const { clients, prefs, createInvoice, updateInvoice, nextInvoiceNumber, setPrefs } = useAppData();
  const navigate = useNavigate();

  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoiceNumber ?? nextInvoiceNumber());
  const [clientId, setClientId] = useState<string>(initial?.clientId ?? initialClientId ?? "none");
  const [clientSnapshot, setClientSnapshot] = useState<InvoicePartySnapshot>(
    initial?.clientSnapshot ?? emptyParty(),
  );
  const [issuer, setIssuer] = useState<InvoicePartySnapshot>(
    initial?.issuer ?? prefs.defaultIssuer,
  );
  const [issueDate, setIssueDate] = useState(localDateInputValue(initial?.issueDate ?? new Date().toISOString()));
  const [dueDate, setDueDate] = useState(initial?.dueDate ? localDateInputValue(initial.dueDate) : "");
  const [currency, setCurrency] = useState(initial?.currency ?? prefs.defaultCurrency ?? "USD");
  const [status, setStatus] = useState<InvoiceStatus>(initial?.status ?? "draft");
  const [items, setItems] = useState<InvoiceItem[]>(
    initial?.items ?? [
      { id: uid(), type: "fixed", description: "", quantity: 1, unitPrice: 0 },
    ],
  );
  const [discountAmount, setDiscountAmount] = useState(String(initial?.discountAmount ?? 0));
  const [taxLabel, setTaxLabel] = useState(initial?.taxLabel ?? "Tax");
  const [taxRate, setTaxRate] = useState(String(initial?.taxRate ?? 0));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [paymentInstructions, setPaymentInstructions] = useState(initial?.paymentInstructions ?? "");
  const [dirty, setDirty] = useState(false);
  const [snapshotEditedManually, setSnapshotEditedManually] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const markDirty = () => setDirty(true);

  const applyClient = (id: string) => {
    setClientId(id);
    markDirty();
    if (id === "none") return;
    const c = clients.find((cl) => cl.id === id);
    if (!c) return;
    if (snapshotEditedManually && clientSnapshot.name) {
      if (!confirm("Replace the recipient snapshot with this client's details?")) return;
    }
    setClientSnapshot({
      name: `${c.firstName} ${c.lastName}`.trim(),
      contactLines: c.contacts.map((cf) => `${cf.label}: ${cf.value}`),
      addressLines: [],
      taxId: "",
    });
    setSnapshotEditedManually(false);
  };

  const updateItem = <T extends InvoiceItem>(idx: number, patch: Partial<T>) => {
    setItems((arr) => arr.map((it, i) => (i === idx ? ({ ...it, ...patch } as InvoiceItem) : it)));
    markDirty();
  };

  const changeItemType = (idx: number, newType: "fixed" | "hourly") => {
    const current = items[idx];
    if (current.type === newType) return;
    const hasValues =
      current.type === "fixed"
        ? current.quantity !== 1 || current.unitPrice !== 0
        : current.hours !== 0 || current.hourlyRate !== 0;
    if (hasValues && !confirm("Switching item type will discard some values. Continue?")) return;
    const desc = current.description;
    const id = current.id;
    const next: InvoiceItem =
      newType === "fixed"
        ? { id, type: "fixed", description: desc, quantity: 1, unitPrice: 0 }
        : { id, type: "hourly", description: desc, hours: 0, hourlyRate: 0 };
    setItems((arr) => arr.map((it, i) => (i === idx ? next : it)));
    markDirty();
  };

  const calc = useMemo(
    () => calculateInvoice(items, parseFloat(discountAmount) || 0, parseFloat(taxRate) || 0, currency),
    [items, discountAmount, taxRate, currency],
  );

  const validate = (): string | null => {
    if (!invoiceNumber.trim()) return "Invoice number is required";
    if (!items.length) return "Add at least one item";
    for (const it of items) {
      if (!it.description.trim()) return "Every item needs a description";
      if (it.type === "fixed") {
        if (!(it.quantity > 0)) return "Quantity must be greater than zero";
        if (!(it.unitPrice >= 0) || !Number.isFinite(it.unitPrice)) return "Invalid unit price";
      } else {
        if (!(it.hours > 0)) return "Hours must be greater than zero";
        if (!(it.hourlyRate >= 0) || !Number.isFinite(it.hourlyRate)) return "Invalid hourly rate";
      }
    }
    const d = parseFloat(discountAmount);
    if (discountAmount !== "" && (!Number.isFinite(d) || d < 0)) return "Invalid discount";
    const t = parseFloat(taxRate);
    if (taxRate !== "" && (!Number.isFinite(t) || t < 0)) return "Invalid tax rate";
    return null;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    const payload = {
      invoiceNumber: invoiceNumber.trim(),
      clientId: clientId === "none" ? null : clientId,
      clientSnapshot,
      issuer,
      issueDate: new Date(issueDate).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      currency: currency.toUpperCase(),
      status,
      items,
      discountAmount: parseFloat(discountAmount) || 0,
      taxLabel,
      taxRate: parseFloat(taxRate) || 0,
      notes,
      paymentInstructions,
    };

    // Save issuer as default if changed
    if (JSON.stringify(issuer) !== JSON.stringify(prefs.defaultIssuer)) {
      await setPrefs({ ...prefs, defaultIssuer: issuer });
    }

    let saved: Invoice;
    if (initial) {
      await updateInvoice(initial.id, payload);
      saved = { ...initial, ...payload } as Invoice;
      toast.success("Invoice updated");
    } else {
      saved = await createInvoice(payload);
      toast.success("Invoice created");
    }
    setDirty(false);
    if (onSaved) onSaved(saved);
    else navigate({ to: "/invoices/$id", params: { id: saved.id } });
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Invoice number *</Label>
          <Input value={invoiceNumber} onChange={(e) => { setInvoiceNumber(e.target.value); markDirty(); }} />
        </div>
        <div>
          <Label>Issue date</Label>
          <Input type="date" value={issueDate} onChange={(e) => { setIssueDate(e.target.value); markDirty(); }} />
        </div>
        <div>
          <Label>Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => { setDueDate(e.target.value); markDirty(); }} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Currency</Label>
          <Input value={currency} onChange={(e) => { setCurrency(e.target.value.toUpperCase().slice(0, 3)); markDirty(); }} list="currencies" />
          <datalist id="currencies">{CURRENCIES.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => { setStatus(v as InvoiceStatus); markDirty(); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Client</Label>
          <Select value={clientId} onValueChange={applyClient}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Standalone (no client)</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PartyEditor
          title="From"
          party={issuer}
          onChange={(p) => { setIssuer(p); markDirty(); }}
        />
        <PartyEditor
          title="Bill to"
          party={clientSnapshot}
          onChange={(p) => { setClientSnapshot(p); setSnapshotEditedManually(true); markDirty(); }}
        />
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold">Items</div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => { setItems((a) => [...a, { id: uid(), type: "fixed", description: "", quantity: 1, unitPrice: 0 }]); markDirty(); }}>
              <Plus className="w-3 h-3 mr-1" /> Fixed
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setItems((a) => [...a, { id: uid(), type: "hourly", description: "", hours: 1, hourlyRate: 0 }]); markDirty(); }}>
              <Plus className="w-3 h-3 mr-1" /> Hourly
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={it.id} className="grid gap-2 md:grid-cols-12 items-start border-b pb-3 dark:border-slate-800">
              <div className="md:col-span-5">
                <Label className="text-xs">Description</Label>
                <Input value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Type</Label>
                <Select value={it.type} onValueChange={(v) => changeItemType(idx, v as "fixed" | "hourly")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {it.type === "fixed" ? (
                <>
                  <div className="md:col-span-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={it.quantity}
                      onChange={(e) => updateItem<FixedPriceInvoiceItem>(idx, { quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Unit price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={it.unitPrice}
                      onChange={(e) => updateItem<FixedPriceInvoiceItem>(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-1">
                    <Label className="text-xs">Hours</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={it.hours}
                      onChange={(e) => updateItem<HourlyInvoiceItem>(idx, { hours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={it.hourlyRate}
                      onChange={(e) => updateItem<HourlyInvoiceItem>(idx, { hourlyRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}
              <div className="md:col-span-1 text-right">
                <Label className="text-xs">Total</Label>
                <div className="pt-2 text-sm font-medium">
                  {formatMoney(
                    it.type === "fixed" ? it.quantity * it.unitPrice : it.hours * it.hourlyRate,
                    currency,
                  )}
                </div>
              </div>
              <div className="md:col-span-1 flex gap-1 justify-end pt-5">
                <Button type="button" size="sm" variant="ghost" onClick={() => { setItems((a) => [...a, { ...it, id: uid() }]); markDirty(); }}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" className="text-rose-600" onClick={() => { setItems((a) => a.filter((_, i) => i !== idx)); markDirty(); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => { setNotes(e.target.value); markDirty(); }} />
          </div>
          <div>
            <Label>Payment instructions</Label>
            <Textarea rows={3} value={paymentInstructions} onChange={(e) => { setPaymentInstructions(e.target.value); markDirty(); }} />
          </div>
        </div>
        <Card className="p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(calc.subtotal, currency)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label className="text-xs">Discount</Label>
            <Input
              className="col-span-2"
              type="number"
              step="0.01"
              min={0}
              value={discountAmount}
              onChange={(e) => { setDiscountAmount(e.target.value); markDirty(); }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Input
              className="col-span-1"
              value={taxLabel}
              onChange={(e) => { setTaxLabel(e.target.value); markDirty(); }}
              placeholder="Tax label"
            />
            <div className="col-span-2 flex gap-2 items-center">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={taxRate}
                onChange={(e) => { setTaxRate(e.target.value); markDirty(); }}
              />
              <span className="text-slate-500">%</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span>{taxLabel} ({taxRate || 0}%)</span>
            <span>{formatMoney(calc.tax, currency)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2 dark:border-slate-800">
            <span>Total</span>
            <span>{formatMoney(calc.total, currency)}</span>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => history.back()}>Cancel</Button>
        <Button type="submit">Save invoice</Button>
      </div>
    </form>
  );
}

function PartyEditor({
  title,
  party,
  onChange,
}: {
  title: string;
  party: InvoicePartySnapshot;
  onChange: (p: InvoicePartySnapshot) => void;
}) {
  return (
    <Card className="p-4 space-y-2">
      <div className="font-semibold">{title}</div>
      <Input placeholder="Name" value={party.name} onChange={(e) => onChange({ ...party, name: e.target.value })} />
      <Textarea
        rows={2}
        placeholder="Contact lines (one per line)"
        value={party.contactLines.join("\n")}
        onChange={(e) => onChange({ ...party, contactLines: e.target.value.split("\n") })}
      />
      <Textarea
        rows={2}
        placeholder="Address lines (one per line)"
        value={party.addressLines.join("\n")}
        onChange={(e) => onChange({ ...party, addressLines: e.target.value.split("\n") })}
      />
      <Input placeholder="Tax ID" value={party.taxId} onChange={(e) => onChange({ ...party, taxId: e.target.value })} />
    </Card>
  );
}
