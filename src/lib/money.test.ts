import { describe, expect, it } from "vitest";

import {
  calculateInvoice,
  decimalPlaces,
  fromMinor,
  isValidAmount,
  lineTotalMinor,
  toMinor,
} from "./money";
import type { InvoiceItem } from "./types";

const fixed = (quantity: number, unitPrice: number): InvoiceItem => ({
  id: "fixed-1",
  type: "fixed",
  description: "Design work",
  quantity,
  unitPrice,
});

const hourly = (hours: number, hourlyRate: number): InvoiceItem => ({
  id: "hourly-1",
  type: "hourly",
  description: "Consulting",
  hours,
  hourlyRate,
});

describe("decimalPlaces", () => {
  it("uses two decimals for most currencies", () => {
    expect(decimalPlaces("USD")).toBe(2);
    expect(decimalPlaces("eur")).toBe(2);
    expect(decimalPlaces("PLN")).toBe(2);
  });

  it("uses zero decimals for zero-decimal currencies", () => {
    expect(decimalPlaces("JPY")).toBe(0);
    expect(decimalPlaces("idr")).toBe(0);
    expect(decimalPlaces("VND")).toBe(0);
  });
});

describe("toMinor / fromMinor", () => {
  it("converts decimal amounts to integer minor units", () => {
    expect(toMinor(19.99, "USD")).toBe(1999);
    expect(toMinor(0, "USD")).toBe(0);
    expect(toMinor(100.4, "JPY")).toBe(100);
  });

  it("converts minor units back to decimal amounts", () => {
    expect(fromMinor(1999, "USD")).toBe(19.99);
    expect(fromMinor(100, "JPY")).toBe(100);
  });

  it("handles invalid amounts safely", () => {
    expect(toMinor(Number.NaN, "USD")).toBe(0);
    expect(toMinor(Number.POSITIVE_INFINITY, "USD")).toBe(0);
  });
});

describe("isValidAmount", () => {
  it("accepts finite numbers only", () => {
    expect(isValidAmount(0)).toBe(true);
    expect(isValidAmount(12.5)).toBe(true);
    expect(isValidAmount(Number.NaN)).toBe(false);
    expect(isValidAmount(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidAmount("12")).toBe(false);
    expect(isValidAmount(null)).toBe(false);
  });
});

describe("lineTotalMinor", () => {
  it("calculates fixed-price line totals in minor units", () => {
    expect(lineTotalMinor(fixed(2, 50.25), "USD")).toBe(10050);
  });

  it("calculates hourly line totals in minor units", () => {
    expect(lineTotalMinor(hourly(1.5, 80), "USD")).toBe(12000);
  });
});

describe("calculateInvoice", () => {
  it("calculates subtotal, discount, tax, and total", () => {
    const result = calculateInvoice([fixed(2, 100), hourly(3, 50)], 50, 10, "USD");

    expect(result).toEqual({
      subtotal: 350,
      discount: 50,
      taxableBase: 300,
      tax: 30,
      total: 330,
    });
  });

  it("clamps discounts to the available subtotal", () => {
    const result = calculateInvoice([fixed(1, 100)], 500, 10, "USD");

    expect(result.subtotal).toBe(100);
    expect(result.discount).toBe(500);
    expect(result.taxableBase).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });

  it("ignores negative tax and discount values", () => {
    const result = calculateInvoice([fixed(1, 100)], -10, -5, "USD");

    expect(result.discount).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(100);
  });

  it("ignores a non-finite tax rate", () => {
    const result = calculateInvoice([fixed(1, 100)], 0, Number.NaN, "USD");

    expect(result.tax).toBe(0);
    expect(result.total).toBe(100);
  });

  it("supports zero-decimal currencies", () => {
    const result = calculateInvoice([fixed(1, 1000)], 0, 10, "JPY");

    expect(result.subtotal).toBe(1000);
    expect(result.tax).toBe(100);
    expect(result.total).toBe(1100);
  });

  it("returns zero totals for an empty invoice", () => {
    expect(calculateInvoice([], 0, 20, "USD")).toEqual({
      subtotal: 0,
      discount: 0,
      taxableBase: 0,
      tax: 0,
      total: 0,
    });
  });
});
