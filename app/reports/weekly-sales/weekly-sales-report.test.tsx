import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  buildWeeklySalesReportModel,
  type WeeklySalesSourceData,
} from "@/lib/reporting/weekly-sales";

import { WeeklySalesReport } from "./weekly-sales-report";

const emptySource: WeeklySalesSourceData = {
  selectedRange: {
    start: "2026-09-10",
    end: "2026-09-10",
  },
  sourceCoverage: {
    newJobs: { start: "2026-09-09", end: "2026-09-10" },
    changeOrders: { start: "2026-08-12", end: "2026-09-09" },
  },
  accountManagers: [],
  changeOrders: [],
  newJobs: [],
};

describe("WeeklySalesReport", () => {
  it("keeps the report structure and shows truthful empty states", () => {
    const markup = renderToStaticMarkup(
      <WeeklySalesReport
        report={buildWeeklySalesReportModel(emptySource)}
      />,
    );

    expect(markup).toContain('data-report-ready="true"');
    expect(markup).toContain(
      "No new jobs are present in the local snapshot for",
    );
    expect(markup).toContain("9/10/2026–9/10/2026");
    expect(markup).toContain(
      "No change orders are present in the local snapshot for",
    );
    expect(markup).toContain(
      "No active account-manager values are present in the loaded snapshot.",
    );
    expect(markup).toContain("New jobs — selected period");
    expect(markup).toContain("Loaded new-job dates: 9/9/2026–9/10/2026");
    expect(markup).toContain(
      "Account-manager metrics remain the unfiltered 9/14/2026 source snapshot",
    );
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain("Source currency is not confirmed.");
  });
});
