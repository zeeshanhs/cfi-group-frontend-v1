"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  ApiErrorDto,
  TableArtifactDetailDto,
  TableArtifactSummaryDto,
  TableCellValue,
  TableColumnDto,
  TableRowPageDto,
} from "@/lib/data-insights/contracts";

import styles from "./data-insights.module.css";

type LoadError = { status: number; message: string };

async function loadJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T | ApiErrorDto;
  if (!response.ok) {
    throw {
      status: response.status,
      message: (body as ApiErrorDto).error.message,
    } satisfies LoadError;
  }
  return body as T;
}

function isLoadError(value: unknown): value is LoadError {
  return Boolean(
    value &&
      typeof value === "object" &&
      "status" in value &&
      "message" in value,
  );
}

function displayTimestamp(value: string) {
  return value
    .replace("T", " ")
    .replace(/\.000Z$/, " UTC")
    .replace(/Z$/, " UTC");
}

function displayCell(value: TableCellValue, column: TableColumnDto) {
  if (value === null) return <span aria-label="No value supplied">—</span>;
  if (column.dataType === "boolean") return value ? "Yes" : "No";
  if (column.dataType === "timestamp") {
    const text = String(value).replace("T", " ").replace(/Z$/, " UTC");
    const [date, ...time] = text.split(" ");
    return (
      <time dateTime={String(value)}>
        {date}
        <br />
        {time.join(" ")}
      </time>
    );
  }
  if (column.dataType === "date") {
    return <time dateTime={String(value)}>{String(value)}</time>;
  }
  if (
    (column.dataType === "decimal" || column.dataType === "currency") &&
    typeof value === "number"
  ) {
    return value.toFixed(column.precision ?? 2);
  }
  return String(value);
}

function countLine(detail: TableArtifactDetailDto) {
  if (!detail.isTruncated) {
    return `${detail.snapshotRowCount.toLocaleString()} rows in this snapshot · ${(
      detail.totalMatchingRowCount ?? detail.snapshotRowCount
    ).toLocaleString()} matching bids`;
  }
  if (detail.totalMatchingRowCount !== null) {
    return `${detail.snapshotRowCount.toLocaleString()} saved rows of ${detail.totalMatchingRowCount.toLocaleString()} matching bids`;
  }
  return `${detail.snapshotRowCount.toLocaleString()} saved rows · More matches exist; exact total unavailable`;
}

function ReportTable({
  detail,
  page,
}: {
  detail: TableArtifactDetailDto;
  page: TableRowPageDto;
}) {
  return (
    <div className={styles.reportTableScroller} tabIndex={0}>
      <table className={styles.reportTable}>
        <caption>
          {detail.title.startsWith("Bids created")
            ? "Bids created in the reporting period"
            : detail.title} — {detail.columnCount} columns
        </caption>
        <thead>
          <tr>
            {page.columns.map((column) => (
              <th scope="col" key={column.key} data-column={column.key}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {page.rows.map((row, rowIndex) => (
            <tr key={`${page.page}-${rowIndex}`}>
              {page.columns.map((column) => (
                <td
                  key={column.key}
                  data-column={column.key}
                  className={
                    column.dataType === "decimal" ||
                    column.dataType === "currency" ||
                    column.dataType === "integer"
                      ? styles.numericCell
                      : undefined
                  }
                >
                  {displayCell(row[column.key] ?? null, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportAttachment({
  attachment,
  onOpen,
  onExpired,
}: {
  attachment: TableArtifactSummaryDto;
  onOpen: (artifactId: string, source: HTMLButtonElement) => void;
  onExpired: () => void;
}) {
  const [detail, setDetail] = useState<TableArtifactDetailDto | null>(null);
  const [error, setError] = useState<LoadError | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/artifacts/${attachment.id}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401) onExpired();
        return loadJson<TableArtifactDetailDto>(response);
      })
      .then(setDetail)
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          isLoadError(caught)
            ? caught
            : { status: 500, message: "This report could not be loaded." },
        );
      });
    return () => controller.abort();
  }, [attachment.id, attempt, onExpired]);

  const visibleColumns = detail?.columns.slice(0, 4) ?? [];
  return (
    <section className={styles.attachment} aria-label="Table report attachment">
      <div className={styles.attachmentHeading}>
        <span className={styles.tableIcon} aria-hidden="true">▦</span>
        <div>
          <span className={styles.attachmentType}>Table report</span>
          <h3>{attachment.title}</h3>
          <p>{countLine(detail ?? ({ ...attachment } as TableArtifactDetailDto))}</p>
        </div>
      </div>
      {attachment.isTruncated ? (
        <p className={styles.capWarning}>
          This snapshot is limited to 5,000 rows. Ask a narrower question to
          see a smaller report.
        </p>
      ) : null}
      {!detail && !error ? <p>Loading report preview…</p> : null}
      {error ? (
        <div className={styles.previewError} role="status">
          <p>
            {error.status === 404
              ? "This saved report is no longer available."
              : "This report preview could not be loaded."}
          </p>
          {error.status !== 404 ? (
            <button type="button" onClick={() => { setError(null); setDetail(null); setAttempt((value) => value + 1); }}>
              Retry preview
            </button>
          ) : null}
        </div>
      ) : null}
      {detail ? (
        <>
          {detail.previewRows.length ? (
            <div className={styles.previewScroller}>
              <table className={styles.previewTable}>
                <caption className={styles.srOnly}>
                  First three rows of {detail.title}
                </caption>
                <thead>
                  <tr>
                    {visibleColumns.map((column) => (
                      <th key={column.key} scope="col">{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.previewRows.map((row, index) => (
                    <tr key={index}>
                      {visibleColumns.map((column) => (
                        <td key={column.key}>{displayCell(row[column.key] ?? null, column)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.previewEmpty}>No matching rows</p>
          )}
          <p className={styles.previewMeta}>
            Preview: {detail.previewRows.length} of {detail.snapshotRowCount.toLocaleString()} rows ·{" "}
            <span className={styles.desktopExtraColumns}>{Math.max(0, detail.columnCount - 4)} more columns</span>
            <span className={styles.mobileExtraColumns}>{Math.max(0, detail.columnCount - 2)} more columns</span>
          </p>
          <button
            className={styles.openReport}
            type="button"
            aria-label={`Open report: ${detail.title}`}
            onClick={(event) => onOpen(detail.id, event.currentTarget)}
          >
            Open report <span aria-hidden="true">→</span>
          </button>
        </>
      ) : null}
    </section>
  );
}

export function ReportView({
  artifactId,
  requestedPage,
  onClose,
  onPage,
  onExpired,
}: {
  artifactId: string;
  requestedPage: number;
  onClose: () => void;
  onPage: (page: number) => void;
  onExpired: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tableScrollerRef = useRef<HTMLDivElement | null>(null);
  const [detail, setDetail] = useState<TableArtifactDetailDto | null>(null);
  const [page, setPage] = useState<TableRowPageDto | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [pageError, setPageError] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pageAttempt, setPageAttempt] = useState(0);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [artifactId]);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const detailResponse = await fetch(`/api/artifacts/${artifactId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (detailResponse.status === 401) return onExpired();
        const nextDetail = await loadJson<TableArtifactDetailDto>(detailResponse);
        if (controller.signal.aborted) return;
        setDetail(nextDetail);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setLoadError(
            isLoadError(caught)
              ? caught
              : { status: 500, message: "This report could not be loaded." },
          );
        }
      }
    })();
    return () => controller.abort();
  }, [artifactId, attempt, onExpired]);

  useEffect(() => {
    if (!detail) return;
    const controller = new AbortController();
    const priorX = tableScrollerRef.current?.scrollLeft ?? 0;
    void fetch(
      `/api/artifacts/${artifactId}/rows?page=${requestedPage}&pageSize=50`,
      { cache: "no-store", signal: controller.signal },
    )
      .then((response) => {
        if (response.status === 401) onExpired();
        return loadJson<TableRowPageDto>(response);
      })
      .then((next) => {
        if (controller.signal.aborted) return;
        setPage(next);
        setPageError(null);
        requestAnimationFrame(() => {
          if (tableScrollerRef.current) tableScrollerRef.current.scrollLeft = priorX;
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setPageError(requestedPage);
      });
    return () => controller.abort();
  }, [artifactId, detail, onExpired, pageAttempt, requestedPage]);

  const pages = detail ? Math.ceil(detail.snapshotRowCount / 50) : 0;
  const loadingPage = Boolean(
    detail && detail.snapshotRowCount > 0 && page?.page !== requestedPage && pageError !== requestedPage,
  );
  const footer = useMemo(() => {
    if (!detail || !page) return "";
    if (!detail.snapshotRowCount) return "0 rows · No pages";
    const first = (page.page - 1) * page.pageSize + 1;
    const last = first + page.rows.length - 1;
    const scope = detail.isTruncated ? " saved rows" : "";
    return `Rows ${first.toLocaleString()}–${last.toLocaleString()} of ${detail.snapshotRowCount.toLocaleString()}${scope} · Page ${page.page} of ${pages}`;
  }, [detail, page, pages]);

  return (
    <section className={styles.reportCanvas} aria-labelledby="report-heading">
      <button className={styles.reportBack} type="button" onClick={onClose}>
        <span className={styles.backWide}>Close report</span>
        <span className={styles.backNarrow}>← Back to conversation</span>
      </button>
      {!detail && !loadError ? (
        <div className={styles.reportState} role="status">
          <h2 id="report-heading" ref={headingRef} tabIndex={-1}>Loading report…</h2>
          <div className={styles.reportSkeleton} aria-hidden="true" />
        </div>
      ) : null}
      {loadError ? (
        <div className={styles.reportState}>
          <h2 id="report-heading" ref={headingRef} tabIndex={-1}>
            {loadError.status === 403 || loadError.status === 404 ? "Report unavailable" : "Report could not be loaded"}
          </h2>
          <p>
            {loadError.status === 404
              ? "This saved report is no longer available. The conversation is still available."
              : loadError.status === 403
                ? "You no longer have access to this report."
                : "This report could not be loaded. Try again."}
          </p>
          {loadError.status !== 403 && loadError.status !== 404 ? (
            <button type="button" onClick={() => { setLoadError(null); setDetail(null); setPage(null); setAttempt((value) => value + 1); }}>
              Retry report
            </button>
          ) : null}
        </div>
      ) : null}
      {detail ? (
        <>
          <header className={styles.reportHeader}>
            <h2 id="report-heading" ref={headingRef} tabIndex={-1}>{detail.title}</h2>
            <p>{detail.filters[0]}</p>
            <p>{detail.filters.slice(1).join(" · ")}</p>
            <strong>{countLine(detail)}</strong>
            {detail.isTruncated ? (
              <p className={styles.capWarning}>
                This snapshot is limited to 5,000 rows. Ask a narrower question
                to see a smaller report.
              </p>
            ) : null}
            <p className={styles.reportInstruction}>
              Scroll horizontally to see all {detail.columnCount} columns. — means no value supplied, not zero.
            </p>
            <details className={styles.reportDetails}>
              <summary>Report details</summary>
              <dl>
                <div><dt>Data mode</dt><dd>Synthetic fixtures — not live business data</dd></div>
                <div><dt>Reporting timezone</dt><dd>{detail.provenance.reportingTimezone}</dd></div>
                <div><dt>Date basis</dt><dd>{detail.provenance.dateBasis ?? "Not supplied by the data source"}</dd></div>
                <div><dt>Period start</dt><dd>{detail.provenance.periodStart ? displayTimestamp(detail.provenance.periodStart) : "Not supplied by the data source"}</dd></div>
                <div><dt>Period end (exclusive)</dt><dd>{detail.provenance.periodEndExclusive ? displayTimestamp(detail.provenance.periodEndExclusive) : "Not supplied by the data source"}</dd></div>
                <div><dt>Applied filters</dt><dd>{`${detail.filters[1]}; no person filter; ${detail.filters[2].replace("Your", "your")}`}</dd></div>
                <div><dt>Queried at</dt><dd>{displayTimestamp(detail.provenance.queriedAt)}</dd></div>
                <div><dt>Data updated through</dt><dd>{detail.provenance.dataUpdatedThrough ? `${displayTimestamp(detail.provenance.dataUpdatedThrough)} — fixture watermark` : "Not supplied by the data source"}</dd></div>
                <div><dt>Snapshot rows</dt><dd>{detail.snapshotRowCount.toLocaleString()}</dd></div>
                <div><dt>Total matching rows</dt><dd>{detail.totalMatchingRowCount?.toLocaleString() ?? "Unknown"}</dd></div>
                <div><dt>Ordering</dt><dd>{detail.provenance.ordering ?? "Not supplied by the data source"}</dd></div>
              </dl>
            </details>
          </header>
          <div className={styles.reportBody}>
            {detail.snapshotRowCount === 0 ? (
              <div className={styles.emptyReport}>
                <h3>No matching bids</h3>
                <p>No bids matched 1–7 June 2026 in your authorized demo scope.</p>
                <div className={styles.emptySchemaScroller} tabIndex={0} aria-label="Empty report columns. Scroll horizontally to inspect all columns.">
                  <table className={styles.emptySchemaTable}>
                    <caption>{detail.title} — {detail.columnCount} columns</caption>
                    <thead><tr>{detail.columns.map((column) => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead>
                  </table>
                </div>
              </div>
            ) : null}
            {loadingPage ? <p className={styles.pageStatus}>Loading page {requestedPage}…</p> : null}
            {pageError === requestedPage ? (
              <section className={styles.pageError} role="alert">
                <p>Page {requestedPage} could not be loaded. Try again or return to page 1.</p>
                <div>
                  <button type="button" onClick={() => { setPageError(null); setPageAttempt((value) => value + 1); }}>Retry page</button>
                  <button type="button" onClick={() => onPage(1)}>Return to page 1</button>
                </div>
              </section>
            ) : null}
            {detail.snapshotRowCount > 0 && page?.page === requestedPage && pageError !== requestedPage ? (
              <div ref={tableScrollerRef} className={styles.reportTableHost}>
                <ReportTable detail={detail} page={page} />
              </div>
            ) : null}
          </div>
          <footer className={styles.reportFooter}>
            <span>{detail.snapshotRowCount === 0 ? "0 rows · No pages" : footer}</span>
            {detail.snapshotRowCount ? (
              <div>
                <button type="button" disabled={requestedPage <= 1 || loadingPage} onClick={() => onPage(requestedPage - 1)}>Previous page</button>
                <button type="button" disabled={requestedPage >= pages || loadingPage} onClick={() => onPage(requestedPage + 1)}>Next page</button>
              </div>
            ) : null}
          </footer>
        </>
      ) : null}
    </section>
  );
}
