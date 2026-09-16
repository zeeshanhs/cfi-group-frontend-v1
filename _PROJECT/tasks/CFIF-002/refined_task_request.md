# CFIF-002 — Enable date filtering for the weekly sales report

## Objective

Turn the existing preview-only date controls on `/reports/weekly-sales` into a real, request-time date filter. Applying a valid range must regenerate the report from the current contents of the repository-local SQLite database, show a report-shaped loading placeholder while the new result is calculated, and keep the web report and downloaded PDF on the same applied range.

This task extends the report delivered in CFIF-001. Preserve its report structure, calculations, formatting, accessibility, responsive behavior, and one-page PDF layout except where this request explicitly changes date-dependent behavior or loading feedback.

## Repository starting point

- Framework: Next.js `16.3.5` App Router, React `19.2.8`, strict TypeScript, Tailwind CSS 4.
- Existing report route: `app/reports/weekly-sales/page.tsx`.
- Existing client controls: `app/reports/weekly-sales/report-toolbar.tsx`.
- Existing server-only reporting code: `lib/reporting/database.ts` and `lib/reporting/weekly-sales.ts`.
- Existing shared report renderer: `app/reports/weekly-sales/weekly-sales-report.tsx`.
- Existing PDF route: `app/reports/weekly-sales/pdf/route.ts`.
- Existing focused Vitest coverage: `lib/reporting/weekly-sales.test.ts` and `app/reports/weekly-sales/weekly-sales-report.test.tsx`.
- Data source: `_PROJECT/data/reporting/cfi_reporting.sqlite`, a static local snapshot rather than a live warehouse.
- The current toolbar deliberately says the dates are preview-only, its apply button is disabled, the data layer loads every source row, the PDF uses a fixed report URL, and `loading.tsx` exposes only a text message. These are the behaviors this task replaces.

Before implementation, read the root `AGENTS.md`, `_PROJECT/data/reporting/README.md`, `_PROJECT/data/reporting/semantic_layer.yaml`, the relevant installed Next.js 16 guides under `node_modules/next/dist/docs/`, and the repository brand-kit instructions. Preserve unrelated working-tree changes and treat this file plus `task_request.md` as task inputs.

## Business-semantic decision

The available database cannot support arbitrary-period filtering for every report section:

- Filter **New Jobs Opened** inclusively by `rpt_new_jobs_opened.opened_date`.
- Filter **Job Cost Change Orders** inclusively by `job_cost_change_orders.co_date`.
- Do **not** filter `account_manager_summary` by the selected dates. It is one pre-aggregated account-manager snapshot. Its `report_period_start` and `report_period_end` provide annual report context and do not define the exact period behind `sales_last_7_days` or the other measures.
- Consequently, the New Jobs and Change Orders KPI cards and detail tables change with the selected range. The four account-manager-derived KPI cards and the Account Manager Summary table remain snapshot values.

Make this scope visible in the interface and report. Do not imply that the account-manager sales values were recalculated for the selected dates. “Fresh” in this task means reading the current bytes in the local SQLite snapshot for every regeneration; it does not turn the snapshot into a live or exhaustive data source.

## Date-range contract

Use `start` and `end` query parameters as the canonical applied state:

```text
/reports/weekly-sales?start=2026-09-07&end=2026-09-13
```

- If both parameters are absent, default to `2026-09-07` through `2026-09-13`.
- Both boundaries are inclusive.
- Accept exactly one scalar value for each parameter in strict `YYYY-MM-DD` form.
- Validate that each value is a real calendar date and that `start <= end`. Avoid timezone conversion when parsing or formatting date-only values.
- Do not silently swap, clamp, partially default, or otherwise reinterpret invalid input.
- If parameters are invalid, show a filter-specific validation state with a **Use default dates** recovery action and do not query or render a report for the invalid range.
- Keep parsing and validation in a shared pure server-safe helper so the page and PDF route enforce the same contract.

No maximum range is imposed in this task. The limited source coverage must be disclosed instead of representing out-of-coverage dates as known zero activity.

## Filter interaction

Replace the preview-only behavior with an explicit apply flow:

1. Render visibly labeled, required native date inputs for **Start date** and **End date**.
2. Initialize them from the applied server range, not from client-only constants.
3. Enable an **Apply date range** button when the draft values are valid and differ from the applied range.
4. On submit, navigate to the canonical URL with the validated and encoded `start` and `end` values. Keep the user’s scroll position and add a browser-history entry so Back/Forward restores earlier applied ranges.
5. Do not regenerate on every keystroke. Editing is a draft until the user applies it.
6. While navigation is pending, disable Apply and expose the text **Updating report…**. Prevent duplicate submissions.
7. Keep **Refresh report**. It must retain the current applied range, issue a new server request, and read SQLite again.
8. Keep **Download PDF** and make it request the current applied range.
9. When Back/Forward or another navigation changes the applied query parameters, synchronize the input values with that applied range.

Validation and feedback requirements:

- Blank input: **Enter both a start date and an end date.**
- Reversed range: **Start date must be on or before end date.**
- Associate the message with both inputs, set `aria-invalid` when applicable, and announce pending/result text through the existing polite live region.
- Remove the old “Preview only” copy and the “coming soon” disabled control.
- Replace it with persistent, concise scope text: **Selected dates filter new jobs and change orders. Account-manager sales remain the 9/14/2026 source snapshot.**
- Make **Apply date range** the primary action in the filtering group. Keep refresh and PDF download visually secondary so action emphasis remains clear.

Construct navigation URLs only from the fixed application path and validated date values. Never pass an untrusted complete URL to `router.push` or `router.replace`.

## Request-time data access and cache behavior

- Change the report loader to accept a validated date range.
- Call `connection()` from `next/server` before opening or querying the synchronous SQLite database, as required by the installed Next.js documentation.
- Keep the page request-rendered. An explicit `export const dynamic = "force-dynamic"` on the weekly-sales page is acceptable and preferred for making this route’s no-full-route-cache contract obvious.
- Do not wrap report loading, query results, or model construction in `cache`, `unstable_cache`, `"use cache"`, or any module-level memoization.
- Open the database read-only with `fileMustExist: true` for each report generation and close the handle in `finally`, preserving the current database safety boundary.
- Use parameterized SQL predicates for the two filtered tables:

  ```sql
  WHERE opened_date BETWEEN :start AND :end
  WHERE co_date BETWEEN :start AND :end
  ```

- Query all account-manager rows for the current snapshot; do not add a date predicate to that table.
- Continue calculating KPI totals, row inclusion, ordering, comparison percentages, labels, and presentation formatting in TypeScript rather than moving business calculations into SQL.
- Derive full loaded coverage for `opened_date` and `co_date` from the current database during the same read, independently of the filtered result. Do not mistake the min/max of filtered rows for total source coverage and do not hard-code observed coverage as if it can never change.
- Do not add a browser-facing raw-data API or copy the database into a public directory.

The page’s use of `searchParams` must follow the Next.js 16 async API. A changed date range and a manual refresh must each cause a new server render and a new database open/query cycle.

## Report model and visible report changes

Update the report model so it distinguishes:

- the applied inclusive date range;
- the full loaded `opened_date` coverage;
- the full loaded `co_date` coverage;
- the filtered new-job rows and totals;
- the filtered change-order rows and totals; and
- the unfiltered account-manager snapshot and its provenance date.

Update date-dependent report copy:

- Header metadata: replace **Weekly extracts** with **Selected period** and display the applied range.
- KPI labels: **New jobs — selected period** and **Change orders — selected period**.
- Section headings: **New Jobs Opened — Selected Period** and **Job Cost Change Orders — Selected Period**.
- Empty messages must name the selected period, for example **No new jobs are present in the local snapshot for 9/10/2026–9/10/2026.**
- Keep the existing Account Manager Summary snapshot label and existing caveat that the exact source last-seven-day boundary is unavailable.

Revise the coverage callout so it clearly states:

1. the selected inclusive period;
2. the full loaded new-job and change-order date coverage from the current database;
3. that results outside or wider than loaded coverage may be partial and an empty result does not prove that no business activity occurred;
4. that account-manager metrics are the unfiltered 9/14/2026 source snapshot; and
5. that source currency remains unconfirmed.

Do not relabel the static snapshot as live, current beyond its recorded coverage, or exhaustive.

## Loading placeholder

Replace the generic loading message with a report-shaped skeleton that mirrors the stable major regions of the report:

- report header and metadata;
- six KPI cards;
- New Jobs section;
- Change Orders section; and
- Account Manager Summary section.

Requirements:

- Show the skeleton in the report area when an applied range is being requested or refreshed; keep the report controls understandable and usable as appropriate outside that area.
- Do not leave the previous range’s values presented as if they belong to the newly applied range.
- Include one textual status such as **Calculating weekly sales report…**, mark the result region busy, and make the repeated visual skeleton shapes decorative to assistive technology.
- Use neutral/pale-gray placeholders consistent with the existing report and CFI application surfaces. Do not use action red as an indeterminate status color.
- A restrained opacity pulse is sufficient. Disable the animation under `prefers-reduced-motion: reduce` while keeping the placeholders visible.
- Keep dimensions close to the final report to avoid a large layout shift and retain the bounded mobile scroller.
- Do not add an artificial delay merely to make the animation visible.
- Keep `data-report-ready="true"` exclusive to the final report so PDF generation never treats the skeleton as complete.

Use a keyed Suspense boundary or an equivalent Next.js App Router pattern that reliably exposes the fallback for each newly applied range. The implementation may reuse that skeleton from `loading.tsx`, but the source of truth should be one shared component rather than duplicated placeholder markup.

## PDF behavior

The PDF must represent the same applied range as the web report.

- Request the endpoint as `/reports/weekly-sales/pdf?start=YYYY-MM-DD&end=YYYY-MM-DD`.
- Validate the PDF query parameters with the same shared date-range parser used by the page. Return a safe `400` text response for invalid input.
- Build the internal Puppeteer render URL from the fixed `/reports/weekly-sales` pathname, the validated dates, and application-owned `print=1`. Never accept a caller-supplied render URL or path.
- Keep the current `REPORT_RENDER_ORIGIN` validation and the shared report component/CSS approach.
- The internal print request must perform its own fresh database read and wait for the final `data-report-ready="true"` marker.
- Continue returning `Cache-Control: no-store` for success and failure responses.
- Use a deterministic filename containing both applied dates, for example `cfi-weekly-sales-summary-2026-09-07-to-2026-09-13.pdf`.
- Preserve the one-page landscape Letter output. Date filtering must not create a second PDF-only report template.

## Empty and failure behavior

- A valid range with no new jobs and/or no change orders is a successful result, not an error. Render the existing table structure, range-specific empty text, and zero totals.
- The account-manager section still renders from its snapshot when the two date-filtered sections are empty.
- A missing/corrupt database or query failure must fail the report safely and retain a working retry action. Never fall back to previous-range values, hard-coded mockup values, or silent zeros.
- An invalid date range is a validation state, not a database failure.
- PDF generation failure remains local to the toolbar and must not replace an already rendered web report.

## Suggested file changes

Equivalent organization is acceptable if the boundaries remain clear.

| Path | Expected change |
| --- | --- |
| `lib/reporting/weekly-sales.ts` | Add the validated range type/parser or consume a colocated pure date-range helper; parameterize filtered queries; derive full source coverage; expose selected-range metadata; preserve request-time loading. |
| `lib/reporting/weekly-sales.test.ts` | Add validation, date-filter, empty-range, alternate-range, coverage, snapshot-invariance, and fresh-read regression tests. |
| `app/reports/weekly-sales/page.tsx` | Parse async `searchParams`, keep the route dynamic, pass the applied range into controls/data/PDF state, and place report loading behind a keyed Suspense boundary. |
| `app/reports/weekly-sales/report-toolbar.tsx` | Replace preview state with URL-backed apply behavior, validation, pending state, range-preserving refresh, and range-aware PDF requests. |
| `app/reports/weekly-sales/weekly-sales-report.tsx` | Render selected-period metadata, labels, empty copy, and truthful coverage/snapshot disclosure. |
| `app/reports/weekly-sales/report-skeleton.tsx` | Add one accessible reusable report-shaped loading placeholder. Filename may differ. |
| `app/reports/weekly-sales/loading.tsx` | Reuse the shared skeleton for direct route loads. |
| `app/reports/weekly-sales/weekly-sales-report.module.css` | Add responsive skeleton and reduced-motion styles; preserve existing report geometry. |
| `app/reports/weekly-sales/pdf/route.ts` | Accept and validate the range, pass it to the fixed internal print URL, retain fresh/no-store behavior, and produce a range-aware filename. |
| `app/reports/weekly-sales/weekly-sales-report.test.tsx` | Update copy expectations and cover selected-range/empty-state rendering. |
| `README.md` | Update the fixed internal PDF-path note only if its current wording becomes inaccurate. |

Do not add a state library, date library, ORM, new component library, new API route, or new test framework. The existing platform and dependencies are sufficient.

## Automated regression expectations

Use the checked-in database read-only. Tests that need mutation must copy it to a temporary path and must never edit or rebuild the checked-in file.

At minimum, cover:

1. Missing parameters use the default `2026-09-07` through `2026-09-13` range.
2. Invalid format, impossible dates, repeated query parameters, missing one boundary, and `start > end` are rejected.
3. Default-range filtered values are:
   - new jobs: `4`, original-contract total `188125.00`;
   - change orders: `1`, net adjustment `38334.36`, negative adjustments `0`.
4. For `2026-08-12` through `2026-08-31`:
   - new jobs: `0`, original-contract total `0.00`;
   - change orders: `4`, net adjustment `31990.40`, negative adjustments `1`.
5. For the single day `2026-09-10`, new jobs are `3` with original-contract total `159125.00`.
6. Account-manager rows and all account-manager-derived KPI totals are identical across valid date ranges.
7. Full source coverage remains `2026-09-09` through `2026-09-10` for new jobs and `2026-08-12` through `2026-09-09` for change orders, even when the filtered result is narrower or empty.
8. A valid empty range produces truthful empty tables and zero date-filtered totals without failing the report.
9. A fresh-read test uses a temporary database copy, changes a relevant row between two loader calls, and proves the second call reflects the change. No module-level cached result may satisfy the second call.
10. Rendered markup includes the selected period, updated scope disclosure, range-specific empty content, and only one report `<h1>`.
11. The PDF parameter/URL helper accepts validated dates, rejects invalid dates, and cannot be redirected to an arbitrary path or origin.

Preserve the existing tests for formatting, identifier handling, comparison math, account-manager inclusion/order, safe database failures, and source-currency wording, updating only assertions intentionally changed by this task.

## Brand, accessibility, and responsive requirements

- Reuse the existing CFI report and application styling; this is an interaction/data enhancement, not a redesign.
- Apply the current `brand-kit/` working rules, particularly direct operational wording, restrained red action emphasis, neutral surfaces, square controls, explicit feedback, and the existing plain-text `CFI Group` identity fallback.
- Do not introduce imagery or extract any identity asset from reference screenshots.
- Maintain visible keyboard focus, native date-input behavior, at least 44px interactive targets, readable contrast, and keyboard-operable apply/refresh/download actions.
- Preserve the existing desktop report geometry and bounded mobile horizontal scroller. The toolbar may stack at narrow widths without body-level horizontal overflow.
- Loading and pending meaning must be available as text and must not depend on animation or color alone.

## Out of scope

- Adding historical transaction-level sales data or inventing a date mapping for `account_manager_summary`.
- Changing the SQLite schema, semantic layer, loader, source CSV files, or checked-in database contents.
- Turning the local snapshot into a live warehouse connection.
- Adding presets, calendars, relative ranges, timezone selection, pagination, charts, or additional reports.
- Redesigning the report, changing unrelated KPI formulas, or changing the brand kit.
- Persisting a user preference beyond the shareable URL/history behavior.

## Acceptance criteria

The task is complete when all of the following are true:

- A user can enter a valid start and end date, apply the range, and see the URL and report’s selected-period metadata update.
- New Jobs and Change Orders rows, counts, totals, negative-adjustment count, and empty states use their documented inclusive date fields and match the expected regression values above.
- Account-manager-derived KPIs and the Account Manager Summary remain the explicitly labeled 9/14/2026 snapshot for every selected range.
- Applying a range and using **Refresh report** each trigger a fresh request-time SQLite read; no report result is served from an application/server data cache.
- The report area shows an accessible, report-shaped animated placeholder while regeneration is pending, with animation disabled for reduced-motion users and no artificial delay.
- Invalid or incomplete dates cannot trigger a database query and produce clear inline recovery guidance.
- The coverage disclosure distinguishes the selected period, full loaded source coverage, partial-data risk, account snapshot, and unconfirmed currency.
- The downloaded PDF uses the same selected range, filtered values, disclosures, report component, and one-page landscape Letter layout as the web report.
- Direct reload, Back/Forward, empty ranges, database failure/retry, refresh pending, and PDF failure do not show stale data under the wrong range.
- Desktop and narrow-mobile layouts remain usable, keyboard actions and visible focus work, and there is no new body-level horizontal overflow.
- `npm test`, `npm run lint`, and `npm run build` pass.
- The checksum of `_PROJECT/data/reporting/cfi_reporting.sqlite` is unchanged before and after tests/implementation.

## Required manual verification

In addition to automated checks:

1. Start the application and open the default report at a representative desktop width.
2. Apply `2026-08-12` through `2026-08-31`; verify the skeleton appears, the displayed values match the regression expectations, and the account-manager metrics do not change.
3. Apply `2026-09-10` through `2026-09-10`; verify the single-day result and selected-period labels.
4. Apply a valid range with no date-filtered rows and verify the truthful empty states plus the unchanged account-manager snapshot.
5. Exercise blank/reversed dates, keyboard submission, visible focus, Refresh, browser Back/Forward, and reduced-motion behavior.
6. Verify the layout around `390×844` and a desktop viewport without introducing body-level overflow.
7. Download a PDF for a non-default range, inspect the rendered page, confirm its filename/range/values, and verify it remains one landscape Letter page.
8. Record only checks actually performed; do not describe lint/build success as visual or interaction verification.

## Implementation references

- `_PROJECT/data/reporting/README.md`
- `_PROJECT/data/reporting/semantic_layer.yaml`
- `_PROJECT/tasks/CFIF-001/refined_task_request.md` for the existing report contract
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`
- `brand-kit/experience.md`: EXP-001 and EXP-003
- `brand-kit/design.md`: DES-001, DES-003, DES-004, DES-006, DES-007, and DES-009
- `brand-kit/patterns.md`: PAT-004
- `brand-kit/theme.css`

Brand adaptation for this task: retain the established data-dense report and application shell, make the filter the clear primary task, use neutral loading placeholders, and add no imagery or identity reconstruction.
