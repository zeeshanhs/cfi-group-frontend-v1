import Link from "next/link";

import styles from "./reports.module.css";

export default function ReportsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/reports">
          CFI Group
        </Link>
        <span className={styles.sectionLabel}>Internal reports</span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
