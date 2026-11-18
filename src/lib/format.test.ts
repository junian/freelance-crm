import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatMoney,
  fromLocalDateTimeInput,
  isoNow,
  localDateInputValue,
  localDateTimeInputValue,
} from "./format";

describe("formatDate", () => {
  it("returns a dash for missing or invalid dates", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formats a valid ISO date", () => {
    const formatted = formatDate("2026-11-18T12:00:00.000Z");
    expect(formatted).toContain("2026");
    expect(formatted).not.toBe("—");
  });

  it("formats with a time when requested", () => {
    const formatted = formatDate("2026-11-18T12:00:00.000Z", true);
    expect(formatted).toContain("2026");
    expect(formatted.length).toBeGreaterThan(formatDate("2026-11-18T12:00:00.000Z").length);
  });
});

describe("formatMoney", () => {
  it("formats a known currency", () => {
    expect(formatMoney(1234.5, "USD")).toMatch(/1\D?234\D?50/);
  });

  it("falls back to a plain amount for an invalid currency code", () => {
    expect(formatMoney(12.5, "INVALID")).toBe("12.50 INVALID");
  });
});

describe("date input helpers", () => {
  it("returns an ISO timestamp from isoNow", () => {
    expect(isoNow()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("converts between local date-time inputs and ISO timestamps", () => {
    const local = new Date(2026, 10, 18, 9, 5);
    expect(localDateTimeInputValue(local.toISOString())).toBe("2026-11-18T09:05");
    expect(fromLocalDateTimeInput("2026-11-18T09:05")).toBe(local.toISOString());
  });

  it("formats local date inputs", () => {
    const local = new Date(2026, 10, 18, 9, 5);
    expect(localDateInputValue(local.toISOString())).toBe("2026-11-18");
  });
});
