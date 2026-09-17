# CFIF-005 — Implementation plan

## Outcome

Deliver a single-source, authenticated prompt catalog and an accessible search/filter/selection interface that integrates with CFIF-004’s centered and floating composers without changing deterministic answer capabilities.

## Phase 0 — Confirm prerequisite and supported truth

1. Read all authority sources and inspect CFIF-004’s completed code, task files, and stored evidence/check notes.
2. Inspect current deterministic intent fixtures and identify exact prompts that are already supported.
3. Build a mapping from each proposed catalog record to an automated existing or planned simulation test.
4. Omit any category with no supported mapped prompt.
5. Run baseline tests, lint, and build; preserve unrelated worktree changes.

**Exit:** the session has an explicit vetted catalog list and no speculative prompt capability.

## Phase 1 — Define catalog and DTO contracts

1. Add dependency-light shared prompt DTOs and runtime parsers to the established contracts area.
2. Create a server-owned immutable catalog in the existing Data Insights server/domain area.
3. Add stable category IDs and separate user-facing labels.
4. Validate catalog records at module/test startup so malformed internal data cannot reach the API.
5. Add pure search/filter/sort helpers suitable for client use without importing server fixtures.

Test unique IDs, valid categories, supported-only publication, stable sorting, normalization, tag matches, combined filters, and empty results.

**Exit:** the prompt model is runtime-valid and matching behavior is independently tested.

## Phase 2 — Add the protected prompts API

1. Implement `GET /api/prompts` using existing session/auth and safe error helpers.
2. Return the complete small supported catalog plus derived categories and catalog revision.
3. Mark the response non-cacheable consistently with other authenticated Data Insights endpoints.
4. Validate the outgoing DTO before publication.
5. Add handler/domain tests for signed-in success, expired/absent session, supported-only output, deterministic order, and safe failure.

Do not add SQLite tables or query parameters for initial search/filtering.

**Exit:** the browser can load a safe catalog only through the authenticated API.

## Phase 3 — Use the catalog for starter suggestions

1. Replace hard-coded client suggestions with API-backed supported prompt records.
2. Select no more than five curated starter records using catalog order.
3. Preserve useful loading/error behavior without blocking free-form input.
4. Share one draft-insertion function with prompt-browser selection.

**Exit:** new-chat suggestions and the future browser cannot drift apart.

## Phase 4 — Implement desktop prompt browser

1. Add the visible new-chat `Browse prompts` action and compact ongoing-chat library icon.
2. Build the nonmodal anchored panel with Search, categories, count, results, Close, and clear-filter recovery.
3. Position below the centered composer and above the ongoing bottom composer.
4. Focus Search on open; close on Escape/desktop outside click; restore opener focus.
5. Keep result filtering local and immediate while debouncing only assistive result-count announcements.
6. Confirm selected category and focus states are visible without relying on color alone.

**Exit:** keyboard and pointer users can search, filter, select, and dismiss on desktop.

## Phase 5 — Implement mobile bottom sheet and draft safety

1. Transform the browser into a modal bottom sheet at the specified content breakpoint.
2. Use the project’s existing focus-trap approach; avoid adding a dialog dependency.
3. Keep header/search/categories fixed and results scrollable.
4. Add non-empty draft replacement confirmation using the existing confirmation-dialog pattern.
5. On selection, close, update draft, focus textarea, and never submit.
6. Verify software-keyboard behavior and 200% zoom.

**Exit:** mobile selection is accessible and draft replacement is never accidental.

## Phase 6 — Validation and evidence

1. Exercise catalog load, empty/no-match, API failure/retry, category overflow, long prompt titles, selection, confirmation accept/cancel, Close, Escape, outside click, and focus restoration.
2. Verify free-form entry works when catalog loading fails.
3. Check centered and ongoing entry points at 390 × 844, 768 × 1024, and 1440 × 900.
4. Run focused tests, the complete existing suite, `npm run lint`, and `npm run build`.
5. Save actual screenshots and check notes under `_PROJECT/tasks/CFIF-005/evidence/`.

## Planned file-area ownership

Expected primary ownership:

- shared Data Insights contracts/runtime validation;
- a server-side prompt catalog module and tests;
- `app/api/prompts/route.ts` and focused tests;
- a colocated prompt-browser component and styles;
- starter-suggestion integration in the chat workspace/composer; and
- `_PROJECT/tasks/CFIF-005/evidence/`.

Avoid report/canvas CSS, SQLite migrations, simulation expansion, and unrelated routes.

## Copy-ready Codex session request

Implement CFIF-005 completely after CFIF-004. Read `_PROJECT/tasks/CFIF-005/task_request.md`, `implementation_plan.md`, the prompt-library and screen proposals, CFIF-004’s final implementation, CFIF-003’s preserved contracts, repository instructions, brand-kit rules, and installed Next.js documentation. Create one truthful supported-prompt catalog, expose it through a protected runtime-validated API, use it for starter prompts, and implement the accessible desktop popover/mobile bottom sheet with search, category filters, draft-safe selection, and no auto-send. Do not add unsupported intents, prompt persistence, analytics, or final canvas rework. Run and report focused tests, full tests, lint, build, and actual rendered verification.
