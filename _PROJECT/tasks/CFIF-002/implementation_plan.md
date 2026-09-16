# CFIF-002 — Implementation plan

## Outcome

Implement the date-filtering behavior defined in `refined_task_request.md` so that `/reports/weekly-sales`:

- treats the URL as the applied date-range state;
- filters new jobs by `opened_date` and change orders by `co_date`, inclusively;
- leaves account-manager metrics explicitly tied to the unfiltered 9/14/2026 snapshot;
- performs a new read of the local SQLite file for every apply and refresh;
- replaces stale report values with an accessible report-shaped skeleton while a request is pending; and
- generates the existing one-page PDF for the same applied range as the web report.

This is an implementation plan only. It does not alter the task request, reporting schema, source extracts, semantic layer, database, or brand kit.

## Source references

Keep these sources available while implementing:

- `_PROJECT/tasks/CFIF-002/refined_task_request.md` — functional and acceptance contract.
- `_PROJECT/tasks/CFIF-001/refined_task_request.md` — existing report behavior that remains in force unless CFIF-002 changes it.
- `_PROJECT/data/reporting/README.md` — database operation and source-coverage limitations.
- `_PROJECT/data/reporting/semantic_layer.yaml` — authoritative date fields and account-summary caveats.
- `brand-kit/kit.yaml`, `experience.md`, `design.md`, `patterns.md`, and `theme.css` — working brand rules for controls, feedback, layout, and wording.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` — async `searchParams` behavior.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md` — route loading and Suspense behavior.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md` — request-time synchronous SQLite access.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` — `push`, `refresh`, history, and client-cache behavior.
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` — dynamic rendering and non-`fetch` cache boundaries for the current configuration.
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — PDF endpoint behavior.

## Decisions fixed by this plan

1. **One shared date contract.** Add a dependency-free date-range module that can be imported by Server and Client Components. It owns defaults, strict date-only validation, query-parameter resolution, equality checks, and canonical query-string creation. It must not import `better-sqlite3`, `next/server`, or any server-only module.
2. **URL-backed applied state.** `start` and `end` query parameters represent the applied filter. Missing both means the default range; missing one, repeated values, malformed values, impossible dates, or reversed dates are invalid.
3. **Explicit apply, not live filtering.** The toolbar keeps draft input state and navigates only when the user submits a changed, valid range. `router.push(..., { scroll: false })` preserves browser history and scroll position.
4. **Server-side filtering.** SQLite receives inclusive parameterized predicates for new jobs and change orders. The browser never receives raw source rows or performs business filtering.
5. **Snapshot sales remain unfiltered.** Account-manager rows and all four account-derived KPI cards are loaded from the full snapshot for every valid range. The interface and report state this limitation directly.
6. **Fresh reads.** Retain `connection()` before database work, mark the page `dynamic = "force-dynamic"`, avoid every application-level cache wrapper, and open/close a read-only SQLite connection for each report generation.
7. **Full coverage is separate from filtered rows.** Query full-table `MIN`/`MAX` coverage for `opened_date` and `co_date` during the same database open. Filtered-row coverage must never replace source coverage in the disclosure.
8. **Server-rendered report, narrow client control boundary.** Report loading, aggregation, markup, and print rendering remain Server Components. A small Client Component owns the draft controls, transitions, download feedback, and immediate substitution of the skeleton for stale report content.
9. **One skeleton component.** `loading.tsx`, client navigation/refresh, and any local Suspense fallback reuse the same report-shaped skeleton. The skeleton never carries `data-report-ready="true"`.
10. **Same model and renderer for PDF.** The PDF route validates the range, builds a fixed internal print URL, and lets the normal page perform a fresh database read. It does not add a second report implementation.
11. **No artificial latency.** The pending experience is implemented correctly but no sleep is added to make it easier to observe.
12. **No new dependency.** Existing Next.js, React, `better-sqlite3`, Puppeteer, Vitest, and CSS are sufficient.

## Planned file changes

| Path | Change |
| --- | --- |
| `lib/reporting/date-range.ts` | Add the shared `DateRange` type, default range, strict calendar validation, search-parameter resolver, error codes/messages, equality helper, and canonical query-string builder. |
| `lib/reporting/date-range.test.ts` | Test defaults, valid ranges, impossible dates, missing/repeated params, reversed ranges, equality, and canonical serialization. |
| `lib/reporting/weekly-sales.ts` | Accept a validated range; parameterize filtered queries; query full source coverage; update source/model types and selected-period metadata; preserve request-time fresh reads. |
| `lib/reporting/weekly-sales.test.ts` | Update default expectations and add alternate, single-day, empty, coverage, snapshot-invariance, and temporary-database fresh-read tests. |
| `app/reports/weekly-sales/page.tsx` | Resolve async query parameters, reject invalid requests before data access, force dynamic rendering, separate the async report result, branch normal/print composition, and provide a keyed Suspense boundary. |
| `app/reports/weekly-sales/report-experience.tsx` | Add the narrow Client Component that owns the toolbar draft, navigation/refresh transitions, PDF state, and pending report-area substitution. Filename may differ if the same boundary is kept clear. |
| `app/reports/weekly-sales/report-toolbar.tsx` | Convert the preview controls into a prop-driven form or fold this markup into `report-experience.tsx`; remove preview-only behavior and preserve accessible local validation. |
| `app/reports/weekly-sales/report-skeleton.tsx` | Add the single report-shaped loading placeholder used by all loading paths. |
| `app/reports/weekly-sales/loading.tsx` | Render the shared skeleton for direct route loads. |
| `app/reports/weekly-sales/report-load-error.tsx` | Reuse the existing retry behavior inside the report result boundary; adjust copy only if necessary for the selected range. |
| `app/reports/weekly-sales/weekly-sales-report.tsx` | Render selected-period labels, range-aware empty text, full source coverage, snapshot scope, and unchanged account-manager values. |
| `app/reports/weekly-sales/weekly-sales-report.module.css` | Restyle the toolbar action hierarchy and add stable skeleton, pending, responsive, and reduced-motion rules. |
| `app/reports/weekly-sales/weekly-sales-report.test.tsx` | Update fixtures/assertions for applied range, source coverage, range-specific empty messages, and disclosure copy. |
| `app/reports/weekly-sales/pdf/pdf-request.ts` | Add pure request parsing, fixed internal render-URL construction, and range-aware filename helpers so PDF security behavior is directly testable. Filename/location may differ. |
| `app/reports/weekly-sales/pdf/pdf-request.test.ts` | Test valid/default/invalid parameters, fixed path/origin behavior, encoded dates, `print=1`, and filename generation. |
| `app/reports/weekly-sales/pdf/route.ts` | Consume the shared range and PDF helpers, return `400` for invalid input, retain origin validation/no-store responses, and render the selected range. |
| `README.md` | Update the internal PDF-path description to include validated `start`/`end` parameters if the current fixed-path note is no longer accurate. |
| `_PROJECT/tasks/CFIF-002/evidence/` | Store final desktop, mobile, and non-default PDF verification images only when those checks are actually performed. |

Do not change `package.json`, `package-lock.json`, `next.config.ts`, `brand-kit/`, `_PROJECT/data/reporting/semantic_layer.yaml`, the database loader, source CSVs, or the checked-in SQLite file unless an actual implementation blocker proves the task contract cannot be met without a separately approved scope change.

## Target data and component flow

```text
URL start/end
    │
    ▼
resolveWeeklySalesDateRange()
    ├── invalid ──► validation panel + Use default dates (no database call)
    │
    └── valid DateRange
          ├──► ReportExperience (draft inputs, apply/refresh/PDF state)
          └──► Suspense keyed by start:end
                    │
                    ▼
              WeeklySalesReportResult
                    │
                    ▼
              getWeeklySalesReport(range)
                    │ connection()
                    ▼
              one read-only SQLite open
                ├─ filtered new jobs
                ├─ filtered change orders
                ├─ all account-manager rows
                ├─ full new-job coverage
                └─ full change-order coverage
                    │
                    ▼
              pure report-model builder
                    │
                    ▼
              shared WeeklySalesReport markup
```

The PDF endpoint resolves the same `DateRange`, appends it to the fixed internal `/reports/weekly-sales` path with `print=1`, and waits for the same final report marker.

## Phase 0 — Establish and protect the baseline

1. Read the task references and current implementation before editing.
2. Inspect `git status --short` and preserve the untracked CFIF-002 inputs plus all unrelated changes.
3. Record the database checksum:

   ```bash
   shasum -a 256 _PROJECT/data/reporting/cfi_reporting.sqlite
   ```

4. Run the existing baseline checks once:

   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. Record any pre-existing failures before changing code. Do not weaken tests or lint rules to obtain a clean run.
6. Confirm `next.config.ts` does not enable Cache Components and retain the installed-version documentation as the API source of truth.

**Phase exit:** baseline behavior and failures are known, the database checksum is recorded, and no task implementation has modified source data.

## Phase 1 — Implement the shared date-range contract

Create `lib/reporting/date-range.ts` as a pure module.

### 1.1 Types and constants

Define:

- `DateRange` with `start` and `end` ISO date strings;
- `DEFAULT_WEEKLY_SALES_DATE_RANGE` set to `2026-09-07` through `2026-09-13`;
- stable validation codes such as `missing`, `invalid`, `repeated`, and `reversed`; and
- a discriminated result type so callers must handle valid and invalid states explicitly.

Do not expose mutable shared objects; freeze the default or return a copy.

### 1.2 Strict date-only validation

Implement validation without local-time conversion:

1. require both values;
2. require exact `YYYY-MM-DD` syntax;
3. validate month/day against Gregorian month lengths and leap-year rules;
4. compare normalized ISO strings only after validation; and
5. reject `start > end`.

Native date controls reduce ordinary invalid input, but the server validator remains authoritative for direct URLs and the PDF route.

### 1.3 Query resolution and serialization

Implement separate helpers for:

- resolving page-style values of `string | string[] | undefined`;
- resolving `URLSearchParams` without losing repeated-parameter detection;
- validating client draft strings;
- comparing two ranges; and
- returning a canonical `URLSearchParams` or query string in `start`, then `end` order.

Both absent parameters resolve to a copy of the default range. Exactly one absent value or more than one value for either key is invalid. Ignore unrelated application-owned parameters such as `print` when resolving the date range.

### 1.4 Tests

Cover:

- default resolution;
- valid normal and single-day ranges;
- leap-day success/failure;
- invalid month/day and loose formats;
- blank or partially missing values;
- repeated `start` or `end` values;
- reversed ranges;
- canonical serialization; and
- range equality.

**Phase exit:** all consumers can share one validated `DateRange` contract without importing server-only reporting code.

## Phase 2 — Make the SQLite loader range-aware and always fresh

### 2.1 Reshape the source result

Replace the current bare `WeeklySalesSourceRows` return value with a structure that carries:

- the validated selected range;
- filtered `newJobs` rows;
- filtered `changeOrders` rows;
- complete `accountManagers` rows; and
- independent full-table coverage for new jobs and change orders.

Keep source row interfaces and display-model interfaces explicit. Do not use `any` or unsafe assertions.

### 2.2 Extend safe query helpers

Update the internal query helper so it can bind named parameters and still wraps errors as `ReportingQueryError` with only the safe logical table name. Add a single-row/nullable-string parser for coverage results rather than bypassing the existing runtime validation pattern.

Use explicit columns. The filtered statements must include:

```sql
WHERE opened_date BETWEEN :start AND :end
WHERE co_date BETWEEN :start AND :end
```

Bind `{ start: range.start, end: range.end }`; never interpolate values into SQL.

### 2.3 Load full coverage during the same database open

Query:

```sql
SELECT MIN(opened_date) AS start, MAX(opened_date) AS end
FROM rpt_new_jobs_opened

SELECT MIN(co_date) AS start, MAX(co_date) AS end
FROM job_cost_change_orders
```

Convert a pair of `NULL` values to `null` coverage for a truly empty table. Reject mixed or wrongly typed results as a safe query error. These queries describe source availability; they do not replace TypeScript KPI calculations.

### 2.4 Preserve request-time database behavior

Change the public signatures to make range selection explicit, for example:

```ts
loadWeeklySalesSourceData(range, databasePath?)
getWeeklySalesReport(range, databasePath?)
```

`getWeeklySalesReport` must:

1. `await connection()`;
2. open SQLite through `withReadOnlyDatabase`;
3. execute all row and coverage queries during that one open;
4. close the database in `finally`; and
5. pass the source result into the pure model builder.

Do not retain a connection or model in module state. Do not add React `cache`, Next cache APIs, or an in-memory range map.

### 2.5 Update the pure model

Change metadata from fixed `weeklyExtractStart`/`weeklyExtractEnd` to:

- `selectedRange`;
- `newJobSourceCoverage`;
- `changeOrderSourceCoverage`; and
- existing `accountSnapshotDate`.

Keep the filtered date-section calculations and all account calculations in TypeScript. Retain cent-safe summation, sort order, empty-model handling, identifier semantics, and formatting rules.

**Phase exit:** a direct loader call returns only range-matching new jobs/change orders, complete account snapshot data, and full source coverage from one fresh read-only database open.

## Phase 3 — Add data-layer regression coverage before changing the UI

Update `lib/reporting/weekly-sales.test.ts` and add focused range tests.

### 3.1 Checked-in snapshot expectations

Assert:

- default `2026-09-07`–`2026-09-13`: 4 new jobs / `188125.00`; 1 change order / `38334.36`; 0 negative adjustments;
- `2026-08-12`–`2026-08-31`: 0 new jobs / `0.00`; 4 change orders / `31990.40`; 1 negative adjustment;
- `2026-09-10`–`2026-09-10`: 3 new jobs / `159125.00`;
- a valid no-match range yields zero date-section totals and empty date-section rows;
- full source coverage stays `2026-09-09`–`2026-09-10` and `2026-08-12`–`2026-09-09` for every filter; and
- account rows, totals, comparisons, and account-derived KPIs are equal across the tested ranges.

### 3.2 Fresh-read regression

Use `node:fs` and `node:os` to create a temporary directory and copy the checked-in database. Against the copy only:

1. load a range and record a known total;
2. open the copy with `better-sqlite3` in writable mode;
3. update one in-range value and close the writer;
4. call the public loader again; and
5. assert the second result reflects the mutation.

Clean up only the explicit temporary directory in test teardown. Never write to `_PROJECT/data/reporting/cfi_reporting.sqlite`.

### 3.3 Preserve existing edge cases

Retain coverage for percentage denominators, cent rounding, `NONE`, prefix stripping, negative formatting, stable ordering, null `sort_order`, empty sources, and missing-database errors. Update only expectations intentionally changed from all-row to selected-range behavior.

**Phase exit:** `npm test` proves the business filter and fresh-read contract independently of React and browser behavior.

## Phase 4 — Restructure the page around validated search parameters and streaming

### 4.1 Parse before any query

In `page.tsx`:

- keep the page a Server Component;
- retain `runtime = "nodejs"`;
- add `dynamic = "force-dynamic"`;
- await the Next.js 16 `searchParams` promise;
- resolve `start`/`end` before constructing any report-loading component; and
- determine `print=1` independently from the date-range parser.

If the range is invalid, render the page context plus a filter-specific panel and a `Link` to `/reports/weekly-sales` labeled **Use default dates**. Do not call `getWeeklySalesReport` and do not fall through to the database error component.

### 4.2 Isolate the async report result

Extract an async Server Component, colocated in `page.tsx` or a route-local file, that accepts only a validated `DateRange`, calls `getWeeklySalesReport(range)`, and returns either:

- `<WeeklySalesReport report={report} />`; or
- the existing safe `ReportLoadError` for a known database/query failure.

Unexpected errors may continue to reach `error.tsx`.

### 4.3 Add the keyed boundary

Wrap the async result in Suspense using `${range.start}:${range.end}` as the key and the shared `ReportSkeleton` as the fallback. This gives distinct ranges distinct content identities and supports the initial/direct streaming state.

### 4.4 Branch screen and print composition

- Normal screen mode renders the existing page header plus `ReportExperience`, passing the applied range and the server-rendered report result as children.
- Print mode omits the application header and controls and renders only the Suspense-wrapped report viewport.
- Both modes use the same result component, model, report markup, and CSS.

**Phase exit:** valid URLs query exactly once per server render, invalid URLs query zero times, and print/screen modes share one report result.

## Phase 5 — Implement the URL-backed toolbar and pending controller

Create `report-experience.tsx` as the narrow client boundary, or evolve `report-toolbar.tsx` into the same clearly scoped role.

### 5.1 Props and state

Pass only serializable data:

- `appliedRange`;
- the account snapshot display date if needed for the fixed disclosure; and
- report JSX as `children`.

Track:

- draft start/end strings;
- navigation/refresh transition state;
- PDF download state;
- live status text; and
- which action initiated the current transition when success copy needs to distinguish apply from refresh.

Use an effect keyed by `appliedRange.start` and `.end` to resynchronize drafts after Back/Forward or another completed navigation. Do not reset drafts on unrelated local renders.

### 5.2 Form behavior

Render a semantic form with native required date inputs. On submit:

1. validate with the shared pure helper;
2. keep focus and show the specified local error if invalid;
3. return without navigation if the valid draft equals the applied range;
4. create `URLSearchParams` from validated values only; and
5. call `router.push()` inside `startTransition`, using the fixed `/reports/weekly-sales` path, the canonical query string, and `{ scroll: false }`.

Disable Apply when the draft is invalid, unchanged, or a navigation/refresh transition is pending. The Enter key must submit through normal form semantics.

### 5.3 Refresh behavior

Keep Refresh separate from Apply. In a transition:

- retain the current applied range and URL;
- call `router.refresh()`;
- replace report content with the skeleton while pending; and
- announce completion as a fresh read of the local snapshot.

Do not use `revalidatePath`; there is no server data cache to invalidate.

### 5.4 PDF behavior

Construct the fixed endpoint with the applied range, not the draft range:

```text
/reports/weekly-sales/pdf?start=<applied>&end=<applied>
```

Keep `cache: "no-store"`, response status/content-type validation, Blob download, URL revocation, range-aware fallback filename, and local pending/error/success text. Disable only actions that would cause conflicting work; never silently download the un-applied draft range.

### 5.5 Prevent stale presentation

While apply or refresh is pending, render `ReportSkeleton` in place of `children` and set the report region’s busy state. This explicit client substitution is required because a transition may otherwise retain already revealed content while the next Server Component payload is loading.

The toolbar may continue showing the draft range during an apply, but the old report values must not remain visible beside the pending new range.

**Phase exit:** Apply, Refresh, Back/Forward, and PDF actions preserve one coherent applied range and expose accessible pending/status behavior without client-side data filtering.

## Phase 6 — Update report content and disclosures

In `weekly-sales-report.tsx`:

1. Replace fixed extract metadata with **Selected period** and the applied range.
2. Rename the two filtered KPI labels and section headings exactly as required.
3. Build the new-job and change-order empty messages from the applied range.
4. Show full loaded coverage from model metadata, not from filtered rows.
5. Keep the account snapshot date and exact-seven-day-boundary caveat.
6. Rewrite the compact coverage callout to cover selected period, both source ranges, partial/empty limitations, account-snapshot scope, and unconfirmed currency.
7. Preserve the existing report title, account-manager table, amount formatting, semantic tables, one `<h1>`, and `data-report-ready="true"` on the final article only.

Keep copy construction close to the renderer only when it is presentation text. The component must not calculate totals or reinterpret dates.

Update `weekly-sales-report.test.tsx` with explicit model metadata so the static markup asserts:

- selected-period text;
- selected-period KPI/section labels;
- range-specific empty messages;
- full coverage rather than filtered coverage;
- snapshot and currency disclosure; and
- one `<h1>` plus the final-ready marker.

**Phase exit:** the final report cannot be read as if account-manager metrics were filtered, and empty periods remain truthful successful reports.

## Phase 7 — Build the shared report skeleton and visual states

### 7.1 Skeleton structure

Create `report-skeleton.tsx` with the same outer report viewport/sheet geometry and stable representations of:

- identity/title/meta rows;
- six KPI cards;
- two compact detail sections; and
- the account-manager section.

Include one `role="status"` message, **Calculating weekly sales report…**. Put `aria-hidden="true"` on repeated placeholder shapes and set `aria-busy="true"` on the containing result region.

### 7.2 Skeleton styling

In the existing CSS module:

- use `--ce-color-surface-alt`, `--ce-color-divider`, and neutral report-local tones;
- preserve square geometry;
- use a restrained opacity pulse only on placeholder shapes;
- add `@media (prefers-reduced-motion: reduce)` to remove the animation without hiding content;
- keep the `11in × 8.5in` report footprint and mobile horizontal scroller; and
- avoid action red, gradients, shimmer sweeps, or ornamental movement for indeterminate status.

### 7.3 Toolbar action hierarchy

Move the filled red primary treatment to **Apply date range**. Render Refresh and Download PDF as secondary actions. Preserve the existing theme tokens, focus ring, disabled distinction, minimum control height, and stacked narrow layout.

### 7.4 Shared use

- `loading.tsx` returns `ReportSkeleton`.
- Suspense uses `ReportSkeleton`.
- `ReportExperience` uses `ReportSkeleton` during client transitions.

Do not copy the skeleton markup into three files.

**Phase exit:** direct loads and client regenerations use the same accessible, stable placeholder, and reduced-motion users receive an equivalent nonanimated state.

## Phase 8 — Make PDF generation range-aware and testable

### 8.1 Extract pure PDF request helpers

Move non-Puppeteer logic into `pdf/pdf-request.ts`:

- resolve the date range from `URLSearchParams` with repeated-key detection;
- validate `REPORT_RENDER_ORIGIN` as HTTP(S) or use the request origin only for loopback hosts;
- construct a new URL from the fixed `/reports/weekly-sales` path;
- append validated `start`, `end`, and application-owned `print=1`; and
- generate `cfi-weekly-sales-summary-<start>-to-<end>.pdf`.

The helper accepts origins and validated values, never an arbitrary internal pathname from the caller.

### 8.2 Update the Route Handler

In `route.ts`:

1. parse the incoming request URL;
2. return a safe `400` plain-text response with `Cache-Control: no-store` for invalid date parameters;
3. resolve the fixed render URL or return the existing `503` configuration response;
4. launch Puppeteer and open the internal URL;
5. wait for `networkidle0`, `[data-report-ready="true"]`, and `document.fonts.ready`;
6. generate one landscape Letter page with backgrounds;
7. use the range-aware attachment filename and no-store response; and
8. close the browser in `finally` on every path.

The internal page request independently calls the request-time loader and therefore reads SQLite again.

### 8.3 Unit coverage

Test:

- default and explicit valid ranges;
- invalid, partial, and repeated date parameters;
- loopback request origins;
- configured HTTP(S) origins with path/search/hash stripped;
- rejected schemes and malformed origins;
- fixed application pathname and `print=1` ownership; and
- deterministic filename output.

Do not launch Puppeteer in unit tests.

**Phase exit:** web and PDF output share one applied range, invalid inputs cannot redirect rendering, and the endpoint remains uncached.

## Phase 9 — Integrate, inspect, and correct

### 9.1 Automated checks

Run:

```bash
npm test
npm run lint
npm run build
```

Resolve type, lint, Server/Client boundary, and production-rendering failures rather than suppressing them. Re-run the database checksum and compare it with Phase 0.

### 9.2 Functional browser checks

At a representative desktop viewport:

1. Load `/reports/weekly-sales` without query parameters and verify default values.
2. Apply `2026-08-12`–`2026-08-31`; observe the skeleton and verify 0 new jobs, 4 change orders, `31990.40`, and 1 negative adjustment.
3. Confirm every account-derived KPI and account row is unchanged.
4. Apply `2026-09-10`–`2026-09-10`; verify 3 new jobs and `159125.00`.
5. Apply a valid empty range and inspect both empty tables plus the unchanged account section.
6. Exercise blank, impossible where browser entry permits it, and reversed drafts; confirm no request starts.
7. Use Back/Forward and verify inputs, report metadata, and values stay synchronized.
8. Use Refresh and verify the skeleton plus completion message.
9. Exercise database retry/error behavior only with a safe temporary override or controlled test setup; do not move/delete the checked-in database merely for manual QA.

### 9.3 Accessibility and responsive checks

- Keyboard through Start date, End date, Apply, Refresh, Download PDF, and recovery actions.
- Submit Apply with Enter.
- Confirm visible focus, meaningful disabled states, associated validation, `aria-invalid`, polite status announcements, and one nonrepeating loading status.
- Inspect around `390×844`: toolbar stacks, no body-level horizontal overflow appears, and the report remains inside its bounded horizontal scroller.
- Emulate `prefers-reduced-motion: reduce` and confirm skeleton animation stops while its status remains understandable.

### 9.4 PDF check

Download a non-default range PDF and verify:

- both dates in the filename;
- selected-period metadata and filtered values;
- unchanged snapshot metrics and disclosure;
- no skeleton in the captured document;
- no clipped rows, footer, or disclosure; and
- exactly one landscape Letter page.

### 9.5 Bounded visual correction loop

If the longer coverage disclosure or skeleton changes fit/alignment, adjust only route-local layout and type density necessary to preserve the existing hierarchy and one-page print contract. Do not redesign the report or change brand-kit tokens. Save concise evidence under `_PROJECT/tasks/CFIF-002/evidence/` only for checks actually performed.

**Phase exit:** automated checks pass, database bytes are unchanged, date interactions and states are verified at desktop/mobile widths, and the non-default PDF matches the web report.

## State checklist

| State | Expected result |
| --- | --- |
| No `start`/`end` | Default range is applied; report loads from SQLite. |
| Valid unchanged draft | Apply disabled; current report remains. |
| Valid changed draft | Apply enabled; no calculation until submit. |
| Blank/reversed draft | Inline associated validation; Apply disabled; no navigation. |
| Invalid direct URL | Validation panel and **Use default dates**; zero database calls. |
| Apply pending | Draft range shown, actions protected, old report replaced by skeleton. |
| Refresh pending | Applied range retained, old report replaced by skeleton, fresh request issued. |
| Valid range with no date rows | Zero date KPIs, range-specific empty tables, account snapshot still rendered. |
| Database/query failure | Safe report error and retry; no stale or fabricated values. |
| PDF pending/failure | Web report remains; local live status updates; control re-enables after failure. |
| Print render pending | Skeleton may stream initially, but Puppeteer waits for final-ready marker. |
| Reduced motion | Static placeholders and textual pending status. |

## Requirement-to-phase traceability

| Requirement | Primary phases |
| --- | --- |
| Valid inclusive date range and canonical URL | 1, 4, 5 |
| Correct `opened_date` / `co_date` filtering | 2, 3 |
| Account snapshot remains unfiltered and disclosed | 2, 3, 6 |
| Fresh uncached database reads | 0, 2, 3, 4, 5 |
| Report-shaped pending animation | 4, 5, 7 |
| Reduced-motion and accessible feedback | 5, 7, 9 |
| Full coverage vs selected period | 2, 3, 6 |
| Empty and failure states | 3, 4, 5, 6, 9 |
| Range-aware shared PDF | 4, 8, 9 |
| Responsive and one-page layout preservation | 6, 7, 9 |

## Brand application record

Brand basis:

- EXP-001 and EXP-003 — keep the operational task direct, practical, and truthful about source limitations.
- DES-001, DES-003, and DES-004 — retain restrained red emphasis, neutral surfaces, sans-serif hierarchy, and square controls.
- DES-006 and DES-007 — preserve content priority in the responsive web-app extension without claiming source-observed mobile behavior.
- DES-009 and PAT-004 — provide explicit pending, disabled, validation, success, error, keyboard, focus, and reduced-motion behavior.
- `brand-kit/theme.css` — reuse exact application tokens rather than adding a parallel palette.

Task-local adaptations:

- Make Apply the single primary red action; keep Refresh and Download secondary.
- Use neutral report-shaped loading blocks because this is a data-dense operational surface and imagery has no functional role.
- Preserve the existing plain-text `CFI Group` fallback and add no identity or photographic assets.
- Treat the loading pulse, stacked mobile toolbar, and report scroller as reversible application extensions, not observed CFI website behavior.

Verification record to include in the implementation handoff:

- rules and task sources actually used;
- tests/lint/build actually run;
- desktop/mobile, keyboard, reduced-motion, and PDF checks actually performed;
- evidence files actually created; and
- any unresolved source-coverage, browser, or PDF-runtime limitation.

## Completion standard

Implementation is complete only when every acceptance criterion in `refined_task_request.md` is satisfied, the default and alternate regression values pass, the database checksum is unchanged, the web/PDF range stays synchronized, the loading and error states do not expose stale values under the wrong range, and the available automated plus manual checks have been reported accurately.
