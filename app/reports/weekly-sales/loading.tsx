import { ReportSkeleton } from "./report-skeleton";
import styles from "./weekly-sales-report.module.css";

export default function WeeklySalesLoading() {
  return (
    <div className={styles.reportViewport}>
      <ReportSkeleton />
    </div>
  );
}
