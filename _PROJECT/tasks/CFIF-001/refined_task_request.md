# CFIF-001 — Build the weekly sales summary report

## Objective

Build the first page of the supplied Weekly Sales Meeting Report as a real, data-backed Next.js report under `/reports`. The page must preserve the supplied first-page report template, read the repository-local SQLite snapshot at request time, calculate every displayed total in the application, support an honest preview-only date-range control, and let the user download the same report surface as a one-page landscape Letter PDF.

This task covers only **“Weekly Summary — New Jobs, Change Orders & Account Manager Sales.”** Do not implement the other four pages in the reference HTML.

## Repository starting point

- Framework: Next.js `16.3.5` App Router, React `19.2.8`, strict TypeScript, Tailwind CSS 4.
- The current UI is the unmodified Create Next App starter. There is no report shell, component library, application data layer, or test runner to preserve.
- The reporting database already exists at `_PROJECT/data/reporting/cfi_reporting.sqlite`.
- Read `_PROJECT/data/reporting/README.md` and `_PROJECT/data/reporting/semantic_layer.yaml` before writing SQL or labels. The database is a static extract, not a live warehouse.
- Follow the root `AGENTS.md`, the installed Next.js 16 documentation under `node_modules/next/dist/docs/`, and the repository brand kit.
- Preserve unrelated working-tree changes. Treat `_PROJECT/tasks/CFIF-001/task_request.md` and the supplied mockup as read-only inputs.

## Source-of-truth order

Use these sources in this order:

1. This refined request owns feature scope, data mappings, behavior, states, and acceptance criteria.
2. `_PROJECT/data/reporting/semantic_layer.yaml` owns table/field meaning, date guidance, source coverage, and known semantic limitations.
3. The **first `.page` element only** in `_PROJECT/tasks/CFIF-001/inputs/CFI_Weekly_Sales_Report_Mockup.html` owns the report canvas, visual hierarchy, section order, table density, print proportions, and report-specific color treatment.
4. `brand-kit/` owns the surrounding application shell, accessible interaction behavior, text-logo fallback, and global brand roles.

The mockup contains old values and fields that the current extracts do not fully support. Reproduce its structure and presentation, not its hard-coded records, dates, unsupported meanings, or subsequent pages.

## Required deliverables

Implement:

1. `/reports`
   - A simple report index designed to accept more reports later.
   - Include one real entry, **Weekly Sales Summary**, linking to `/reports/weekly-sales`.
   - Do not invent additional report records or destinations.

2. `/reports/weekly-sales`
   - A request-time-rendered weekly sales report backed by the local SQLite database.
   - Include the preview-only date range, report refresh, PDF download, the six KPI cards, the two activity tables, the account-manager table, a truthful data-coverage callout, and the source footer described below.

3. `/reports/weekly-sales/pdf`
   - A Node.js Route Handler that returns the same report as a single-page landscape Letter PDF attachment.
   - Use the same report component and the same report CSS as the web view; do not maintain a second PDF-only layout or redraw the document with PDF primitives.

4. A small server-only reporting data layer and pure aggregation/formatting helpers.

5. Focused automated tests for mappings, calculations, ordering, inclusion rules, and formatting edge cases.

Do not create or alter reporting tables, views, materialized summaries, CSV files, the loader, the semantic layer, or the brand kit.

## Suggested file organization

Keep route-specific UI near its route and reusable server-only reporting code under `lib/`. This is a suggested organization; equivalent names are acceptable if boundaries remain clear.

```text
app/
  reports/
    layout.tsx
    page.tsx
    weekly-sales/
      page.tsx
      loading.tsx
      error.tsx
      report-toolbar.tsx
      weekly-sales-report.tsx
      weekly-sales-report.module.css
      pdf/
        route.ts
lib/
  reporting/
    database.ts
    weekly-sales.ts
    format.ts
    weekly-sales.test.ts
```

Keep `page.tsx` focused on composition. The database module and report query module must be server-only. Keep the toolbar as the narrow client boundary needed for local date-input state, `router.refresh()`, and download feedback.

## Dependencies and runtime

Add only dependencies that are directly required by this feature:

- `better-sqlite3` plus its TypeScript declarations for read-only SQLite access from the Node.js runtime.
- `puppeteer` for browser-native PDF generation from the report route.
- `vitest` as a development dependency for focused TypeScript unit tests, and an `npm test` script that runs them once.

Do not add an ORM, state library, component library, charting library, date library, or alternate CSS framework.

`better-sqlite3` and Puppeteer code must run only on the server and only in the Node.js runtime. Follow the installed Next.js documentation. In particular, call `connection()` from `next/server` before reading the synchronous embedded database so the report is rendered at request time rather than frozen during prerendering. Next.js already treats `better-sqlite3` and Puppeteer as server-external packages; change `next.config.ts` only if the implemented version demonstrably requires it.

## Data access and refresh behavior

- Open `_PROJECT/data/reporting/cfi_reporting.sqlite` in read-only, file-must-exist mode.
- Resolve the path from the repository/application working directory without exposing it to client code.
- Use parameterized SQL for all values, even though filtering is deferred.
- Close database handles reliably. Do not keep a writable or mutable global connection.
- Fetch all three source datasets for one render, then calculate the display model in TypeScript. SQL may select, order, and return the source rows, but KPI totals, comparison percentages, row-inclusion rules, display labels, and formatted values must be produced in the Next.js application.
- A full browser reload and the visible **Refresh report** action must cause a new request-time database read. The refresh action may call `router.refresh()`; it must expose a pending/disabled state and remain keyboard accessible.
- Do not add an API endpoint that exposes raw tables to the browser.
- If the database is missing, corrupt, or cannot be queried, show an actionable report error with a retry/refresh action. Never substitute mockup values or silently render zeros.

## Date-range preview

The date range is intentionally not connected to data filtering in this iteration.

- Put two visibly labeled native date inputs, **Start date** and **End date**, in the page toolbar outside the report sheet.
- Default them to `2026-09-07` and `2026-09-13`, the nominal period in the two weekly extract filenames.
- Let users edit the controls locally so they can understand the future interaction.
- Do not put the selected dates in the URL, send them to the server, filter a query, recalculate a KPI, change the PDF, or persist them.
- Place the persistent text **“Preview only — changing these dates does not filter the current static extract.”** next to the controls.
- Include a disabled **Apply date range** button labeled as coming soon, or omit an apply action. Do not present an enabled action that appears to filter but has no effect.
- Validate only the local control relationship: if start is after end, show inline text explaining the problem. This validation still must not affect the report.

The report sheet itself must describe the loaded source coverage, not the un-applied preview values.

## Report display model

### Shared formatting rules

- Keep identifiers such as `job_id`, `sales_id`, and `project_class_id` as strings.
- Monetary source units are not confirmed as USD. Format money-like numbers with `en-US` grouping and two decimals in detail tables, but **do not add `$`, `USD`, or another currency code/symbol**. Compact KPI values may use one decimal and `K`/`M`, while their supporting line or accessible label exposes the full value.
- Include **“Source currency not confirmed”** in the report’s coverage callout.
- Format dates for display as `M/D/YYYY`, while keeping ISO dates in queries and tests.
- Use an em dash only for a numeric zero where the template uses a visual zero. Do not convert the literal source value `NONE` to a dash, empty string, or SQL `NULL`.
- Negative amounts use accounting parentheses plus a minus/negative accessible label; do not rely on red alone.
- Percent change formula: `((current / prior) - 1) * 100`. If the comparison denominator is zero, show an em dash and no directional claim.
- Round only for display. Tests and calculations use the stored values and compare monetary aggregates to the cent.

### Header

Within the report sheet, preserve the reference hierarchy:

- Plain-text `CFI Group` identity fallback in the logo area.
- Title: **Weekly Sales Meeting Report**.
- Subtitle: **Weekly Summary — New Jobs, Change Orders & Account Manager Sales**.
- Right-side metadata:
  - **Weekly extracts:** `9/7/2026–9/13/2026`.
  - **Account snapshot:** `9/14/2026`.

Do not extract or publish the base64 logo from the mockup. No authorized original identity asset exists in `brand-kit/assets/index.yaml`. Do not recreate the ring mark. If an authorized original is supplied later, replacement is a separate task.

### Six KPI cards

Render these six cards in this order. All aggregates include all rows in the relevant loaded table.

| Card | Calculation | Supporting content |
| --- | --- | --- |
| New jobs — loaded extract | `COUNT(rpt_new_jobs_opened.job_id)` | Sum of `original_contract`; do not interpret `bd_linked` |
| Change orders — loaded extract | `COUNT(job_cost_change_orders row)` | Sum of `total_income_adj`; count rows where `total_income_adj < 0` as negative adjustments |
| Sales — reporting YTD | Sum `sales_reporting_year_ytd` | Percent change versus summed `sales_prior_year_ytd` |
| Sales — source last 7 days | Sum `sales_last_7_days` | State that the exact seven-day boundary is unavailable |
| Contract value closed — source periods | Sum `contract_value_closed_current` | Compare with summed `contract_value_closed_prior`; do not label either as a particular week |
| Pending contract value | Sum `pending_contract` | Show summed `eoy_projected_sales` as **EOY projected sales**, not “3-mo active pipeline” |

Current snapshot expectations, used as regression assertions:

| Metric | Expected value |
| --- | ---: |
| New jobs / original contract total | `4` / `188125.00` |
| Change orders / net adjustment / negative rows | `6` / `73274.76` / `1` |
| Reporting-year YTD / prior-year YTD / change | `32225435.34` / `26684515.30` / `+20.8%` |
| Source last-seven-days sales | `441271.42` |
| Closed current / closed prior | `229158.00` / `4499642.06` |
| Pending contract / EOY projected sales | `24887792.33` / `63502382.68` |
| Prior-year sales / A/R outstanding | `43978579.86` / `6389155.01` |

### New Jobs Opened table

Heading: **New Jobs Opened — Loaded Extract**. Supporting note: **Opened-date coverage: 9/9/2026–9/10/2026**.

Map columns exactly as follows:

| Display column | Source / rule |
| --- | --- |
| Job | `rpt_new_jobs_opened.job_id` |
| Project | Remove one leading `${job_id} - ` prefix from `job_label`; if the exact prefix is absent, show `job_label` unchanged |
| Customer | `customer_name` |
| AM | `sales_id` |
| City | `${city}, ${state}` |
| Contract | `original_contract` |
| Opened | `opened_date` |
| BD Link | `bd_linked`, preserving literal `NONE` |

Sort by `opened_date` ascending, then `job_id` ascending. Include a total row with the row count and summed `original_contract`.

### Job Cost Change Orders table

Heading: **Job Cost Change Orders — Loaded Extract**. Supporting note: **CO-date coverage: 8/12/2026–9/9/2026**.

| Display column | Source |
| --- | --- |
| Job | `job_id` |
| Project | `job_description` |
| CO # | `co_number` |
| Date | `co_date` |
| Total Inc/Adj | `total_income_adj` |

Sort by `co_date` ascending, then `job_id` ascending, then `co_number` ascending. Include a total row with the row count and net `total_income_adj`.

Do not display `modified_on` as the business date, expand `co_status = 'A'`, or infer meaning from `owner_co_number`.

### Account Manager Summary table

Heading: **Account Manager Summary**. Supporting note: **Account-manager snapshot: 9/14/2026; last-seven-day boundary unavailable**.

Use these columns and labels:

| Group | Display column | Source |
| --- | --- | --- |
| Identity | Account Manager | `project_class_name` |
| Sales | Reporting YTD | `sales_reporting_year_ytd` |
| Sales | Prior YTD | `sales_prior_year_ytd` |
| Sales | Prior Year | `sales_prior_year` |
| Last 7 Days | Sales | `sales_last_7_days` |
| Backlog & Projection | A/R Outstanding | `ar_outstanding` |
| Backlog & Projection | Pending Contract | `pending_contract` |
| Backlog & Projection | EOY Projected Sales | `eoy_projected_sales` |
| Contract Closed | Current Source Period | `contract_value_closed_current` |
| Contract Closed | Prior Source Period | `contract_value_closed_prior` |

The old mockup’s `2024 YTD` and `3-Mo Active Pipeline` labels are not supported by the current schema and must not appear. Do not substitute similarly named fields.

For a compact first page, include an account-manager row when at least one displayed numeric measure is non-zero. This currently produces 10 rows and intentionally excludes the 16 all-zero rows. Keep the `project_class_id = 'NONE'` row and show its source `project_class_name` value; do not rename it to “Unassigned.” Sort non-null `sort_order` ascending, then null sort orders last by `project_class_name`. Add a total row for every numeric column.

### Coverage callout and footer

Retain the reference callout position, but replace the unsupported “AI narrative” with deterministic coverage text calculated from the report model. It must state, in concise plain language:

- the loaded new-job count, total, and actual opened-date coverage;
- the loaded change-order count, net amount, and actual `co_date` coverage;
- that account-manager `sales_last_7_days` is source-pre-aggregated and its exact boundary is unavailable;
- that YTD/calendar and current/prior contract-period definitions are source-provided and not independently confirmed;
- that the source currency is not confirmed; and
- that the page is based on static extracts, not live or exhaustive data.

Do not generate an AI-written summary, claim a BD-linked count, infer A/R aging, or invent operational conclusions.

Use the source-provided footer:

- Left: **Chesapeake Finishing, Inc. · CFI Group — Confidential · Internal Use Only**.
- Right: **Weekly Sales Meeting Report · Page 1 of 1**.

## Visual and interaction specification

### Report canvas

- Reproduce the first-page template as a fixed `11in × 8.5in` landscape Letter report sheet with the reference padding, density, and section order.
- Preserve the recognizable structure: compact header, red-to-orange rule, six equal KPI cards, red uppercase section rules, charcoal table headers, grouped account-manager headers, alternating light rows, emphasized total rows, orange-highlighted comparison columns, coverage callout, and small footer.
- The supplied report mockup is the task-specific visual authority for the report sheet. Its repeated report colors (`#b12029`, `#f28b00`, `#2b2b2b`, and its pale fills) may be defined as locally scoped report CSS custom properties. Do not add them to or present them as official global brand tokens.
- Import `brand-kit/theme.css` through `app/globals.css` and use its `--ce-*` semantic roles for the surrounding reports shell, toolbar, actions, text fallback identity, focus styles, and non-report states.
- Keep the report’s typography offline-safe and compact with the kit’s sans-serif fallback. Do not fetch a new remote font.
- Remove the starter-only `next/font/google` imports from the application layout and bind the app to the kit’s offline-safe font variables; do not retain an unused remote font dependency solely from the scaffold.
- Use square or near-square controls. Avoid rounded dashboard cards, glass effects, gradients beyond the reference report rule, decorative motion, charts, or unrelated imagery.

### Screen behavior

- The toolbar and application shell sit outside the report sheet and do not appear in the PDF.
- On wide screens, center the report sheet on a pale neutral application background.
- Do not reflow or reorder the report document at narrow widths because the downloadable artifact must remain identical. Put the fixed report sheet in a clearly labeled horizontal scroll region while the toolbar wraps into a usable single-column layout. The page body itself must not create uncontrolled horizontal overflow.
- Use a compact on-screen scale only if it does not change layout metrics or the PDF. Users must be able to reach the entire document with standard scrolling/zoom.
- Respect `prefers-reduced-motion`; no report behavior requires animation.

### Accessibility

- Use one page `<h1>` and ordered semantic section headings.
- Use semantic `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<th scope="col">`, `<th scope="row">`, and appropriate grouped-header `colSpan` markup. Provide concise captions for screen readers without duplicating visual headings.
- Date inputs have visible labels and associated help/error text.
- Buttons and links have visible focus states and at least a 44px target size in the toolbar.
- Directional changes and negative values include text or symbols in addition to color.
- Loading, empty, error, refreshing, and PDF-generation states use meaningful text and do not rely only on color or spinners.

## PDF download

- The visible action label is **Download PDF**.
- Implement a `GET` Route Handler at `/reports/weekly-sales/pdf` with `runtime = "nodejs"`.
- Generate the PDF with Puppeteer from `/reports/weekly-sales?print=1` (or an equivalent internal print mode) using the same data loader, report component, and CSS used by the normal page.
- The target URL/path must be fixed by the application. Do not accept an arbitrary user-supplied URL. Use only the current application origin or a documented same-origin base configuration.
- In print mode, render only the report sheet. Wait for the report and fonts to be ready, emulate print media, enable background graphics, and generate one landscape Letter page with CSS page size preferred.
- Add print CSS equivalent to `@page { size: letter landscape; margin: 0; }` and remove screen-only shadow/background/overflow treatments.
- Return `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="cfi-weekly-sales-summary-2026-09-13.pdf"` for the current extract.
- Close the browser in `finally`. If PDF generation fails, return a non-200 response with a useful message and show the user a recoverable download error; never return an HTML error page with a `.pdf` filename.
- The PDF must have the same content order, labels, values, colors, column grouping, and one-page geometry as the on-screen report sheet. A generated-at clock is intentionally omitted so the web and PDF surfaces remain stable.

## Empty, loading, and failure behavior

- While the dynamic route is loading, show **Loading weekly sales report…** in the report area.
- If all three queries succeed but contain no rows, keep the report header and section headings, show explicit empty text per section, render KPI values as zero, and keep the coverage disclaimer. Do not render misleading old values.
- If only one query fails, fail the complete report with the source/table named in a safe error message. Do not mix fresh and fabricated/stale sections.
- `error.tsx` must provide a working retry action.
- Disable **Download PDF** while its request is being initiated and expose status text. Re-enable it on failure.

## Automated tests

Add focused Vitest coverage for pure helpers and the SQLite-backed report-model builder. Tests must use the checked-in database read-only and must not modify or rebuild it.

At minimum, test:

- all six KPI calculations and the current expected values listed above;
- percent comparison and the zero-denominator case;
- new-job project-label prefix removal and fallback behavior;
- `NONE` preservation;
- negative adjustment formatting and negative-row count;
- account-manager non-zero inclusion rule, 10-row current result, `sort_order` ordering, and total row values;
- stable new-job and change-order ordering;
- exact coverage dates and the fact that `modified_on` is not substituted for `co_date`;
- currency formatting does not introduce `$` or a currency code;
- error behavior for a missing database path through an injected/test-only path parameter.

Do not write fragile tests against every CSS class. Validate visual output through rendering as described below.

## Validation and acceptance criteria

The task is complete only when all of the following are true.

### Routes and behavior

- `/reports` lists and links to the weekly sales report without invented reports.
- `/reports/weekly-sales` loads successfully, queries all three SQLite tables at request time, and renders the required first-page sections.
- Editing the preview dates changes only the input state and is clearly disclosed as non-functional.
- **Refresh report** performs a new server render and database read.
- No value from the old mockup is used as runtime report data.
- No new database table/view is created and the SQLite file remains byte-for-byte unchanged after app/test execution.
- Missing/corrupt database, loading, empty, refresh-pending, and PDF-failure behavior is truthful and recoverable.

### Data correctness

- Every column and KPI follows the mapping and formulas in this request.
- Current snapshot values match the regression expectations to the cent.
- The report distinguishes actual field coverage, nominal filename period, and the unavailable last-seven-day boundary.
- `NONE`, unknown currency, unexpanded status codes, and candidate relationships are not silently reinterpreted.
- The account-manager table shows the 10 current non-zero rows and correct totals; all-zero rows are excluded only by the documented display rule.

### Visual and PDF fidelity

- The on-screen report preserves the first-page mockup’s landscape Letter geometry, information order, compact hierarchy, six-card row, three tables, grouped headers, totals, callout, and footer.
- The only expected identity deviation is the disclosed plain-text `CFI Group` fallback; no logo or photography is extracted from the mockup or brand evidence.
- The PDF endpoint downloads a valid, one-page, landscape Letter PDF with background colors and the same report component/layout as the web report.
- Render the downloaded PDF to an image and compare it with the normal report sheet at the same effective page size. Correct clipping, unexpected wrapping, missing backgrounds, font substitution problems, extra pages, or mismatched values before handoff.
- At desktop width (at least `1440×1000`), the whole sheet is centered and usable. At a narrow mobile viewport (about `390×844`), the toolbar wraps and the report is reachable through its bounded horizontal scroll region without body-level overflow.
- Exercise keyboard focus for date inputs, refresh, report link, and PDF download. Verify visible focus and meaningful status/error text.

### Required commands

Run and report the actual results of:

```bash
npm test
npm run lint
npm run build
sqlite3 -readonly _PROJECT/data/reporting/cfi_reporting.sqlite "PRAGMA integrity_check;"
```

Also run the production server long enough to exercise both report routes and save/download the PDF. Verify the PDF response headers, one-page count, landscape Letter dimensions, and rendered appearance. Do not claim a visual, keyboard, refresh, or PDF pass unless it was actually exercised.

## Out of scope

- Functional date filtering, presets, query parameters, saved filters, or date-dependent recalculation.
- Live warehouse/database integration, scheduled refresh, uploads, or mutation of the local reporting snapshot.
- Authentication, authorization, report subscriptions, email, sharing, or audit history.
- Other pages from the five-page mockup.
- AI-generated narrative or natural-language querying.
- Charts, drill-downs, sorting controls, pagination, exports other than PDF, or a generic report-builder framework.
- Defining `bd_linked`, `co_status`, fiscal-calendar rules, source currency, the exact last-seven-day boundary, or formulas not established in the semantic layer.
- Extracting the embedded logo from the mockup, recreating the ring mark, or changing `brand-kit/`.

## Implementation constraints

- Keep strict TypeScript; do not use `any` or unsafe assertions to silence errors.
- Keep Server Components as the default and use `"use client"` only for the toolbar/error boundary behavior that requires browser state or APIs.
- Keep source data and database access out of Client Components and browser bundles.
- Use `next/link` for internal navigation and the Metadata API for meaningful report titles/descriptions.
- Preserve the Tailwind 4 import. Use a CSS module or similarly scoped CSS for the exact report document; use global CSS only for brand-theme import, reset/base rules, and truly shared application behavior.
- Do not alter the report database or build outputs during `npm run build`.
- Do not hard-code current source rows into React. Constants for stable labels, mappings, and documented source coverage are acceptable; all records and aggregates must come from SQLite.

## Handoff

Summarize:

- routes and files created;
- dependencies added and why;
- the data mappings, formulas, row-inclusion rule, and current regression totals;
- how request-time refresh and PDF generation work;
- brand basis and task-local report adaptations;
- automated, build, browser, keyboard, responsive, and PDF checks actually performed;
- any remaining deployment/runtime requirement for Puppeteer; and
- the intentionally deferred date filtering plus unresolved source semantics.

Brand basis for this task: `EXP-001`, `EXP-003`, `DES-001`, `DES-003`, `DES-006`, `DES-007`, `DES-008`, `DES-009`, `PAT-004`, `brand-kit/theme.css`, `brand-kit/assets/index.yaml`, and the first page of the supplied report mockup. The report-specific red/orange document treatment is a scoped adaptation from the approved mockup; it must not be promoted into the canonical kit.
