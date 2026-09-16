import type { Metadata } from "next";
import Link from "next/link";

import { ReportingDatabaseError } from "@/lib/reporting/database";
import {
  getWeeklySalesReport,
  ReportingQueryError,
} from "@/lib/reporting/weekly-sales";

import { ReportLoadError } from "./report-load-error";
import { ReportToolbar } from "./report-toolbar";
import styles from "./weekly-sales-report.module.css";
import { WeeklySalesReport } from "./weekly-sales-report";

export const metadata: Metadata = {
  title: "Weekly Sales Summary",
  description:
    "Weekly summary of loaded new jobs, change orders, and account-manager sales.",
};

export const runtime = "nodejs";

interface WeeklySalesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WeeklySalesPage({
  searchParams,
}: WeeklySalesPageProps) {
  const resolvedSearchParams = await searchParams;
  const printValue = resolvedSearchParams.print;
  const isPrintMode = Array.isArray(printValue)
    ? printValue.includes("1")
    : printValue === "1";
  let report: Awaited<ReturnType<typeof getWeeklySalesReport>>;

  try {
    report = await getWeeklySalesReport();
  } catch (error) {
    const message =
      error instanceof ReportingQueryError
        ? `${error.message} Confirm the local reporting snapshot is available, then try again.`
        : error instanceof ReportingDatabaseError
          ? "The local reporting snapshot could not be opened. Confirm it is available, then try again."
          : "The weekly sales report could not be loaded. Please try again.";

    return <ReportLoadError message={message} />;
  }

  return (
    <div className={`${styles.page} ${isPrintMode ? styles.printMode : ""}`}>
      {!isPrintMode ? (
        <>
          <div className={styles.pageHeader}>
            <div className={styles.pageHeaderText}>
              <Link className={styles.backLink} href="/reports">
                ← All reports
              </Link>
              <h2>Weekly Sales Summary</h2>
              <p>Static reporting extract with a printable one-page view.</p>
            </div>
          </div>
          <ReportToolbar />
        </>
      ) : null}

      <div
        className={styles.reportViewport}
        role="region"
        aria-label="Scrollable weekly sales report"
        tabIndex={0}
      >
        <WeeklySalesReport report={report} />
      </div>
    </div>
  );
}
