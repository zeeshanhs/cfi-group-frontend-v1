import { describe, expect, it } from "vitest";

import {
  buildPdfRenderUrl,
  getPdfFilename,
  PdfConfigurationError,
  resolvePdfDateRange,
} from "./pdf-request";

describe("weekly sales PDF request", () => {
  it("resolves default and explicit ranges", () => {
    expect(
      resolvePdfDateRange(new URL("http://localhost/reports/weekly-sales/pdf")),
    ).toEqual({
      ok: true,
      range: { start: "2026-09-07", end: "2026-09-13" },
    });
    expect(
      resolvePdfDateRange(
        new URL(
          "http://localhost/reports/weekly-sales/pdf?start=2026-08-12&end=2026-08-31",
        ),
      ),
    ).toEqual({
      ok: true,
      range: { start: "2026-08-12", end: "2026-08-31" },
    });
  });

  it.each([
    "?start=2026-09-07",
    "?start=2026-09-14&end=2026-09-13",
    "?start=2026-02-29&end=2026-03-01",
    "?start=2026-09-07&start=2026-09-08&end=2026-09-13",
  ])("rejects invalid request parameters: %s", (query) => {
    expect(
      resolvePdfDateRange(
        new URL(`http://localhost/reports/weekly-sales/pdf${query}`),
      ).ok,
    ).toBe(false);
  });

  it("builds only the fixed internal report URL", () => {
    const result = buildPdfRenderUrl(
      new URL("http://localhost:3000/untrusted/path?target=https://evil.test"),
      { start: "2026-08-12", end: "2026-08-31" },
    );

    expect(result.toString()).toBe(
      "http://localhost:3000/reports/weekly-sales?start=2026-08-12&end=2026-08-31&print=1",
    );
  });

  it("normalizes an explicitly configured HTTP origin", () => {
    const result = buildPdfRenderUrl(
      new URL("https://request.example/reports/weekly-sales/pdf"),
      { start: "2026-09-07", end: "2026-09-13" },
      "https://reports.example/base?ignored=1#fragment",
    );

    expect(result.origin).toBe("https://reports.example");
    expect(result.pathname).toBe("/reports/weekly-sales");
    expect(result.searchParams.get("print")).toBe("1");
  });

  it("rejects missing production configuration and unsafe schemes", () => {
    expect(() =>
      buildPdfRenderUrl(
        new URL("https://request.example/reports/weekly-sales/pdf"),
        { start: "2026-09-07", end: "2026-09-13" },
      ),
    ).toThrow(PdfConfigurationError);
    expect(() =>
      buildPdfRenderUrl(
        new URL("http://localhost/reports/weekly-sales/pdf"),
        { start: "2026-09-07", end: "2026-09-13" },
        "file:///tmp/report",
      ),
    ).toThrow("must use HTTP or HTTPS");
  });

  it("creates a deterministic range-aware filename", () => {
    expect(
      getPdfFilename({ start: "2026-08-12", end: "2026-08-31" }),
    ).toBe("cfi-weekly-sales-summary-2026-08-12-to-2026-08-31.pdf");
  });
});
