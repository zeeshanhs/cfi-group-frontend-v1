import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  calculatePercentChange,
  formatAmount,
  formatIsoDate,
  stripJobIdPrefix,
  sumMoney,
} from "@/lib/reporting/format";
import { ReportingDatabaseError } from "@/lib/reporting/database";
import {
  buildWeeklySalesReportModel,
  loadWeeklySalesSourceRows,
  type WeeklySalesSourceRows,
} from "@/lib/reporting/weekly-sales";

const model = buildWeeklySalesReportModel(loadWeeklySalesSourceRows());

describe("weekly sales report model", () => {
  it("matches the current snapshot KPI values", () => {
    expect(model.kpis.newJobs).toEqual({
      count: 4,
      contractTotal: 188125,
    });
    expect(model.kpis.changeOrders).toEqual({
      count: 6,
      netAdjustment: 73274.76,
      negativeAdjustmentCount: 1,
    });
    expect(model.kpis.salesYtd.reportingYearYtd).toBe(32225435.34);
    expect(model.kpis.salesYtd.priorYearYtd).toBe(26684515.3);
    expect(model.kpis.salesYtd.percentChange).toBeCloseTo(20.8, 1);
    expect(model.kpis.last7DaysSales).toBe(441271.42);
    expect(model.kpis.contractClosed).toEqual({
      current: 229158,
      prior: 4499642.06,
    });
    expect(model.kpis.pendingContract).toEqual({
      pending: 24887792.33,
      eoyProjected: 63502382.68,
    });
  });

  it("maps, sorts, and totals new jobs", () => {
    expect(model.newJobs.rows.map((row) => row.jobId)).toEqual([
      "5398",
      "5401",
      "5402",
      "5403",
    ]);
    expect(model.newJobs.rows[0].projectName).toBe(
      "Camden Design-Garage Sealant",
    );
    expect(model.newJobs.rows.at(-1)?.bdLinked).toBe("NONE");
    expect(model.newJobs.coverage).toEqual({
      start: "2026-09-09",
      end: "2026-09-10",
    });
  });

  it("uses co_date coverage and stable change-order ordering", () => {
    expect(model.changeOrders.rows.map((row) => row.coDate)).toEqual([
      "2026-08-12",
      "2026-08-13",
      "2026-08-19",
      "2026-08-31",
      "2026-09-03",
      "2026-09-09",
    ]);
    expect(model.changeOrders.coverage).toEqual({
      start: "2026-08-12",
      end: "2026-09-09",
    });
    expect(model.changeOrders.rows[0].modifiedOn).toBe(
      "2026-09-08 07:51:00",
    );
  });

  it("includes only active account-manager rows in source order", () => {
    expect(model.accountManagers.totalSourceRows).toBe(26);
    expect(model.accountManagers.rows).toHaveLength(10);
    expect(model.accountManagers.rows.map((row) => row.projectClassId)).toEqual([
      "NONE",
      "DB",
      "CB",
      "FN",
      "PBELL",
      "JLT",
      "RH",
      "FS",
      "MB",
      "EP",
    ]);
    expect(model.accountManagers.rows[0].projectClassName).toBe("None");
    expect(model.accountManagers.totals.salesPriorYear).toBe(43978579.86);
    expect(model.accountManagers.totals.arOutstanding).toBe(6389155.01);
  });

  it("sorts active null-order account managers last and excludes zero rows", () => {
    const accountManager = (
      projectClassId: string,
      projectClassName: string,
      sortOrder: number | null,
      salesReportingYearYtd: number,
    ): WeeklySalesSourceRows["accountManagers"][number] => ({
      projectClassId,
      projectClassName,
      sortOrder,
      salesPriorYear: 0,
      salesLast7Days: 0,
      salesReportingYearYtd,
      salesPriorYearYtd: 0,
      arOutstanding: 0,
      pendingContract: 0,
      eoyProjectedSales: 0,
      contractValueClosedCurrent: 0,
      contractValueClosedPrior: 0,
    });
    const fixture: WeeklySalesSourceRows = {
      accountManagers: [
        accountManager("Z", "Zulu", null, 1),
        accountManager("EMPTY", "Excluded", 1, 0),
        accountManager("B", "Beta", null, 1),
        accountManager("A", "Alpha", 2, 1),
      ],
      changeOrders: [],
      newJobs: [],
    };

    expect(
      buildWeeklySalesReportModel(fixture).accountManagers.rows.map(
        (row) => row.projectClassId,
      ),
    ).toEqual(["A", "B", "Z"]);
  });

  it("builds a truthful empty model", () => {
    const emptySource: WeeklySalesSourceRows = {
      accountManagers: [],
      changeOrders: [],
      newJobs: [],
    };
    const emptyModel = buildWeeklySalesReportModel(emptySource);

    expect(emptyModel.kpis.newJobs.count).toBe(0);
    expect(emptyModel.kpis.salesYtd.percentChange).toBeNull();
    expect(emptyModel.newJobs.coverage).toBeNull();
    expect(emptyModel.changeOrders.coverage).toBeNull();
  });
});

describe("reporting helpers", () => {
  it("sums source money at cent precision", () => {
    expect(sumMoney([0.1, 0.2, 10.005])).toBe(10.31);
  });

  it("handles percentage comparisons with a zero denominator", () => {
    expect(calculatePercentChange(10, 0)).toBeNull();
    expect(calculatePercentChange(12, 10)).toBeCloseTo(20);
  });

  it("strips only the exact job prefix", () => {
    expect(stripJobIdPrefix("123", "123 - Example Project")).toBe(
      "Example Project",
    );
    expect(stripJobIdPrefix("123", "123-Example Project")).toBe(
      "123-Example Project",
    );
  });

  it("formats without asserting a currency", () => {
    expect(formatAmount(-4330)).toBe("(4,330.00)");
    expect(formatAmount(0)).toBe("—");
    expect(formatAmount(188125)).toBe("188,125.00");
    expect(formatAmount(188125)).not.toMatch(/\$|USD/);
  });

  it("formats ISO dates without timezone conversion", () => {
    expect(formatIsoDate("2026-09-09")).toBe("9/9/2026");
    expect(formatIsoDate("not-a-date")).toBe("not-a-date");
  });

  it("fails safely for a missing database", () => {
    const missingPath = path.join(
      process.cwd(),
      "_PROJECT/data/reporting/does-not-exist.sqlite",
    );

    expect(() => loadWeeklySalesSourceRows(missingPath)).toThrow(
      ReportingDatabaseError,
    );
  });
});
