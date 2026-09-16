import styles from "./weekly-sales-report.module.css";

export default function WeeklySalesLoading() {
  return (
    <div className={styles.statePanel} role="status">
      Loading weekly sales report…
    </div>
  );
}
