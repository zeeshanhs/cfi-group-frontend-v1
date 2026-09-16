import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

import {
  calculatePercentChange,
  formatAmount,
  formatIsoDate,
  stripJobIdPrefix,
  sumMoney,
} from "@/lib/reporting/format";
import { ReportingDatabaseError } from "@/lib/reporting/database";
import {
  DEFAULT_WEEKLY_SALES_DATE_RANGE,
  type DateRange,
} from "@/lib/reporting/date-range";
import {
  buildWeeklySalesReportModel,
  loadWeeklySalesSourceRows,
  type WeeklySalesSourceData,
} from "@/lib/reporting/weekly-sales";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function loadModel(range: DateRange = DEFAULT_WEEKLY_SALES_DATE_RANGE) {
  return buildWeeklySalesReportModel(loadWeeklySalesSourceRows(range));
}

const model = loadModel();

function withSourceMetadata(
  rows: Pick<
    WeeklySalesSourceData,
    "accountManagers" | "changeOrders" | "newJobs"
  >,
): WeeklySalesSourceData {
  return {
    ...rows,
    selectedRange: { ...DEFAULT_WEEKLY_SALES_DATE_RANGE },
    sourceCoverage: {
      newJobs: null,
      changeOrders: null,
    },
  };
}

describe("weekly sales report model", () => {
  it("matches the default selected-period KPI values", () => {
    expect(model.kpis.newJobs).toEqual({
      count: 4,
      contractTotal: 188125,
    });
    expect(model.kpis.changeOrders).toEqual({
      count: 1,
      netAdjustment: 38334.36,
      negativeAdjustmentCount: 0,
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

  it("filters alternate and single-day date ranges inclusively", () => {
    const augustModel = loadModel({
      start: "2026-08-12",
      end: "2026-08-31",
    });
    const singleDayModel = loadModel({
      start: "2026-09-10",
      end: "2026-09-10",
    });

    expect(augustModel.kpis.newJobs).toEqual({
      count: 0,
      contractTotal: 0,
    });
    expect(augustModel.kpis.changeOrders).toEqual({
      count: 4,
      netAdjustment: 31990.4,
      negativeAdjustmentCount: 1,
    });
    expect(singleDayModel.kpis.newJobs).toEqual({
      count: 3,
      contractTotal: 159125,
    });
    expect(singleDayModel.kpis.changeOrders.count).toBe(0);
  });

  it("keeps full source coverage independent from filtered rows", () => {
    const emptyRangeModel = loadModel({
      start: "2025-01-01",
      end: "2025-01-31",
    });

    expect(emptyRangeModel.newJobs.rows).toHaveLength(0);
    expect(emptyRangeModel.changeOrders.rows).toHaveLength(0);
    expect(emptyRangeModel.metadata.newJobSourceCoverage).toEqual({
      start: "2026-09-09",
      end: "2026-09-10",
    });
    expect(emptyRangeModel.metadata.changeOrderSourceCoverage).toEqual({
      start: "2026-08-12",
      end: "2026-09-09",
    });
  });

  it("keeps account-manager data invariant across date ranges", () => {
    const alternate = loadModel({
      start: "2026-08-12",
      end: "2026-08-31",
    });

    expect(alternate.accountManagers).toEqual(model.accountManagers);
    expect(alternate.kpis.salesYtd).toEqual(model.kpis.salesYtd);
    expect(alternate.kpis.last7DaysSales).toBe(model.kpis.last7DaysSales);
    expect(alternate.kpis.contractClosed).toEqual(model.kpis.contractClosed);
    expect(alternate.kpis.pendingContract).toEqual(model.kpis.pendingContract);
  });

  it("maps, sorts, and totals selected new jobs", () => {
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
  });

  it("uses co_date filtering and stable change-order ordering", () => {
    const augustModel = loadModel({
      start: "2026-08-12",
      end: "2026-08-31",
    });

    expect(augustModel.changeOrders.rows.map((row) => row.coDate)).toEqual([
      "2026-08-12",
      "2026-08-13",
      "2026-08-19",
      "2026-08-31",
    ]);
    expect(augustModel.changeOrders.rows[0].modifiedOn).toBe(
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
    ): WeeklySalesSourceData["accountManagers"][number] => ({
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
    const fixture = withSourceMetadata({
      accountManagers: [
        accountManager("Z", "Zulu", null, 1),
        accountManager("EMPTY", "Excluded", 1, 0),
        accountManager("B", "Beta", null, 1),
        accountManager("A", "Alpha", 2, 1),
      ],
      changeOrders: [],
      newJobs: [],
    });

    expect(
      buildWeeklySalesReportModel(fixture).accountManagers.rows.map(
        (row) => row.projectClassId,
      ),
    ).toEqual(["A", "B", "Z"]);
  });

  it("builds a truthful empty model", () => {
    const emptyModel = buildWeeklySalesReportModel(
      withSourceMetadata({
        accountManagers: [],
        changeOrders: [],
        newJobs: [],
      }),
    );

    expect(emptyModel.kpis.newJobs.count).toBe(0);
    expect(emptyModel.kpis.salesYtd.percentChange).toBeNull();
    expect(emptyModel.metadata.newJobSourceCoverage).toBeNull();
    expect(emptyModel.metadata.changeOrderSourceCoverage).toBeNull();
  });

  it("opens the database again and reflects changes to a temporary copy", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "cfi-weekly-sales-"));
    temporaryDirectories.push(directory);
    const databasePath = path.join(directory, "reporting.sqlite");
    copyFileSync(
      path.join(
        process.cwd(),
        "_PROJECT/data/reporting/cfi_reporting.sqlite",
      ),
      databasePath,
    );

    const before = buildWeeklySalesReportModel(
      loadWeeklySalesSourceRows(DEFAULT_WEEKLY_SALES_DATE_RANGE, databasePath),
    );
    const writableDatabase = new Database(databasePath);
    writableDatabase
      .prepare(
        "UPDATE rpt_new_jobs_opened SET original_contract = ? WHERE job_id = ?",
      )
      .run(30000, "5398");
    writableDatabase.close();
    const after = buildWeeklySalesReportModel(
      loadWeeklySalesSourceRows(DEFAULT_WEEKLY_SALES_DATE_RANGE, databasePath),
    );

    expect(before.newJobs.contractTotal).toBe(188125);
    expect(after.newJobs.contractTotal).toBe(189125);
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

    expect(() =>
      loadWeeklySalesSourceRows(DEFAULT_WEEKLY_SALES_DATE_RANGE, missingPath),
    ).toThrow(ReportingDatabaseError);
  });
});
