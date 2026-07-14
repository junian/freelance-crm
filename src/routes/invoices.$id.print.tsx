import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppData } from "@/lib/app-data";
import { calculateInvoice } from "@/lib/money";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/invoices/$id/print")({
  head: () => ({
    meta: [
      { title: "Print invoice" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PrintPage,
});

function PrintPage() {
  const { id } = Route.useParams();
  const { invoices, ready } = useAppData();
  const inv = invoices.find((i) => i.id === id);

  useEffect(() => {
    if (!ready || !inv) return;
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {
        // ignore blocked print dialog; user can print manually
      }
    }, 500);
    return () => clearTimeout(t);
  }, [ready, inv]);

  if (!ready) return <div className="p-10 text-center text-sm text-slate-500">Loading…</div>;
  if (!inv) return <div className="p-10 text-center">Invoice not found.</div>;

  const calc = calculateInvoice(inv.items, inv.discountAmount, inv.taxRate, inv.currency);

  return (
    <div className="print-page">
      <style>{`
        @page { size: A4; margin: 20mm; }
        html, body { background: white !important; color: #111 !important; }
        .print-actions { display: flex; gap: 8px; padding: 12px; }
        @media print {
          .print-actions { display: none !important; }
          .print-page { padding: 0 !important; }
        }
        .print-doc { max-width: 800px; margin: 0 auto; padding: 32px; color: #111; font-family: ui-sans-serif, system-ui, sans-serif; }
        .print-doc h1 { font-size: 28px; margin: 0 0 4px; }
        .print-doc h2 { font-size: 16px; margin: 0 0 8px; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
        .print-doc table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        .print-doc thead { display: table-header-group; }
        .print-doc th, .print-doc td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 14px; }
        .print-doc th { background: #f8fafc; font-weight: 600; color: #374151; }
        .print-doc tr { page-break-inside: avoid; }
        .print-doc .row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; }
        .print-doc .totals { margin-top: 24px; margin-left: auto; width: 280px; page-break-inside: avoid; }
        .print-doc .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
        .print-doc .grand { border-top: 2px solid #111; margin-top: 8px; padding-top: 8px; font-weight: 700; font-size: 16px; }
        .print-doc .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; font-size: 13px; }
        .print-doc .muted { color: #6b7280; font-size: 12px; }
        .right { text-align: right; }
      `}</style>
      <div className="print-actions">
        <button onClick={() => window.print()} style={{ padding: "6px 12px", background: "#4f46e5", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Print / Save as PDF
        </button>
        <button onClick={() => history.back()} style={{ padding: "6px 12px", background: "#e5e7eb", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Back
        </button>
        <span style={{ fontSize: 12, color: "#6b7280", alignSelf: "center" }}>
          Choose "Save as PDF" in your browser's print dialog.
        </span>
      </div>
      <div className="print-doc">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Invoice</h1>
            <div className="muted">{inv.invoiceNumber}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div><strong>{inv.issuer.name}</strong></div>
            {inv.issuer.contactLines.map((l, i) => <div key={i}>{l}</div>)}
            {inv.issuer.addressLines.map((l, i) => <div key={i} className="muted">{l}</div>)}
            {inv.issuer.taxId && <div className="muted">Tax ID: {inv.issuer.taxId}</div>}
          </div>
        </div>

        <div className="row">
          <div>
            <h2>Bill to</h2>
            <div><strong>{inv.clientSnapshot.name}</strong></div>
            {inv.clientSnapshot.contactLines.map((l, i) => <div key={i}>{l}</div>)}
            {inv.clientSnapshot.addressLines.map((l, i) => <div key={i} className="muted">{l}</div>)}
            {inv.clientSnapshot.taxId && <div className="muted">Tax ID: {inv.clientSnapshot.taxId}</div>}
          </div>
          <div className="meta">
            <div>
              <div className="muted">Issue date</div>
              <div>{formatDate(inv.issueDate)}</div>
            </div>
            <div>
              <div className="muted">Due date</div>
              <div>{formatDate(inv.dueDate)}</div>
            </div>
            <div>
              <div className="muted">Currency</div>
              <div>{inv.currency}</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th className="right">Qty/Hrs</th>
              <th className="right">Rate</th>
              <th className="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td className="right">{it.type === "fixed" ? it.quantity : `${it.hours}h`}</td>
                <td className="right">{formatMoney(it.type === "fixed" ? it.unitPrice : it.hourlyRate, inv.currency)}</td>
                <td className="right">{formatMoney(it.type === "fixed" ? it.quantity * it.unitPrice : it.hours * it.hourlyRate, inv.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="totals-row"><span>Subtotal</span><span>{formatMoney(calc.subtotal, inv.currency)}</span></div>
          {calc.discount > 0 && (
            <div className="totals-row"><span>Discount</span><span>−{formatMoney(calc.discount, inv.currency)}</span></div>
          )}
          {inv.taxRate > 0 && (
            <div className="totals-row"><span>{inv.taxLabel} ({inv.taxRate}%)</span><span>{formatMoney(calc.tax, inv.currency)}</span></div>
          )}
          <div className="totals-row grand"><span>Total</span><span>{formatMoney(calc.total, inv.currency)}</span></div>
        </div>

        {(inv.notes || inv.paymentInstructions) && (
          <div className="row" style={{ marginTop: 40 }}>
            {inv.notes && (
              <div>
                <h2>Notes</h2>
                <div style={{ whiteSpace: "pre-wrap" }}>{inv.notes}</div>
              </div>
            )}
            {inv.paymentInstructions && (
              <div>
                <h2>Payment</h2>
                <div style={{ whiteSpace: "pre-wrap" }}>{inv.paymentInstructions}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
