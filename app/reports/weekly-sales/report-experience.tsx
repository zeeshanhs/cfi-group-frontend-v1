"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  areDateRangesEqual,
  createDateRangeSearchParams,
  getDateRangeFilename,
  type DateRange,
  validateDateRange,
} from "@/lib/reporting/date-range";
import { formatIsoDate } from "@/lib/reporting/format";

import { ReportSkeleton } from "./report-skeleton";
import styles from "./weekly-sales-report.module.css";

interface ReportExperienceProps {
  accountSnapshotDate: string;
  appliedRange: DateRange;
  children: ReactNode;
}

type PendingAction = "apply" | "refresh" | null;

interface DateDraft extends DateRange {
  appliedRange: DateRange;
}

function getFilename(contentDisposition: string | null, range: DateRange) {
  const match = /filename="([^"]+)"/i.exec(contentDisposition ?? "");
  return match?.[1] ?? getDateRangeFilename(range);
}

export function ReportExperience({
  accountSnapshotDate,
  appliedRange,
  children,
}: ReportExperienceProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<DateDraft>({
    ...appliedRange,
    appliedRange,
  });
  const [isUpdating, startUpdate] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const transitionObserved = useRef(false);
  const draftMatchesApplied = areDateRangesEqual(
    draft.appliedRange,
    appliedRange,
  );
  const startDate = draftMatchesApplied ? draft.start : appliedRange.start;
  const endDate = draftMatchesApplied ? draft.end : appliedRange.end;
  const validation = validateDateRange(startDate, endDate);
  const draftRange = validation.ok ? validation.range : null;
  const isUnchanged =
    draftRange !== null && areDateRangesEqual(draftRange, appliedRange);
  const canApply = draftRange !== null && !isUnchanged && !isUpdating;
  const hasValidationError = !validation.ok;
  const describedBy = hasValidationError
    ? "date-filter-scope date-filter-error"
    : "date-filter-scope";

  useEffect(() => {
    if (isUpdating) {
      transitionObserved.current = true;
      return;
    }

    if (!transitionObserved.current || pendingAction === null) {
      return;
    }

    transitionObserved.current = false;
    const completedMessage =
      pendingAction === "apply"
        ? `Report updated for ${formatIsoDate(appliedRange.start)}–${formatIsoDate(appliedRange.end)}.`
        : "Report refreshed from the local snapshot.";
    const timeout = window.setTimeout(() => {
      setStatus(completedMessage);
      setPendingAction(null);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [appliedRange.end, appliedRange.start, isUpdating, pendingAction]);

  function applyDateRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateDateRange(startDate, endDate);

    if (!result.ok || areDateRangesEqual(result.range, appliedRange)) {
      return;
    }

    setPendingAction("apply");
    setStatus("Updating report…");
    const params = createDateRangeSearchParams(result.range);
    startUpdate(() => {
      router.push(`/reports/weekly-sales?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  function refreshReport() {
    setPendingAction("refresh");
    setStatus("Refreshing report…");
    startUpdate(() => {
      router.refresh();
    });
  }

  async function downloadPdf() {
    setIsDownloading(true);
    setStatus("Preparing PDF download…");
    const params = createDateRangeSearchParams(appliedRange);

    try {
      const response = await fetch(
        `/reports/weekly-sales/pdf?${params.toString()}`,
        { cache: "no-store" },
      );
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
        appliedRange,
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

  return (
    <>
      <section className={styles.toolbar} aria-label="Report controls">
        <form onSubmit={applyDateRange} noValidate>
          <div className={styles.dateControls}>
            <label>
              <span>Start date</span>
              <input
                aria-describedby={describedBy}
                aria-invalid={hasValidationError}
                required
                type="date"
                value={startDate}
                onChange={(event) =>
                  setDraft({
                    appliedRange,
                    start: event.target.value,
                    end: endDate,
                  })
                }
              />
            </label>
            <label>
              <span>End date</span>
              <input
                aria-describedby={describedBy}
                aria-invalid={hasValidationError}
                required
                type="date"
                value={endDate}
                onChange={(event) =>
                  setDraft({
                    appliedRange,
                    start: startDate,
                    end: event.target.value,
                  })
                }
              />
            </label>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!canApply}
            >
              {isUpdating && pendingAction === "apply"
                ? "Updating report…"
                : "Apply date range"}
            </button>
          </div>
        </form>

        <p id="date-filter-scope" className={styles.previewNote}>
          Selected dates filter new jobs and change orders. Account-manager
          sales remain the {formatIsoDate(accountSnapshotDate)} source snapshot.
        </p>
        {hasValidationError ? (
          <p id="date-filter-error" className={styles.validationError}>
            {validation.message}
          </p>
        ) : null}

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={isUpdating}
            onClick={refreshReport}
          >
            {isUpdating && pendingAction === "refresh"
              ? "Refreshing…"
              : "Refresh report"}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={isDownloading || isUpdating}
            onClick={downloadPdf}
          >
            {isDownloading ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        <p className={styles.status} aria-live="polite">
          {status}
        </p>
      </section>

      <div
        className={styles.reportViewport}
        role="region"
        aria-busy={isUpdating}
        aria-label="Scrollable weekly sales report"
        tabIndex={0}
      >
        {isUpdating ? <ReportSkeleton /> : children}
      </div>
    </>
  );
}
