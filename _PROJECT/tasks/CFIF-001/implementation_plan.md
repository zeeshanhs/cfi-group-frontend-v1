# CFIF-001 — Implementation plan

## Outcome

Implement the data-backed Weekly Sales Summary defined in `refined_task_request.md` as:

- a scalable reports index at `/reports`;
- a request-time-rendered report at `/reports/weekly-sales`;
- a one-page landscape Letter PDF download at `/reports/weekly-sales/pdf`;
- a typed, read-only SQLite reporting layer with pure aggregation and formatting logic; and
- focused automated, browser, accessibility, responsive, and PDF verification.

This plan is implementation-only. It does not change the task scope, reporting schema, source extracts, semantic layer, or brand kit.

## Source references

The implementer must keep these open while working:

- `_PROJECT/tasks/CFIF-001/refined_task_request.md` — functional and acceptance contract.
- `_PROJECT/tasks/CFIF-001/inputs/CFI_Weekly_Sales_Report_Mockup.html` — first `.page` only; report layout reference.
- `_PROJECT/data/reporting/README.md` — database operation and coverage guidance.
- `_PROJECT/data/reporting/semantic_layer.yaml` — field meanings, date rules, and semantic limitations.
- `brand-kit/kit.yaml`, `experience.md`, `design.md`, `patterns.md`, `theme.css`, and `assets/index.yaml` — surrounding application and identity constraints.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md` — request-time synchronous database access.
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — server/client boundaries.
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — PDF endpoint.
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverExternalPackages.md` — native server dependencies.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` — async `searchParams` in Next.js 16.

## Decisions fixed by this plan

1. **Server-first architecture.** Pages, data loading, aggregation, report markup, and the PDF route remain server-side. Only the toolbar and route error boundary are Client Components.
2. **One report model and one renderer.** The web view and PDF print mode consume the same `WeeklySalesReportModel` and `WeeklySalesReport` component. PDF generation must not reproduce the report in a second template.
3. **Request-time data.** `getWeeklySalesReport()` calls `connection()` before opening SQLite. No report query or result is cached or prerendered.
4. **Read-only database.** Open SQLite with `readonly: true` and `fileMustExist: true`, run explicit `SELECT` statements, and close the handle in `finally`.
5. **Pure calculations.** SQL selects source rows; TypeScript owns sums, percentage comparisons, inclusion rules, coverage derivation, display labels, and formatting.
6. **Cent-safe summation.** Convert each money-like value to integer cents before summing, then convert the aggregate back for display. Do not depend on exact binary floating-point addition.
7. **Preview-only dates.** Date inputs use local client state and never enter `searchParams`, requests, SQL, report headings, or PDF generation.
8. **Fixed report geometry.** The report sheet remains `11in × 8.5in` on every viewport. Mobile uses a bounded horizontal scroller; it does not reflow the document.
9. **Safe identity fallback.** Render plain text `CFI Group`; do not decode the mockup logo or recreate the ring mark.
10. **Task-local report palette.** The report sheet may use the mockup’s scoped red/orange/charcoal variables. The surrounding shell and controls use canonical `--ce-*` roles imported from `brand-kit/theme.css`.
11. **Browser-native PDF.** Puppeteer opens the same report route in print mode, waits for a report-ready marker and fonts, then prints with backgrounds to one landscape Letter page.
12. **Fixed internal render target.** The PDF handler appends only the application-owned `/reports/weekly-sales?print=1` path. It never accepts a URL or path from the caller.

## Planned file changes

| Path | Change |
| --- | --- |
| `package.json` | Add `test` script and required runtime/development dependencies. |
| `package-lock.json` | Update through npm only. |
| `app/layout.tsx` | Remove starter Google fonts; add truthful application metadata and offline-safe body classes. |
| `app/globals.css` | Import the canonical theme, replace starter/dark-mode defaults, and add shared shell/control/focus/print helpers only. |
| `app/reports/layout.tsx` | Add the restrained reports shell and text identity/navigation. |
| `app/reports/page.tsx` | Add the future-friendly report index with one real report link. |
| `app/reports/weekly-sales/page.tsx` | Request data, handle print mode, and compose toolbar plus shared report. |
| `app/reports/weekly-sales/loading.tsx` | Add the route loading message. |
| `app/reports/weekly-sales/error.tsx` | Add a client error boundary with a retry action. |
| `app/reports/weekly-sales/report-toolbar.tsx` | Add preview dates, validation, refresh, PDF download, and status feedback. |
| `app/reports/weekly-sales/weekly-sales-report.tsx` | Add semantic report markup shared by screen and PDF. |
| `app/reports/weekly-sales/weekly-sales-report.module.css` | Add fixed report, table, screen-scroll, and print styling. |
| `app/reports/weekly-sales/pdf/route.ts` | Add Node.js PDF generation and attachment response. |
| `lib/reporting/database.ts` | Add path resolution and read-only database opening. |
| `lib/reporting/weekly-sales.ts` | Add raw row types, typed queries, safe query errors, request-time orchestration, and report-model construction. |
| `lib/reporting/format.ts` | Add pure date, money, compact-number, negative, zero, and percentage helpers. |
| `lib/reporting/weekly-sales.test.ts` | Add pure and checked-in-database regression coverage. |
| `vitest.config.mts` | Configure Node-environment TypeScript tests and `@/*` resolution if package defaults are insufficient. |
| `README.md` | Add a concise local PDF runtime note, including `REPORT_RENDER_ORIGIN` for non-local environments. |
| `_PROJECT/tasks/CFIF-001/evidence/` | Save final desktop, mobile, and rendered-PDF verification images when validation is performed. |

Do not change `next.config.ts` unless a real build failure proves an explicit external-package entry is needed; Next.js 16 already externalizes `better-sqlite3` and Puppeteer.

## Phase 1 — Establish the baseline and dependencies

1. Inspect `git status --short` and preserve the existing user edit to `_PROJECT/tasks/CFIF-001/task_request.md` plus all unrelated changes.
2. Record the database checksum before implementation:

   ```bash
   shasum -a 256 _PROJECT/data/reporting/cfi_reporting.sqlite
   ```

3. Run the current `npm run lint` and `npm run build` once to distinguish baseline failures from implementation regressions.
4. Install only the approved dependencies with npm:

   ```bash
   npm install better-sqlite3 puppeteer
   npm install --save-dev @types/better-sqlite3 vitest
   ```

5. Add `"test": "vitest run"` to `package.json`.
6. Confirm Puppeteer’s managed browser installed successfully. If installation is intentionally configured to skip browser download, stop PDF work until an executable path is documented and available; do not silently fall back to a different PDF layout.

**Phase exit:** dependency tree is intentional, lockfile is npm-generated, baseline issues are recorded, and the database checksum is saved for the final comparison.

## Phase 2 — Build the typed reporting model

### 2.1 Define source and display types

In `lib/reporting/weekly-sales.ts`, define explicit types for:

- `AccountManagerRow` with every selected account-manager column;
- `ChangeOrderRow` with the five displayed fields plus fields needed for coverage/validation;
- `NewJobRow` with every displayed field;
- `WeeklySalesSourceRows` containing the three raw arrays;
- KPI, coverage, table-row, table-total, and `WeeklySalesReportModel` types; and
- a `ReportingQueryError` carrying a safe table identifier without leaking SQL or full rows.

Avoid `any`. Treat `better-sqlite3` results as `unknown` until validated/narrowed into the declared row shapes. Select explicit columns rather than `SELECT *` so schema drift fails visibly.

### 2.2 Add database path resolution

In `lib/reporting/database.ts`:

- resolve the default path from `process.cwd()` to `_PROJECT/data/reporting/cfi_reporting.sqlite`;
- accept an optional absolute/test path parameter for the missing-file test;
- reject a relative override rather than resolving it unpredictably;
- open with `{ readonly: true, fileMustExist: true }`; and
- expose a small helper that guarantees `close()` in `finally` around a callback.

Do not expose this module to Client Components.

### 2.3 Query source rows

Create one typed query function per table. Each query must:

- use an explicit column list;
- wrap failures as `ReportingQueryError("<table>")`;
- avoid interpreting `NONE`, `co_status`, `owner_co_number`, or `modified_on`;
- avoid date predicates because the preview range is non-functional; and
- return source values without presentation formatting.

Query order may be deterministic in SQL, but apply and test the documented ordering again in the pure model builder so its contract does not depend on SQLite’s incidental row order.

### 2.4 Build pure helpers

In `lib/reporting/format.ts` and pure portions of `weekly-sales.ts`, implement:

- `sumMoney(values)` using integer cents;
- `roundToCents(value)`;
- `calculatePercentChange(current, prior)` returning `null` for a zero denominator;
- ISO-date parsing/formatting that avoids timezone shifts by parsing the date components rather than `new Date("YYYY-MM-DD")` in local time;
- full amount formatting with grouping and two decimals but no currency symbol/code;
- compact KPI formatting with one decimal `K`/`M` and an accessible full-value string;
- accounting-style negative formatting plus a text/ARIA description;
- numeric-zero-to-em-dash formatting without altering strings such as `NONE`;
- `stripJobIdPrefix(jobId, jobLabel)` using only the exact `${jobId} - ` prefix; and
- min/max coverage derivation from the actual `opened_date` and `co_date` values.

### 2.5 Build the report model

Implement `buildWeeklySalesReportModel(sourceRows)` as a pure function:

- calculate the six KPI cards exactly as specified;
- sort new jobs by `opened_date`, then `job_id`;
- sort change orders by `co_date`, `job_id`, then `co_number`;
- count negative change-order rows using `total_income_adj < 0`;
- select account-manager rows where at least one displayed measure is non-zero;
- preserve the `NONE` identifier/name values;
- sort non-null `sort_order` first and then null values by `project_class_name`;
- calculate all detail-table totals;
- derive actual date coverage from rows;
- store documented nominal extract and snapshot dates as named constants, separate from derived coverage; and
- produce structured facts for the deterministic coverage callout rather than concatenating business conclusions in the component.

Implement `getWeeklySalesReport()` as the request-time wrapper:

1. `await connection()`;
2. open the read-only database;
3. query all three tables;
4. close the handle;
5. pass the rows to the pure model builder; and
6. return the model.

**Phase exit:** the report model can be built without React, returns the documented values, and cannot mutate SQLite.

## Phase 3 — Add tests before UI duplication

1. Configure Vitest for the Node environment and repository alias. Do not add a browser test framework.
2. Add small synthetic fixtures for pure edge cases:
   - prior value zero;
   - exact and non-matching job-label prefixes;
   - negative, zero, and positive money values;
   - literal `NONE`;
   - null `sort_order`; and
   - empty arrays.
3. Add a read-only integration test against the checked-in database for:
   - six KPI values;
   - all documented totals to the cent;
   - 10 included account-manager rows;
   - stable row order;
   - actual coverage ranges;
   - one negative adjustment;
   - `NONE` preservation; and
   - absence of a currency symbol/code in formatting.
4. Test the missing-database path through the injected path parameter and assert an actionable error.
5. Capture the database checksum before and after `npm test`; fail the implementation review if it changes.

**Phase exit:** `npm test` passes and the model is verified independently of layout work.

## Phase 4 — Establish the application shell and brand binding

1. In `app/globals.css`:
   - keep `@import "tailwindcss"`;
   - import `../brand-kit/theme.css` through the supported CSS pipeline;
   - map application background, text, font, border, and focus behavior to `--ce-*` roles;
   - remove the scaffold’s automatic dark-mode override because the kit defines local inverse surfaces, not a full dark theme; and
   - retain global CSS only for reset/base, shell primitives, focus, and print-wide rules.
2. In `app/layout.tsx`:
   - remove `next/font/google` and the Geist variables;
   - use the offline-safe kit font stack;
   - replace starter metadata with `CFI Group Reports` and a truthful description; and
   - retain semantic `html`/`body` structure.
3. Add `app/reports/layout.tsx` with:
   - plain-text `CFI Group` linked to `/reports`;
   - a restrained reports label/navigation region;
   - one content boundary using kit gutters/max width; and
   - a print-hidden shell marker.
4. Add `app/reports/page.tsx` with one text-led report entry linking to `/reports/weekly-sales`. Avoid image cards, fake status labels, or placeholder reports.
5. Add route-specific metadata for the reports index and weekly report.

**Phase exit:** `/reports` is complete, branded with approved primitives, keyboard reachable, and contains no unimplemented destinations.

## Phase 5 — Implement the shared report renderer

### 5.1 Compose the server page

In `app/reports/weekly-sales/page.tsx`:

- keep the page a Server Component;
- await Next.js 16 `searchParams` only to read the application-owned `print=1` mode;
- call `getWeeklySalesReport()` once;
- render `ReportToolbar` only in normal screen mode;
- render the same `WeeklySalesReport` in normal and print modes; and
- mark the completed report with `data-report-ready="true"` for PDF synchronization.

Do not read date preview values from `searchParams`.

### 5.2 Create semantic report markup

In `weekly-sales-report.tsx`:

- render the title as the page’s only `<h1>`;
- use `<section>` plus ordered `<h2>` headings;
- render the six KPI cards in the specified order;
- implement all three tables with `<caption>`, grouped header `colSpan`, column scopes, row scopes, `<tfoot>`, and numeric alignment;
- provide full-value accessible text for compact KPI numbers;
- retain `NONE` visibly;
- add text alternatives for negative/directional values;
- render an explicit empty row/message in each empty table while keeping totals at zero; and
- compose the deterministic coverage callout from model facts only.

Keep the data model free of JSX and the component free of business calculations.

### 5.3 Implement report CSS

In the CSS module:

- define locally scoped report variables for `#b12029`, `#f28b00`, `#2b2b2b`, pale row/total/callout fills, and report-only spacing;
- size the sheet at `11in × 8.5in` with the mockup’s approximate `0.4in 0.5in 0.5in` padding;
- reproduce the compact header, six-column KPI grid, section rules, grouped table headers, alternating rows, total rows, highlighted comparison columns, callout, and footer;
- use tabular numerals and controlled `white-space`/column widths to preserve one-page fit;
- avoid truncating essential table values; shorten only the labels already fixed in the refined request;
- position the footer without overlapping the callout or table;
- create a screen wrapper with bounded horizontal overflow and an accessible label;
- remove sheet shadow and shell-only decoration under print media; and
- set `@page { size: letter landscape; margin: 0; }` in a global print rule if CSS-module scoping prevents a valid at-rule.

### 5.4 Perform the first visual checkpoint

Before adding PDF generation, render `/reports/weekly-sales` at `1440×1000` and compare it with the first page of the mockup. Correct:

- hierarchy and horizontal alignment;
- six-card density;
- table header grouping and column fit;
- row height and total emphasis;
- callout/footer separation; and
- any vertical overflow beyond `8.5in`.

This is the first bounded visual correction loop. Do not continue to PDF while the base sheet clips or exceeds one page.

**Phase exit:** the data-backed web report is visually stable, semantic, and one-page at its intrinsic Letter size.

## Phase 6 — Add toolbar interactions and route states

### 6.1 Toolbar client boundary

Implement `report-toolbar.tsx` with:

- local state defaults `2026-09-07` and `2026-09-13`;
- visible `Start date` and `End date` labels;
- persistent preview-only disclosure;
- local comparison validation and an associated inline error;
- either no apply control or a disabled `Apply date range — coming soon` control;
- `useTransition` plus `router.refresh()` for **Refresh report**;
- disabled/pending text while refresh is in progress; and
- a PDF download function that fetches the fixed endpoint, checks status and `Content-Type`, creates a Blob URL, triggers the prescribed filename, revokes the URL, and exposes pending/success/error text in an `aria-live` region.

The toolbar must not receive or serialize the report data.

### 6.2 Loading and error states

- `loading.tsx` shows `Loading weekly sales report…` within the report content region.
- `error.tsx` is a narrow Client Component that states the report could not be loaded and calls `reset()` from a visible **Try again** button.
- Query failures name only the affected logical source/table and a safe recovery action.
- PDF errors stay in the toolbar and do not replace the already rendered report.

### 6.3 Responsive and keyboard checkpoint

At approximately `390×844`:

- stack/wrap the toolbar;
- keep all labels and messages readable;
- keep the report in its bounded horizontal scroller;
- verify the document remains fixed-size; and
- verify no body-level horizontal overflow.

Keyboard-test the reports link, both dates, refresh, disabled apply control if present, PDF download, and retry state. Confirm visible focus and at least 44px toolbar targets.

**Phase exit:** all declared screen states and interactions work without altering report data or geometry.

## Phase 7 — Implement same-layout PDF generation

### 7.1 Configure the internal render origin

Use a helper in `pdf/route.ts` with this policy:

- read `REPORT_RENDER_ORIGIN` when set;
- otherwise allow a fallback only for `localhost` or `127.0.0.1` using the current local server port;
- require an `http:` or `https:` origin;
- strip any path/query from the configured value;
- append the fixed `/reports/weekly-sales?print=1` path; and
- return a clear `503` when a non-local environment lacks a valid configured origin.

Document `REPORT_RENDER_ORIGIN` in `README.md`. Never accept a render URL from route query parameters, form data, or headers.

### 7.2 Generate and return the PDF

In the Node.js `GET` handler:

1. launch Puppeteer’s managed browser;
2. create a page and set print media before capture;
3. navigate to the fixed print URL with a bounded timeout;
4. wait for `[data-report-ready="true"]` and `document.fonts.ready`;
5. call `page.pdf` with `format: "letter"`, `landscape: true`, `printBackground: true`, and `preferCSSPageSize: true`;
6. verify the returned buffer is non-empty;
7. close the page/browser in `finally`; and
8. return the buffer with `application/pdf`, `Content-Disposition: attachment`, no-store caching, and filename `cfi-weekly-sales-summary-2026-09-13.pdf`.

Map timeout, browser-launch, render-page, and PDF failures to concise non-200 text responses. Do not expose stack traces, local paths, or SQL.

### 7.3 PDF checkpoint

- Start the production server with a valid `REPORT_RENDER_ORIGIN`.
- Download through the visible button, not only by opening the endpoint manually.
- Confirm the response begins with `%PDF`, has the required headers, and is not an HTML error body.
- Inspect with `pdfinfo`; require exactly one `11 × 8.5in` landscape page.
- Render the PDF page with Poppler and compare it to the on-screen report at the same effective size.
- Correct wrapping, clipping, missing backgrounds, unexpected margins, extra pages, and font mismatches in the shared component/CSS, not through a separate PDF override unless the override only removes screen chrome.

**Phase exit:** the button downloads a valid one-page PDF matching the web report content and layout.

## Phase 8 — Final verification and evidence

### 8.1 Automated and integrity checks

Run from the repository root:

```bash
npm test
npm run lint
npm run build
sqlite3 -readonly _PROJECT/data/reporting/cfi_reporting.sqlite "PRAGMA integrity_check;"
shasum -a 256 _PROJECT/data/reporting/cfi_reporting.sqlite
```

Compare the final checksum with the Phase 1 checksum. Investigate any difference; application work must not mutate the database.

### 8.2 Production behavior checks

Run the built application with a fixed origin, for example:

```bash
REPORT_RENDER_ORIGIN=http://127.0.0.1:3000 npm run start
```

Exercise:

- `/reports` navigation;
- `/reports/weekly-sales` normal rendering;
- browser reload and **Refresh report**;
- local-only date edits and invalid date order;
- proof that date changes do not alter the report or PDF;
- PDF success and a deliberate recoverable PDF failure if it can be induced safely;
- loading/error UI where practical;
- desktop and mobile layouts;
- keyboard order and focus visibility; and
- empty-data rendering using a temporary read-only test database, never by modifying the checked-in database.

### 8.3 Visual evidence

Save concise evidence under `_PROJECT/tasks/CFIF-001/evidence/`:

- `weekly-sales-desktop.png` at or near `1440×1000`;
- `weekly-sales-mobile.png` at or near `390×844` showing the toolbar and bounded report scroller; and
- `weekly-sales-pdf-page-1.png` rendered from the downloaded PDF.

Do not copy brand-kit captures, the base64 mockup logo, or sensitive database exports into evidence.

### 8.4 Final review

Review the implementation against every acceptance criterion in `refined_task_request.md` and check separately:

- data correctness and semantic honesty;
- brand fidelity and scoped report-template adaptation;
- asset provenance;
- interaction/accessibility behavior;
- responsive behavior;
- web/PDF component parity;
- server/client separation; and
- verification claims versus checks actually performed.

Apply one bounded correction pass for material defects, then rerun the affected checks.

## Requirement-to-phase traceability

| Requirement | Primary phase(s) |
| --- | --- |
| Future-friendly reports area | 4 |
| Read all three tables at request time | 2, 5 |
| Six KPIs and three report sections | 2, 5 |
| Exact mappings, totals, coverage, and caveats | 2, 3, 5 |
| Preview-only date range | 6 |
| Refresh from SQLite | 2, 6 |
| Loading, empty, query error, and PDF error states | 2, 5, 6, 7 |
| Shared web/PDF layout | 5, 7 |
| One-page landscape Letter PDF | 7, 8 |
| Responsive shell with fixed report canvas | 5, 6, 8 |
| Semantic tables, focus, keyboard, status text | 5, 6, 8 |
| No database/schema/source mutation | 1, 2, 3, 8 |
| No unsupported identity or business claims | 4, 5, 8 |

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Puppeteer browser is unavailable in the execution/deployment environment | Use the managed Puppeteer browser by default; document `REPORT_RENDER_ORIGIN`; fail clearly rather than generating a different artifact. Call out any deployment-specific executable requirement in handoff. |
| PDF route could be abused to browse arbitrary URLs | Use only a validated configured/local origin plus a fixed application path; accept no caller-controlled render target. |
| Longer truthful labels cause a second PDF page | Render early, use the reference’s compact table scale and fixed column widths, and tune shared CSS before PDF work. Do not remove required caveats or data to force fit. |
| SQLite `REAL` aggregation differs by floating-point fractions | Sum integer cents in TypeScript and assert cent-rounded regression values. |
| Next.js prerenders the local snapshot during build | Call `connection()` before synchronous database access and verify a refresh rereads the file. |
| Print CSS diverges from screen CSS | Share the component and base module; print rules remove only shell, shadow, overflow, and screen-only decoration. |
| Mobile design pressure conflicts with exact report geometry | Make only the shell/toolbar responsive and keep the document in a labeled horizontal scroller. |
| Mockup logo appears reusable because it is embedded | Follow the asset register: use the text fallback and do not extract/reconstruct identity artwork. |
| Current source terminology invites unsupported labels | Use the refined mapping, preserve `NONE`, omit unsupported `2024 YTD`, rename pipeline to `EOY Projected Sales`, and keep visible coverage caveats. |

## Brand application record

- **Preserve:** direct operational voice, restrained red/neutral application shell, clear sans-serif hierarchy, square geometry, strong alignment, visible focus, and literal action labels.
- **Adapt:** the approved report mockup’s red/orange/charcoal palette and dense Letter layout are locally scoped to the report canvas; mobile responsiveness applies to the shell and scroll container rather than reflowing the printable document.
- **Extend:** loading/error/pending states, keyboard behavior, bounded horizontal scrolling, and PDF feedback are accessible application behaviors not established by the static mockup.
- **Exclude:** reference-only logo/photography, a recreated ring mark, decorative marketing imagery, fake live behavior, AI narrative, gradients outside the supplied report rule, and a site-wide dark theme.
- **Rules applied:** `EXP-001`, `EXP-003`, `DES-001`, `DES-003`, `DES-006`, `DES-007`, `DES-008`, `DES-009`, `PAT-004`, and `brand-kit/theme.css`.
- **Known gap:** the brand kit is a working partial kit with no authorized original logo and no observed mobile application. The text identity and narrow-screen scrolling behavior remain disclosed task-local fallbacks.

## Completion handoff

The final implementation handoff must report:

- changed routes and files;
- dependencies and PDF runtime configuration;
- data formulas, mapping decisions, and current regression totals;
- request-time refresh behavior;
- date-preview limitation;
- browser, responsive, keyboard, automated, build, database-integrity, and PDF checks actually run;
- evidence file paths;
- database checksum comparison;
- brand basis and report-specific adaptations; and
- any unresolved Puppeteer deployment dependency or semantic limitation.

Do not claim that the date filter works, the data is live/exhaustive, the currency is USD, the embedded logo is authorized, or the PDF was visually verified unless those facts are actually established.
