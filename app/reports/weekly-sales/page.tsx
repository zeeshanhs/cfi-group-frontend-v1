import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { ReportingDatabaseError } from "@/lib/reporting/database";
import {
  resolveDateRangeSearchValues,
  type DateRange,
} from "@/lib/reporting/date-range";
import {
  ACCOUNT_SNAPSHOT_DATE,
  getWeeklySalesReport,
  ReportingQueryError,
} from "@/lib/reporting/weekly-sales";

import { ReportExperience } from "./report-experience";
import { ReportLoadError } from "./report-load-error";
import { ReportSkeleton } from "./report-skeleton";
import styles from "./weekly-sales-report.module.css";
import { WeeklySalesReport } from "./weekly-sales-report";

export const metadata: Metadata = {
  title: "Weekly Sales Summary",
  description:
    "Weekly summary of loaded new jobs, change orders, and account-manager sales.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WeeklySalesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function PageHeader() {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderText}>
        <Link className={styles.backLink} href="/reports">
          ← All reports
        </Link>
        <h2>Weekly Sales Summary</h2>
        <p>Static reporting extract with a printable one-page view.</p>
      </div>
    </div>
  );
}

async function WeeklySalesReportResult({ range }: { range: DateRange }) {
  let report: Awaited<ReturnType<typeof getWeeklySalesReport>>;

  try {
    report = await getWeeklySalesReport(range);
  } catch (error) {
    const message =
      error instanceof ReportingQueryError
        ? `${error.message} Confirm the local reporting snapshot is available, then try again.`
        : error instanceof ReportingDatabaseError
          ? "The local reporting snapshot could not be opened. Confirm it is available, then try again."
          : "The weekly sales report could not be loaded. Please try again.";

    return <ReportLoadError message={message} />;
  }

  return <WeeklySalesReport report={report} />;
}

function InvalidDateRange({ message }: { message: string }) {
  return (
    <div className={styles.statePanel} role="alert">
      <h1>Choose a valid date range</h1>
      <p>{message}</p>
      <Link className={styles.primaryLink} href="/reports/weekly-sales">
        Use default dates
      </Link>
    </div>
  );
}

export default async function WeeklySalesPage({
  searchParams,
}: WeeklySalesPageProps) {
  const resolvedSearchParams = await searchParams;
  const rangeResult = resolveDateRangeSearchValues({
    start: resolvedSearchParams.start,
    end: resolvedSearchParams.end,
  });
  const printValue = resolvedSearchParams.print;
  const isPrintMode = Array.isArray(printValue)
    ? printValue.includes("1")
    : printValue === "1";

  if (!rangeResult.ok) {
    return (
      <div className={`${styles.page} ${isPrintMode ? styles.printMode : ""}`}>
        {!isPrintMode ? <PageHeader /> : null}
        <InvalidDateRange message={rangeResult.message} />
      </div>
    );
  }

  const range = rangeResult.range;
  const result = (
    <Suspense
      key={`${range.start}:${range.end}`}
      fallback={<ReportSkeleton />}
    >
      <WeeklySalesReportResult range={range} />
    </Suspense>
  );

  if (isPrintMode) {
    return (
      <div className={`${styles.page} ${styles.printMode}`}>
        <div className={styles.reportViewport}>{result}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader />
      <ReportExperience
        accountSnapshotDate={ACCOUNT_SNAPSHOT_DATE}
        appliedRange={range}
      >
        {result}
      </ReportExperience>
    </div>
  );
}
