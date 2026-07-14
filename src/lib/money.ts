// Decimal-safe money helpers using integer minor units (cents).
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "IDR"]);

export function decimalPlaces(currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2;
}

export function toMinor(amount: number, currency: string): number {
  if (!Number.isFinite(amount)) return 0;
  const d = decimalPlaces(currency);
  return Math.round(amount * Math.pow(10, d));
}

export function fromMinor(minor: number, currency: string): number {
  const d = decimalPlaces(currency);
  return minor / Math.pow(10, d);
}

export function isValidAmount(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && !Number.isNaN(n);
}

export type InvoiceCalc = {
  subtotal: number;
  discount: number;
  taxableBase: number;
  tax: number;
  total: number;
};

import type { InvoiceItem } from "./types";

export function lineTotalMinor(item: InvoiceItem, currency: string): number {
  if (item.type === "fixed") {
    return toMinor(item.quantity, currency) * toMinor(item.unitPrice, currency) /
      Math.pow(10, decimalPlaces(currency));
  }
  return toMinor(item.hours, currency) * toMinor(item.hourlyRate, currency) /
    Math.pow(10, decimalPlaces(currency));
}

export function calculateInvoice(
  items: InvoiceItem[],
  discountAmount: number,
  taxRate: number,
  currency: string,
): InvoiceCalc {
  const subtotalMinor = items.reduce((s, it) => s + Math.round(lineTotalMinor(it, currency)), 0);
  const discountMinor = Math.max(0, Math.round(toMinor(discountAmount || 0, currency)));
  const taxableMinor = Math.max(0, subtotalMinor - discountMinor);
  const rate = Number.isFinite(taxRate) ? Math.max(0, taxRate) : 0;
  const taxMinor = Math.round((taxableMinor * rate) / 100);
  const totalMinor = taxableMinor + taxMinor;
  return {
    subtotal: fromMinor(subtotalMinor, currency),
    discount: fromMinor(discountMinor, currency),
    taxableBase: fromMinor(taxableMinor, currency),
    tax: fromMinor(taxMinor, currency),
    total: fromMinor(totalMinor, currency),
  };
}
