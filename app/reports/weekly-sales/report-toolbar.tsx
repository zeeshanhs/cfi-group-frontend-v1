"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import styles from "./weekly-sales-report.module.css";

const DEFAULT_START_DATE = "2026-09-07";
const DEFAULT_END_DATE = "2026-09-13";
const DEFAULT_PDF_FILENAME = "cfi-weekly-sales-summary-2026-09-13.pdf";

function getFilename(contentDisposition: string | null) {
  const match = /filename="([^"]+)"/i.exec(contentDisposition ?? "");
  return match?.[1] ?? DEFAULT_PDF_FILENAME;
}

export function ReportToolbar() {
  const router = useRouter();
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [isRefreshing, startRefresh] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState("");
  const refreshStarted = useRef(false);
  const dateError = startDate > endDate;

  useEffect(() => {
    if (isRefreshing) {
      refreshStarted.current = true;
      return;
    }

    if (refreshStarted.current) {
      refreshStarted.current = false;
      setStatus("Report refreshed from the local snapshot.");
    }
  }, [isRefreshing]);

  function refreshReport() {
    setStatus("Refreshing report…");
    startRefresh(() => {
      router.refresh();
    });
  }

  async function downloadPdf() {
    setIsDownloading(true);
    setStatus("Preparing PDF download…");

    try {
      const response = await fetch("/reports/weekly-sales/pdf", {
        cache: "no-store",
      });
      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok || !contentType.includes("application/pdf")) {
        const message = await response.text();
        throw new Error(message || "The PDF could not be generated.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = getFilename(
        response.headers.get("content-disposition"),
      );
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(objectUrl);
      setStatus("PDF download started.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `PDF download failed: ${error.message}`
          : "PDF download failed. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  const describedBy = dateError
    ? "date-preview-help date-preview-error"
    : "date-preview-help";

  return (
    <section className={styles.toolbar} aria-label="Report controls">
      <div className={styles.dateControls}>
        <label>
          <span>Start date</span>
          <input
            aria-describedby={describedBy}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label>
          <span>End date</span>
          <input
            aria-describedby={describedBy}
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <button type="button" disabled title="Date filtering is coming soon">
          Apply date range — coming soon
        </button>
      </div>

      <p id="date-preview-help" className={styles.previewNote}>
        Preview only — changing these dates does not filter the current static
        extract.
      </p>
      {dateError ? (
        <p id="date-preview-error" className={styles.validationError}>
          Start date must be on or before end date. The report remains
          unchanged.
        </p>
      ) : null}

      <div className={styles.toolbarActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={isRefreshing}
          onClick={refreshReport}
        >
          {isRefreshing ? "Refreshing…" : "Refresh report"}
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={isDownloading}
          onClick={downloadPdf}
        >
          {isDownloading ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>
      <p className={styles.status} aria-live="polite">
        {status}
      </p>
    </section>
  );
}
