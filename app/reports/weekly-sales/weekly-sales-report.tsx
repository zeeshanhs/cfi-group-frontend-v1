import {
  formatAmount,
  formatAmountAccessibleLabel,
  formatCompactAmount,
  formatInteger,
  formatIsoDate,
  formatPercentChange,
} from "@/lib/reporting/format";
import type { WeeklySalesReportModel } from "@/lib/reporting/weekly-sales";

import styles from "./weekly-sales-report.module.css";

interface WeeklySalesReportProps {
  report: WeeklySalesReportModel;
}

function Amount({
  value,
  compact = false,
  zeroAsDash = true,
}: {
  value: number;
  compact?: boolean;
  zeroAsDash?: boolean;
}) {
  const className = value < 0 ? styles.negative : undefined;
  return (
    <span className={className} aria-label={formatAmountAccessibleLabel(value)}>
      {compact ? formatCompactAmount(value) : formatAmount(value, zeroAsDash)}
    </span>
  );
}

function coverageLabel(
  coverage: WeeklySalesReportModel["metadata"]["newJobSourceCoverage"],
) {
  if (!coverage) {
    return "No loaded date coverage";
  }
  return `${formatIsoDate(coverage.start)}–${formatIsoDate(coverage.end)}`;
}

export function WeeklySalesReport({ report }: WeeklySalesReportProps) {
  const percentChange = report.kpis.salesYtd.percentChange;
  const selectedPeriod = `${formatIsoDate(
    report.metadata.selectedRange.start,
  )}–${formatIsoDate(report.metadata.selectedRange.end)}`;
  const percentDirection =
    percentChange === null || percentChange === 0
      ? "No comparable change"
      : `${Math.abs(percentChange).toFixed(1)} percent ${
          percentChange > 0 ? "increase" : "decrease"
        } versus prior year to date`;

  return (
    <article
      className={styles.reportSheet}
      aria-label="Weekly Sales Meeting Report"
      data-report-ready="true"
    >
      <header className={styles.reportHeader}>
        <div className={styles.textIdentity}>CFI Group</div>
        <div className={styles.titleBlock}>
          <h1>Weekly Sales Meeting Report</h1>
          <p>
            Weekly Summary — New Jobs, Change Orders &amp; Account Manager Sales
          </p>
        </div>
        <div className={styles.reportMeta}>
          <span>
            Selected period <strong>{selectedPeriod}</strong>
          </span>
          <span>
            Account snapshot{" "}
            <strong>{formatIsoDate(report.metadata.accountSnapshotDate)}</strong>
          </span>
        </div>
      </header>

      <div className={styles.colorRule} aria-hidden="true" />

      <section className={styles.kpiGrid} aria-label="Report key metrics">
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>New jobs — selected period</p>
          <p className={styles.kpiValue}>
            {formatInteger(report.kpis.newJobs.count)}
          </p>
          <p className={styles.kpiSupport}>
            <Amount value={report.kpis.newJobs.contractTotal} /> contract value
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Change orders — selected period</p>
          <p className={styles.kpiValue}>
            {formatInteger(report.kpis.changeOrders.count)}
          </p>
          <p className={styles.kpiSupport}>
            <Amount value={report.kpis.changeOrders.netAdjustment} /> net ·{" "}
            {formatInteger(report.kpis.changeOrders.negativeAdjustmentCount)}{" "}
            negative
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Sales — reporting YTD</p>
          <p className={styles.kpiValue}>
            <Amount
              compact
              zeroAsDash={false}
              value={report.kpis.salesYtd.reportingYearYtd}
            />
          </p>
          <p
            className={
              percentChange !== null && percentChange < 0
                ? `${styles.kpiSupport} ${styles.negative}`
                : `${styles.kpiSupport} ${styles.positive}`
            }
            aria-label={percentDirection}
          >
            {percentChange !== null && percentChange > 0 ? "▲ " : null}
            {percentChange !== null && percentChange < 0 ? "▼ " : null}
            {formatPercentChange(percentChange)} vs prior YTD
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Sales — source last 7 days</p>
          <p className={styles.kpiValue}>
            <Amount compact value={report.kpis.last7DaysSales} />
          </p>
          <p className={styles.kpiSupport}>Exact boundary unavailable</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>
            Contract value closed — source periods
          </p>
          <p className={styles.kpiValue}>
            <Amount compact value={report.kpis.contractClosed.current} />
          </p>
          <p className={styles.kpiSupport}>
            prior source period{" "}
            <Amount compact value={report.kpis.contractClosed.prior} />
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Pending contract value</p>
          <p className={styles.kpiValue}>
            <Amount compact value={report.kpis.pendingContract.pending} />
          </p>
          <p className={styles.kpiSupport}>
            EOY projected sales{" "}
            <Amount compact value={report.kpis.pendingContract.eoyProjected} />
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="new-jobs-heading">
        <div className={styles.sectionHeading}>
          <h2 id="new-jobs-heading">New Jobs Opened — Selected Period</h2>
          <p>
            Loaded opened-date coverage:{" "}
            {coverageLabel(report.metadata.newJobSourceCoverage)}
          </p>
        </div>
        <table className={styles.table}>
          <caption className="sr-only">
            Newly opened jobs from the loaded reporting extract
          </caption>
          <thead>
            <tr>
              <th scope="col">Job</th>
              <th scope="col">Project</th>
              <th scope="col">Customer</th>
              <th scope="col">AM</th>
              <th scope="col">City</th>
              <th scope="col" className={styles.numeric}>
                Contract
              </th>
              <th scope="col" className={styles.numeric}>
                Opened
              </th>
              <th scope="col">BD Link</th>
            </tr>
          </thead>
          <tbody>
            {report.newJobs.rows.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  No new jobs are present in the local snapshot for{" "}
                  {selectedPeriod}.
                </td>
              </tr>
            ) : (
              report.newJobs.rows.map((row) => (
                <tr key={row.jobId}>
                  <th scope="row">{row.jobId}</th>
                  <td className={styles.emphasis}>{row.projectName}</td>
                  <td>{row.customerName}</td>
                  <td>{row.salesId}</td>
                  <td>{row.location}</td>
                  <td className={styles.numeric}>
                    <Amount value={row.originalContract} />
                  </td>
                  <td className={styles.numeric}>
                    {formatIsoDate(row.openedDate)}
                  </td>
                  <td>{row.bdLinked}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={5}>
                Total — {formatInteger(report.newJobs.count)} new jobs
              </th>
              <td className={styles.numeric}>
                <Amount value={report.newJobs.contractTotal} />
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </section>

      <section className={styles.section} aria-labelledby="change-orders-heading">
        <div className={styles.sectionHeading}>
          <h2 id="change-orders-heading">
            Job Cost Change Orders — Selected Period
          </h2>
          <p>
            Loaded CO-date coverage:{" "}
            {coverageLabel(report.metadata.changeOrderSourceCoverage)}
          </p>
        </div>
        <table className={styles.table}>
          <caption className="sr-only">
            Job cost change orders from the loaded reporting extract
          </caption>
          <thead>
            <tr>
              <th scope="col">Job</th>
              <th scope="col">Project</th>
              <th scope="col" className={styles.numeric}>
                CO #
              </th>
              <th scope="col" className={styles.numeric}>
                Date
              </th>
              <th scope="col" className={styles.numeric}>
                Total Inc/Adj
              </th>
            </tr>
          </thead>
          <tbody>
            {report.changeOrders.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  No change orders are present in the local snapshot for{" "}
                  {selectedPeriod}.
                </td>
              </tr>
            ) : (
              report.changeOrders.rows.map((row) => (
                <tr key={`${row.jobId}-${row.coNumber}`}>
                  <th scope="row">{row.jobId}</th>
                  <td className={styles.emphasis}>{row.jobDescription}</td>
                  <td className={styles.numeric}>{row.coNumber}</td>
                  <td className={styles.numeric}>{formatIsoDate(row.coDate)}</td>
                  <td className={styles.numeric}>
                    <Amount value={row.totalIncomeAdj} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={4}>
                Total — {formatInteger(report.changeOrders.count)} change orders
              </th>
              <td className={styles.numeric}>
                <Amount value={report.changeOrders.netAdjustment} />
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className={styles.section} aria-labelledby="account-summary-heading">
        <div className={styles.sectionHeading}>
          <h2 id="account-summary-heading">Account Manager Summary</h2>
          <p>
            Account-manager snapshot:{" "}
            {formatIsoDate(report.metadata.accountSnapshotDate)};
            last-seven-day boundary unavailable
          </p>
        </div>
        <table className={`${styles.table} ${styles.accountTable}`}>
          <caption className="sr-only">
            Sales, receivables, projections, and source-period contract values
            by active account manager
          </caption>
          <thead>
            <tr>
              <th rowSpan={2} scope="col">
                Account Manager
              </th>
              <th colSpan={3} scope="colgroup" className={styles.groupRed}>
                Sales
              </th>
              <th scope="colgroup" className={styles.groupOrange}>
                Last 7 Days
              </th>
              <th colSpan={3} scope="colgroup" className={styles.groupGray}>
                Backlog &amp; Projection
              </th>
              <th colSpan={2} scope="colgroup" className={styles.groupOrange}>
                Contract Closed
              </th>
            </tr>
            <tr>
              <th scope="col" className={styles.numeric}>
                Reporting YTD
              </th>
              <th scope="col" className={styles.numeric}>
                Prior YTD
              </th>
              <th scope="col" className={styles.numeric}>
                Prior Year
              </th>
              <th scope="col" className={styles.numeric}>
                Sales
              </th>
              <th scope="col" className={styles.numeric}>
                A/R Outstanding
              </th>
              <th scope="col" className={styles.numeric}>
                Pending Contract
              </th>
              <th scope="col" className={styles.numeric}>
                EOY Projected Sales
              </th>
              <th scope="col" className={styles.numeric}>
                Current Source Period
              </th>
              <th scope="col" className={styles.numeric}>
                Prior Source Period
              </th>
            </tr>
          </thead>
          <tbody>
            {report.accountManagers.rows.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.emptyCell}>
                  No active account-manager values are present in the loaded
                  snapshot.
                </td>
              </tr>
            ) : (
              report.accountManagers.rows.map((row) => (
                <tr key={row.projectClassId}>
                  <th scope="row">{row.projectClassName}</th>
                  <td className={styles.numeric}>
                    <Amount value={row.salesReportingYearYtd} />
                  </td>
                  <td className={styles.numeric}>
                    <Amount value={row.salesPriorYearYtd} />
                  </td>
                  <td className={styles.numeric}>
                    <Amount value={row.salesPriorYear} />
                  </td>
                  <td className={`${styles.numeric} ${styles.highlight}`}>
                    <Amount value={row.salesLast7Days} />
                  </td>
                  <td className={styles.numeric}>
                    <Amount value={row.arOutstanding} />
                  </td>
                  <td className={styles.numeric}>
                    <Amount value={row.pendingContract} />
                  </td>
                  <td className={styles.numeric}>
                    <Amount value={row.eoyProjectedSales} />
                  </td>
                  <td className={`${styles.numeric} ${styles.highlight}`}>
                    <Amount value={row.contractValueClosedCurrent} />
                  </td>
                  <td className={styles.numeric}>
                    <Amount value={row.contractValueClosedPrior} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td className={styles.numeric}>
                <Amount value={report.accountManagers.totals.salesReportingYearYtd} />
              </td>
              <td className={styles.numeric}>
                <Amount value={report.accountManagers.totals.salesPriorYearYtd} />
              </td>
              <td className={styles.numeric}>
                <Amount value={report.accountManagers.totals.salesPriorYear} />
              </td>
              <td className={styles.numeric}>
                <Amount value={report.accountManagers.totals.salesLast7Days} />
              </td>
              <td className={styles.numeric}>
                <Amount value={report.accountManagers.totals.arOutstanding} />
              </td>
              <td className={styles.numeric}>
                <Amount value={report.accountManagers.totals.pendingContract} />
              </td>
              <td className={styles.numeric}>
                <Amount value={report.accountManagers.totals.eoyProjectedSales} />
              </td>
              <td className={styles.numeric}>
                <Amount
                  value={
                    report.accountManagers.totals.contractValueClosedCurrent
                  }
                />
              </td>
              <td className={styles.numeric}>
                <Amount
                  value={report.accountManagers.totals.contractValueClosedPrior}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <aside className={styles.coverageCallout} aria-label="Data coverage">
        <strong>Data coverage</strong> — Selected period: {selectedPeriod}.
        Loaded new-job dates: {coverageLabel(report.metadata.newJobSourceCoverage)};
        loaded change-order dates:{" "}
        {coverageLabel(report.metadata.changeOrderSourceCoverage)}. Results outside
        or wider than loaded coverage may be partial; an empty result does not
        prove no business activity occurred. Account-manager metrics remain the
        unfiltered {formatIsoDate(report.metadata.accountSnapshotDate)} source
        snapshot, and the source last-seven-day boundary is unavailable. Source
        currency is not confirmed. This static local snapshot is not live or
        exhaustive.
      </aside>

      <footer className={styles.reportFooter}>
        <span>
          Chesapeake Finishing, Inc. · CFI Group — Confidential · Internal Use
          Only
        </span>
        <span>Weekly Sales Meeting Report · Page 1 of 1</span>
      </footer>
    </article>
  );
}
