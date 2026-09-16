import type { Metadata } from "next";
import Link from "next/link";

import styles from "./reports.module.css";

export const metadata: Metadata = {
  title: "Reports",
  description: "Available CFI Group internal reports.",
};

export default function ReportsPage() {
  return (
    <div className={styles.index}>
      <p className={styles.eyebrow}>Reporting</p>
      <h1 className={styles.title}>Reports</h1>
      <p className={styles.intro}>
        Open an available report to review the current repository snapshot and
        download its printable version.
      </p>

      <ul className={styles.reportList}>
        <li>
          <Link className={styles.reportLink} href="/reports/weekly-sales">
            <span>
              <span className={styles.reportName}>Weekly Sales Summary</span>
              <span className={styles.reportDescription}>
                New jobs, change orders, and account-manager sales.
              </span>
            </span>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
