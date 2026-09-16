"use client";

import { useEffect } from "react";

import styles from "./weekly-sales-report.module.css";

export default function WeeklySalesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Weekly sales report failed to load", error);
  }, [error]);

  return (
    <div className={styles.statePanel} role="alert">
      <h1>Weekly sales report unavailable</h1>
      <p>
        The local reporting snapshot could not be read. Confirm the database is
        available, then try again.
      </p>
      <button type="button" className={styles.primaryButton} onClick={reset}>
        Try again
      </button>
    </div>
  );
}
