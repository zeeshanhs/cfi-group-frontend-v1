"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import styles from "./weekly-sales-report.module.css";

interface ReportLoadErrorProps {
  message: string;
}

export function ReportLoadError({ message }: ReportLoadErrorProps) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  return (
    <div className={styles.statePanel} role="alert">
      <h1>Weekly sales report unavailable</h1>
      <p>{message}</p>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={isRetrying}
        onClick={() => startRetry(() => router.refresh())}
      >
        {isRetrying ? "Trying again…" : "Try again"}
      </button>
    </div>
  );
}
