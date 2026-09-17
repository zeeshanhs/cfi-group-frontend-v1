import Link from "next/link";

import styles from "./reports.module.css";

export default function ReportsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/app">
          CFI Group
        </Link>
        <nav className={styles.headerNav} aria-label="Report navigation">
          <Link href="/app">All features</Link>
          <span className={styles.sectionLabel}>Internal reports</span>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
