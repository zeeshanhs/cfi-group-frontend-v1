import styles from "./weekly-sales-report.module.css";

const kpiPlaceholders = Array.from({ length: 6 }, (_, index) => index);
const accountRows = Array.from({ length: 8 }, (_, index) => index);

export function ReportSkeleton() {
  return (
    <div
      className={`${styles.reportSheet} ${styles.skeletonSheet}`}
      aria-busy="true"
    >
      <p className={styles.skeletonStatus} role="status">
        Calculating weekly sales report…
      </p>
      <div aria-hidden="true">
        <div className={styles.skeletonHeader}>
          <span className={styles.skeletonIdentity} />
          <span className={styles.skeletonTitle} />
          <span className={styles.skeletonMeta} />
        </div>
        <div className={styles.skeletonRule} />
        <div className={styles.skeletonKpis}>
          {kpiPlaceholders.map((index) => (
            <span className={styles.skeletonKpi} key={index} />
          ))}
        </div>
        <span className={styles.skeletonSectionHeading} />
        <span className={styles.skeletonTableBlock} />
        <span className={styles.skeletonSectionHeading} />
        <span className={styles.skeletonTableBlock} />
        <span className={styles.skeletonSectionHeading} />
        <div className={styles.skeletonAccountRows}>
          {accountRows.map((index) => (
            <span className={styles.skeletonAccountRow} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
