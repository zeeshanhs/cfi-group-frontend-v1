import { connection } from "next/server";

import {
  calculatePercentChange,
  stripJobIdPrefix,
  sumMoney,
} from "@/lib/reporting/format";
import {
  ReportingDatabaseError,
  withReadOnlyDatabase,
} from "@/lib/reporting/database";
import type { DateRange } from "@/lib/reporting/date-range";

export const ACCOUNT_SNAPSHOT_DATE = "2026-09-14";

export interface AccountManagerRow {
  projectClassId: string;
  projectClassName: string;
  sortOrder: number | null;
  salesPriorYear: number;
  salesLast7Days: number;
  salesReportingYearYtd: number;
  salesPriorYearYtd: number;
  arOutstanding: number;
  pendingContract: number;
  eoyProjectedSales: number;
  contractValueClosedCurrent: number;
  contractValueClosedPrior: number;
}

export interface ChangeOrderRow {
  jobId: string;
  jobDescription: string;
  coNumber: number;
  coDate: string;
  coStatus: string;
  ownerCoNumber: number | null;
  totalIncomeAdj: number;
  modifiedOn: string;
}

export interface NewJobRow {
  jobId: string;
  jobLabel: string;
  customerName: string;
  salesId: string;
  originalContract: number;
  city: string;
  state: string;
  openedDate: string;
  bdLinked: string;
}

export interface WeeklySalesSourceRows {
  accountManagers: AccountManagerRow[];
  changeOrders: ChangeOrderRow[];
  newJobs: NewJobRow[];
}

export interface DateCoverage {
  start: string;
  end: string;
}

export interface WeeklySalesSourceData extends WeeklySalesSourceRows {
  selectedRange: DateRange;
  sourceCoverage: {
    newJobs: DateCoverage | null;
    changeOrders: DateCoverage | null;
  };
}

export type AccountManagerReportRow = AccountManagerRow;

export interface WeeklySalesReportModel {
  metadata: {
    selectedRange: DateRange;
    newJobSourceCoverage: DateCoverage | null;
    changeOrderSourceCoverage: DateCoverage | null;
    accountSnapshotDate: string;
  };
  kpis: {
    newJobs: { count: number; contractTotal: number };
    changeOrders: {
      count: number;
      netAdjustment: number;
      negativeAdjustmentCount: number;
    };
    salesYtd: {
      reportingYearYtd: number;
      priorYearYtd: number;
      percentChange: number | null;
    };
    last7DaysSales: number;
    contractClosed: { current: number; prior: number };
    pendingContract: { pending: number; eoyProjected: number };
  };
  newJobs: {
    rows: Array<
      NewJobRow & {
        projectName: string;
        location: string;
      }
    >;
    count: number;
    contractTotal: number;
  };
  changeOrders: {
    rows: ChangeOrderRow[];
    count: number;
    netAdjustment: number;
    negativeAdjustmentCount: number;
  };
  accountManagers: {
    rows: AccountManagerReportRow[];
    totalSourceRows: number;
    totals: Omit<
      AccountManagerRow,
      "projectClassId" | "projectClassName" | "sortOrder"
    >;
  };
}

export class ReportingQueryError extends Error {
  readonly sourceTable: string;

  constructor(sourceTable: string, options?: ErrorOptions) {
    super(`The ${sourceTable} reporting source could not be read.`, options);
    this.name = "ReportingQueryError";
    this.sourceTable = sourceTable;
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readString(row: UnknownRecord, key: string, table: string) {
  const value = row[key];
  if (typeof value !== "string") {
    throw new ReportingQueryError(table);
  }
  return value;
}

function readNumber(row: UnknownRecord, key: string, table: string) {
  const value = row[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ReportingQueryError(table);
  }
  return value;
}

function readNullableNumber(row: UnknownRecord, key: string, table: string) {
  const value = row[key];
  if (value === null) {
    return null;
  }
  return readNumber(row, key, table);
}

function readNullableString(row: UnknownRecord, key: string, table: string) {
  const value = row[key];
  if (value === null) {
    return null;
  }
  return readString(row, key, table);
}

function assertRecord(row: unknown, table: string): UnknownRecord {
  if (!isRecord(row)) {
    throw new ReportingQueryError(table);
  }
  return row;
}

function parseAccountManagerRow(row: unknown): AccountManagerRow {
  const table = "account_manager_summary";
  const record = assertRecord(row, table);
  return {
    projectClassId: readString(record, "project_class_id", table),
    projectClassName: readString(record, "project_class_name", table),
    sortOrder: readNullableNumber(record, "sort_order", table),
    salesPriorYear: readNumber(record, "sales_prior_year", table),
    salesLast7Days: readNumber(record, "sales_last_7_days", table),
    salesReportingYearYtd: readNumber(
      record,
      "sales_reporting_year_ytd",
      table,
    ),
    salesPriorYearYtd: readNumber(record, "sales_prior_year_ytd", table),
    arOutstanding: readNumber(record, "ar_outstanding", table),
    pendingContract: readNumber(record, "pending_contract", table),
    eoyProjectedSales: readNumber(record, "eoy_projected_sales", table),
    contractValueClosedCurrent: readNumber(
      record,
      "contract_value_closed_current",
      table,
    ),
    contractValueClosedPrior: readNumber(
      record,
      "contract_value_closed_prior",
      table,
    ),
  };
}

function parseChangeOrderRow(row: unknown): ChangeOrderRow {
  const table = "job_cost_change_orders";
  const record = assertRecord(row, table);
  return {
    jobId: readString(record, "job_id", table),
    jobDescription: readString(record, "job_description", table),
    coNumber: readNumber(record, "co_number", table),
    coDate: readString(record, "co_date", table),
    coStatus: readString(record, "co_status", table),
    ownerCoNumber: readNullableNumber(record, "owner_co_number", table),
    totalIncomeAdj: readNumber(record, "total_income_adj", table),
    modifiedOn: readString(record, "modified_on", table),
  };
}

function parseNewJobRow(row: unknown): NewJobRow {
  const table = "rpt_new_jobs_opened";
  const record = assertRecord(row, table);
  return {
    jobId: readString(record, "job_id", table),
    jobLabel: readString(record, "job_label", table),
    customerName: readString(record, "customer_name", table),
    salesId: readString(record, "sales_id", table),
    originalContract: readNumber(record, "original_contract", table),
    city: readString(record, "city", table),
    state: readString(record, "state", table),
    openedDate: readString(record, "opened_date", table),
    bdLinked: readString(record, "bd_linked", table),
  };
}

function parseCoverage(row: unknown, table: string): DateCoverage | null {
  const record = assertRecord(row, table);
  const start = readNullableString(record, "start", table);
  const end = readNullableString(record, "end", table);

  if (start === null && end === null) {
    return null;
  }

  if (start === null || end === null) {
    throw new ReportingQueryError(table);
  }

  return { start, end };
}

type ReportingDatabase = Parameters<typeof withReadOnlyDatabase>[0] extends (
  database: infer T,
) => unknown
  ? T
  : never;

type QueryParameters = Record<string, string | number>;

function queryRows(
  database: ReportingDatabase,
  table: string,
  sql: string,
  parameters?: QueryParameters,
) {
  try {
    const statement = database.prepare(sql);
    return parameters ? statement.all(parameters) : statement.all();
  } catch (error) {
    throw new ReportingQueryError(table, { cause: error });
  }
}

function queryCoverage(
  database: ReportingDatabase,
  table: string,
  sql: string,
) {
  try {
    return parseCoverage(database.prepare(sql).get(), table);
  } catch (error) {
    if (error instanceof ReportingQueryError) {
      throw error;
    }
    throw new ReportingQueryError(table, { cause: error });
  }
}

export function loadWeeklySalesSourceRows(
  selectedRange: DateRange,
  databasePath?: string,
): WeeklySalesSourceData {
  try {
    return withReadOnlyDatabase((database) => {
      const accountManagers = queryRows(
        database,
        "account_manager_summary",
        `SELECT
          project_class_id,
          project_class_name,
          sort_order,
          sales_prior_year,
          sales_last_7_days,
          sales_reporting_year_ytd,
          sales_prior_year_ytd,
          ar_outstanding,
          pending_contract,
          eoy_projected_sales,
          contract_value_closed_current,
          contract_value_closed_prior
        FROM account_manager_summary`,
      ).map(parseAccountManagerRow);

      const changeOrders = queryRows(
        database,
        "job_cost_change_orders",
        `SELECT
          job_id,
          job_description,
          co_number,
          co_date,
          co_status,
          owner_co_number,
          total_income_adj,
          modified_on
        FROM job_cost_change_orders
        WHERE co_date BETWEEN :start AND :end`,
        { start: selectedRange.start, end: selectedRange.end },
      ).map(parseChangeOrderRow);

      const newJobs = queryRows(
        database,
        "rpt_new_jobs_opened",
        `SELECT
          job_id,
          job_label,
          customer_name,
          sales_id,
          original_contract,
          city,
          state,
          opened_date,
          bd_linked
        FROM rpt_new_jobs_opened
        WHERE opened_date BETWEEN :start AND :end`,
        { start: selectedRange.start, end: selectedRange.end },
      ).map(parseNewJobRow);

      const newJobSourceCoverage = queryCoverage(
        database,
        "rpt_new_jobs_opened",
        `SELECT
          MIN(opened_date) AS start,
          MAX(opened_date) AS end
        FROM rpt_new_jobs_opened`,
      );

      const changeOrderSourceCoverage = queryCoverage(
        database,
        "job_cost_change_orders",
        `SELECT
          MIN(co_date) AS start,
          MAX(co_date) AS end
        FROM job_cost_change_orders`,
      );

      return {
        selectedRange: { ...selectedRange },
        sourceCoverage: {
          newJobs: newJobSourceCoverage,
          changeOrders: changeOrderSourceCoverage,
        },
        accountManagers,
        changeOrders,
        newJobs,
      };
    }, databasePath);
  } catch (error) {
    if (
      error instanceof ReportingQueryError ||
      error instanceof ReportingDatabaseError
    ) {
      throw error;
    }
    throw new ReportingDatabaseError(
      "The local reporting database could not be read.",
      { cause: error },
    );
  }
}

function compareStrings(left: string, right: string) {
  return left.localeCompare(right, "en-US", {
    numeric: true,
    sensitivity: "base",
  });
}

const accountMeasureKeys = [
  "salesPriorYear",
  "salesLast7Days",
  "salesReportingYearYtd",
  "salesPriorYearYtd",
  "arOutstanding",
  "pendingContract",
  "eoyProjectedSales",
  "contractValueClosedCurrent",
  "contractValueClosedPrior",
] as const;

function hasDisplayedAccountActivity(row: AccountManagerRow) {
  return accountMeasureKeys.some((key) => row[key] !== 0);
}

function compareAccountManagers(
  left: AccountManagerRow,
  right: AccountManagerRow,
) {
  if (left.sortOrder === null && right.sortOrder !== null) {
    return 1;
  }
  if (left.sortOrder !== null && right.sortOrder === null) {
    return -1;
  }
  if (left.sortOrder !== null && right.sortOrder !== null) {
    const orderDifference = left.sortOrder - right.sortOrder;
    if (orderDifference !== 0) {
      return orderDifference;
    }
  }
  return compareStrings(left.projectClassName, right.projectClassName);
}

function sumAccountMeasure(
  rows: readonly AccountManagerRow[],
  key: (typeof accountMeasureKeys)[number],
) {
  return sumMoney(rows.map((row) => row[key]));
}

export function buildWeeklySalesReportModel(
  sourceRows: WeeklySalesSourceData,
): WeeklySalesReportModel {
  const newJobRows = [...sourceRows.newJobs]
    .sort(
      (left, right) =>
        compareStrings(left.openedDate, right.openedDate) ||
        compareStrings(left.jobId, right.jobId),
    )
    .map((row) => ({
      ...row,
      projectName: stripJobIdPrefix(row.jobId, row.jobLabel),
      location: `${row.city}, ${row.state}`,
    }));

  const changeOrderRows = [...sourceRows.changeOrders].sort(
    (left, right) =>
      compareStrings(left.coDate, right.coDate) ||
      compareStrings(left.jobId, right.jobId) ||
      left.coNumber - right.coNumber,
  );

  const accountManagerRows = sourceRows.accountManagers
    .filter(hasDisplayedAccountActivity)
    .sort(compareAccountManagers);

  const newJobContractTotal = sumMoney(
    newJobRows.map((row) => row.originalContract),
  );
  const changeOrderNetAdjustment = sumMoney(
    changeOrderRows.map((row) => row.totalIncomeAdj),
  );
  const negativeAdjustmentCount = changeOrderRows.filter(
    (row) => row.totalIncomeAdj < 0,
  ).length;

  const accountTotals = {
    salesPriorYear: sumAccountMeasure(
      sourceRows.accountManagers,
      "salesPriorYear",
    ),
    salesLast7Days: sumAccountMeasure(
      sourceRows.accountManagers,
      "salesLast7Days",
    ),
    salesReportingYearYtd: sumAccountMeasure(
      sourceRows.accountManagers,
      "salesReportingYearYtd",
    ),
    salesPriorYearYtd: sumAccountMeasure(
      sourceRows.accountManagers,
      "salesPriorYearYtd",
    ),
    arOutstanding: sumAccountMeasure(
      sourceRows.accountManagers,
      "arOutstanding",
    ),
    pendingContract: sumAccountMeasure(
      sourceRows.accountManagers,
      "pendingContract",
    ),
    eoyProjectedSales: sumAccountMeasure(
      sourceRows.accountManagers,
      "eoyProjectedSales",
    ),
    contractValueClosedCurrent: sumAccountMeasure(
      sourceRows.accountManagers,
      "contractValueClosedCurrent",
    ),
    contractValueClosedPrior: sumAccountMeasure(
      sourceRows.accountManagers,
      "contractValueClosedPrior",
    ),
  };

  return {
    metadata: {
      selectedRange: { ...sourceRows.selectedRange },
      newJobSourceCoverage: sourceRows.sourceCoverage.newJobs,
      changeOrderSourceCoverage: sourceRows.sourceCoverage.changeOrders,
      accountSnapshotDate: ACCOUNT_SNAPSHOT_DATE,
    },
    kpis: {
      newJobs: {
        count: newJobRows.length,
        contractTotal: newJobContractTotal,
      },
      changeOrders: {
        count: changeOrderRows.length,
        netAdjustment: changeOrderNetAdjustment,
        negativeAdjustmentCount,
      },
      salesYtd: {
        reportingYearYtd: accountTotals.salesReportingYearYtd,
        priorYearYtd: accountTotals.salesPriorYearYtd,
        percentChange: calculatePercentChange(
          accountTotals.salesReportingYearYtd,
          accountTotals.salesPriorYearYtd,
        ),
      },
      last7DaysSales: accountTotals.salesLast7Days,
      contractClosed: {
        current: accountTotals.contractValueClosedCurrent,
        prior: accountTotals.contractValueClosedPrior,
      },
      pendingContract: {
        pending: accountTotals.pendingContract,
        eoyProjected: accountTotals.eoyProjectedSales,
      },
    },
    newJobs: {
      rows: newJobRows,
      count: newJobRows.length,
      contractTotal: newJobContractTotal,
    },
    changeOrders: {
      rows: changeOrderRows,
      count: changeOrderRows.length,
      netAdjustment: changeOrderNetAdjustment,
      negativeAdjustmentCount,
    },
    accountManagers: {
      rows: accountManagerRows,
      totalSourceRows: sourceRows.accountManagers.length,
      totals: accountTotals,
    },
  };
}

export async function getWeeklySalesReport(
  selectedRange: DateRange,
  databasePath?: string,
) {
  await connection();
  return buildWeeklySalesReportModel(
    loadWeeklySalesSourceRows(selectedRange, databasePath),
  );
}
