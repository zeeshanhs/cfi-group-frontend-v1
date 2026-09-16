import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  buildWeeklySalesReportModel,
  type WeeklySalesSourceRows,
} from "@/lib/reporting/weekly-sales";

import { WeeklySalesReport } from "./weekly-sales-report";

const emptySource: WeeklySalesSourceRows = {
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
      "No new jobs are present in the loaded extract.",
    );
    expect(markup).toContain(
      "No change orders are present in the loaded extract.",
    );
    expect(markup).toContain(
      "No active account-manager values are present in the loaded snapshot.",
    );
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain("Source currency is not confirmed.");
  });
});
