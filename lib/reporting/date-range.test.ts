import { describe, expect, it } from "vitest";

import {
  areDateRangesEqual,
  createDateRangeSearchParams,
  DEFAULT_WEEKLY_SALES_DATE_RANGE,
  getDateRangeFilename,
  resolveDateRangeSearchParams,
  resolveDateRangeSearchValues,
  validateDateRange,
} from "@/lib/reporting/date-range";

describe("weekly sales date ranges", () => {
  it("uses a copy of the default range when both parameters are absent", () => {
    const result = resolveDateRangeSearchValues({});

    expect(result).toEqual({
      ok: true,
      range: DEFAULT_WEEKLY_SALES_DATE_RANGE,
    });
    if (result.ok) {
      expect(result.range).not.toBe(DEFAULT_WEEKLY_SALES_DATE_RANGE);
    }
  });

  it("accepts inclusive normal, single-day, and leap-day ranges", () => {
    expect(validateDateRange("2026-09-07", "2026-09-13").ok).toBe(true);
    expect(validateDateRange("2026-09-10", "2026-09-10").ok).toBe(true);
    expect(validateDateRange("2024-02-29", "2024-03-01").ok).toBe(true);
  });

  it.each([
    ["", "2026-09-13", "missing"],
    ["2026-09-07", "", "missing"],
    ["2026-2-01", "2026-02-02", "invalid"],
    ["2026-02-29", "2026-03-01", "invalid"],
    ["2026-13-01", "2026-13-02", "invalid"],
    ["2026-09-14", "2026-09-13", "reversed"],
  ])("rejects %s through %s as %s", (start, end, code) => {
    expect(validateDateRange(start, end)).toMatchObject({ ok: false, code });
  });

  it("rejects partial and repeated page parameters", () => {
    expect(
      resolveDateRangeSearchValues({ start: "2026-09-07" }),
    ).toMatchObject({ ok: false, code: "missing" });
    expect(
      resolveDateRangeSearchValues({
        start: ["2026-09-07"],
        end: "2026-09-13",
      }),
    ).toMatchObject({ ok: false, code: "repeated" });
  });

  it("preserves repeated-key detection for URLSearchParams", () => {
    const params = new URLSearchParams(
      "start=2026-09-07&start=2026-09-08&end=2026-09-13",
    );

    expect(resolveDateRangeSearchParams(params)).toMatchObject({
      ok: false,
      code: "repeated",
    });
  });

  it("ignores unrelated application-owned parameters", () => {
    const params = new URLSearchParams("print=1");

    expect(resolveDateRangeSearchParams(params)).toEqual({
      ok: true,
      range: DEFAULT_WEEKLY_SALES_DATE_RANGE,
    });
  });

  it("compares and serializes ranges deterministically", () => {
    const range = { start: "2026-08-12", end: "2026-08-31" };

    expect(areDateRangesEqual(range, { ...range })).toBe(true);
    expect(
      areDateRangesEqual(range, {
        start: "2026-08-12",
        end: "2026-09-01",
      }),
    ).toBe(false);
    expect(createDateRangeSearchParams(range).toString()).toBe(
      "start=2026-08-12&end=2026-08-31",
    );
    expect(getDateRangeFilename(range)).toBe(
      "cfi-weekly-sales-summary-2026-08-12-to-2026-08-31.pdf",
    );
  });
});
