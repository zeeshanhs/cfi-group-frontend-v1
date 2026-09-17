# CFIF-003 — Two-stage implementation plan

## Outcome

Implement **Data Insights Chat** as two sequential, independently verifiable goals:

1. **Stage 1 — Persistent platform and core typed-chat vertical slice:** establish the durable SQLite, migration, DTO, authentication, simulation, API, and request-lifecycle foundations, then prove them through a working login/new-chat/typed-conversation path.
2. **Stage 2 — Complete branded experience and demonstration:** finish the report canvas, simulated recorded input, profile, responsive and accessible interaction states, demo documentation, visual verification, and full acceptance pass.

This file is an implementation plan only. It does not change the acceptance authority of `_PROJECT/tasks/CFIF-003/task_request.md` or authorize work outside that request.

## How to run the two goals

Run the copy-ready Stage 1 `/goal` prompt first. Start Stage 2 only after Stage 1 reaches its stopping condition and its handoff records the checks actually run.

Each goal has:

- one durable objective;
- explicit source files to read first;
- a bounded list of implementation checkpoints;
- commands and behaviors that prove progress;
- an explicit exclusion boundary; and
- a verifiable stopping condition.

If a goal exposes an acceptance defect in this plan, resolve the smallest in-scope defect and record it in the handoff. Do not silently broaden the product or begin the next stage early.

## Authority and source order

Both stages must read and apply these sources in this order:

1. `_PROJECT/tasks/CFIF-003/task_request.md` — delivery and acceptance authority.
2. `_PROJECT/tasks/CFIF-003/implementation_plan.md` — sequencing and stage boundary.
3. `_PROJECT/tasks/CFIF-003/inputs/DATA_INSIGHTS_CHAT_SYSTEM_SPECIFICATION_v1.0.md` — functional and logical contracts.
4. `_PROJECT/tasks/CFIF-003/inputs/SCREEN_SPECIFICATIONS.md` — screens, copy, fixtures, responsive behavior, accessibility, and exact demo outcomes.
5. `_PROJECT/tasks/CFIF-003/inputs/PROTOTYPE.html` — interaction reference only.
6. `_PROJECT/tasks/CFIF-003/inputs/SCR-04_Conversation-with-report-canvas_example-render.png` — desktop report composition reference only.
7. `_PROJECT/tasks/CFIF-003/inputs/CFI_logo.svg` — supplied same-brand prototype asset.
8. Repository `AGENTS.md`, installed Next.js 16 documentation, current code, reporting documentation, and `brand-kit/`.

The task request wins if an older input implies live AI, live analytics, real transcription, or another integrated mode. The implementation remains a deterministic synthetic prototype.

## Non-negotiable invariants for both stages

- No LLM, AI SDK, external AI agent, model configuration, live warehouse, real transcription, external identity provider, or arbitrary SQL from chat text.
- Browser-visible data crosses same-application API boundaries through shared DTOs and runtime validation. Client Components never import SQLite, password/session logic, server repositories, or fixture rows.
- Chats, messages, requests, attempts, sessions, artifact metadata, and artifact rows use SQLite as their durable source of truth.
- The existing three reporting tables and all existing report routes retain their behavior.
- Reporting refresh replaces only reporting-owned tables and cannot erase application tables or saved chats.
- Authorization comes from the server session, never a browser-supplied user ID. Every resource endpoint enforces ownership.
- Simulation results are deterministic for the fixed 16 September 2026 UTC fixture clock and exact prompt library.
- Synthetic mode, fictional data, and UTC reporting limitations are visible and truthful.
- Use the supplied logo intact at modest sizes, canonical theme roles, restrained red/neutral/charcoal expression, square geometry, direct operational copy, and no unrelated imagery or AI decoration.
- Do not modify the canonical `brand-kit/` as part of this feature.
- Mutating tests use temporary databases or copies. Record the checked-in SQLite checksum before and after the relevant suites.

## Stage boundary

| Capability | Stage 1 | Stage 2 |
| --- | --- | --- |
| Reporting-loader preservation | Complete and tested | Regression verification only |
| Chat schema, migrations, seeding, repositories | Complete and tested | Change only to fix an acceptance defect |
| DTOs and runtime schemas | Complete for every endpoint | Consume; extend compatibly only if required |
| Demo auth, sessions, ownership | Complete and tested | Complete UI states and interaction polish |
| Deterministic resolver and fixture library | Complete and tested | Exercise through every visible journey |
| Chat/request/artifact/transcription APIs | Complete and tested | Integrate and verify from the browser |
| Login, empty workspace, typed chat | Working branded vertical slice | Complete all remaining states and responsive polish |
| Report preview/canvas | API contract and stored snapshot only | Full preview, canvas, paging, recovery, and responsive behavior |
| Simulated recorded input | Endpoint and DTO contract | Full Record → Stop → Review → Send experience |
| Profile | API contract | Complete profile route and restoration behavior |
| Demo guide and visual evidence | Deferred | Required |
| Final five-screen acceptance | Not claimed | Required |

Stage 1 must not leave throwaway architecture or styling that Stage 2 has to replace. Stage 2 must not bypass or duplicate Stage 1 contracts to make the UI easier.

---

## Stage 1 — Persistent platform and core typed-chat vertical slice

### Stage 1 objective

Build the durable server/API foundation and a working typed-chat path from simulated login through persisted deterministic answer recovery. At the end of this stage, a user can sign in, start an unpersisted blank chat, send the first typed message, observe a persisted request lifecycle, read safe Markdown, switch among saved chats, refresh, log out/in, and recover the same conversation without duplicates.

The artifact and transcription contracts must also be complete and tested at API/domain level so Stage 2 can concentrate on the full interaction experience.

### Checkpoint 1 — Baseline, documentation, and safety

1. Inspect the current worktree and preserve unrelated user changes.
2. Read the authoritative sources listed above and the relevant installed Next.js 16 guides for Route Handlers, Server/Client Components, async cookies, dynamic request-time behavior, and caching.
3. Inspect the supplied SVG before copying it into a runtime asset path. Preserve it intact and do not expose the task input directory publicly.
4. Record the checked-in SQLite checksum and run the existing Python, Vitest, lint, and build baselines. Record pre-existing failures rather than hiding them.
5. Decide and document the server-only database-path override used by tests and local QA. The default remains `_PROJECT/data/reporting/cfi_reporting.sqlite`.
6. Confirm that browser-visible fixture data will be reachable only through API handlers.

**Checkpoint exit:** the implementation starts from a known test/build/database state and all framework decisions are grounded in the installed version.

### Checkpoint 2 — Preserve reporting data while adding application ownership

1. Refactor `_PROJECT/scripts/build_reporting_database.py` so a refresh stages and validates the supplied extracts, then replaces only the three reporting-owned tables in the persistent destination within a transaction.
2. Preserve header/type/row-count/integrity validation and failure atomicity.
3. Ensure successful and failed refreshes preserve unrelated application tables and rows without copying a stale whole-file snapshot over concurrent chat data.
4. Extend `_PROJECT/tests/test_reporting_database.py` with temporary-database cases for successful preservation and failed-refresh preservation.
5. Update `_PROJECT/data/reporting/README.md` with reporting-table ownership, application-table ownership, refresh behavior, migration behavior, and test-safe overrides.

**Checkpoint exit:** loader tests prove both successful and failed refreshes retain seeded chat data, and existing reporting tests still pass.

### Checkpoint 3 — Add idempotent chat migrations and repositories

Create a server-only Data Insights persistence layer with explicit schema-version records and idempotent startup migration. Use application-owned names such as `chat_schema_migrations`, `chat_users`, `chat_sessions`, `chats`, `chat_messages`, `chat_requests`, `chat_request_attempts`, `chat_artifacts`, and `chat_artifact_rows`.

The implementation must:

- enable and verify foreign keys on every writable connection;
- add ownership, recency, ordering, request, idempotency, and artifact-page indexes;
- enforce unique chat message sequence, unique logical submission, unique attempt number, and at most one successful assistant result per logical request;
- transact first-send creation, follow-up publication, assistant-plus-artifact publication, retries, and session invalidation;
- keep reads from changing chat activity order;
- seed Jordan Ellis and Riley Chen idempotently with password verifiers, never plaintext passwords;
- avoid reseeding or erasing existing chats on startup; and
- support a temporary database path in tests without leaking that override to the browser.

Add focused repository tests for migration idempotency, foreign keys, ownership, ordering, first-send atomicity, idempotency, retry uniqueness, and snapshot paging.

**Checkpoint exit:** a temporary database can migrate repeatedly without data loss, enforce all critical constraints, and store/reopen the full logical model.

### Checkpoint 4 — Define shared DTOs and runtime validation

Create shared, browser-safe contracts and runtime parsers for every endpoint named in the task request, including:

- API error envelopes;
- login, logout result, current profile, and session-expiry responses;
- chat summaries, message submissions, message lists, and attachments;
- queued, running, completed, failed, and interrupted request states;
- retry requests/results;
- table artifact summaries, typed columns, metadata, preview rows, and paged rows;
- simulated transcription requests/results; and
- identifiers, UTC timestamps, scalar table values, enums, limits, and pagination.

Keep shared contracts dependency-light. Add a focused dependency only if it clearly reduces boundary risk; do not introduce a component library, state library, schema framework, or broad application framework without a concrete need.

Validate incoming requests before database work, simulation output before persistence, and repository output before publication. Use one consistent safe error shape and `Cache-Control: no-store` for all session/chat/request/transcription/artifact responses.

**Checkpoint exit:** contract tests reject malformed IDs, repeated/invalid page values, unknown enums, whitespace-only and over-4,000-code-point messages, invalid adapter output, and unsafe cell values.

### Checkpoint 5 — Implement server-authoritative demo authentication

Implement login, logout, `GET /api/me`, protected-route support, and resource ownership using an opaque server session:

- normalize the demo email deterministically;
- verify stored password verifiers with a standard Node cryptographic primitive;
- store only a token hash or opaque session identifier server-side;
- set an `HttpOnly`, `SameSite` cookie with an appropriate path, expiry, and environment-sensitive secure behavior;
- invalidate the server session on logout;
- reject expired/revoked sessions consistently; and
- apply same-origin/CSRF protection appropriate to cookie-authenticated mutations.

Test valid/rejected login, service failure classification, logout invalidation, expiry, current profile, and cross-user resource denial without revealing whether another resource exists.

**Checkpoint exit:** authentication and ownership work entirely from server-established identity and pass two-user isolation tests.

### Checkpoint 6 — Build the deterministic simulation and request lifecycle

Implement a server-only fixture/simulation adapter with the fixed UTC clock and exact entities, counts, rows, Markdown, and failure plans from `SCREEN_SPECIFICATIONS.md` §§5 and 15.

The adapter must:

- normalize only enough prompt text to match the documented bounded intents;
- resolve same-chat person, period, metric, and clarification context;
- never transfer context to another chat;
- return completed Markdown, clarification, truthful unsupported response, controlled technical failure, or Markdown plus one table snapshot;
- persist a `readyAt`-based queued/running/terminal lifecycle rather than relying on an in-process timer;
- publish assistant message and artifact snapshot atomically before marking the request complete;
- suppress late/superseded attempts and duplicate transport submissions;
- materialize the canonical 64-row/10-column report once and reopen its stored rows without regeneration;
- preserve valid zero, partial coverage, known/unknown totals, access denial, query failure, answer failure, report-save failure, and page failure as distinct states; and
- return the canned Casey question from the explicit simulated-transcription adapter without accepting or storing audio.

Automate all exact prompt outcomes, including 42/28 monthly counts, Casey 18 created/7 won, grouped people, duplicate Alex clarification, Estimating East resolution, new-chat isolation, valid zero report, and unsupported dashboard/export.

**Checkpoint exit:** deterministic domain tests prove every documented fixture outcome and the canonical artifact's schema, rows, preview, 50/14 pages, value types, and snapshot stability.

### Checkpoint 7 — Expose the complete API surface

Implement the task request's Route Handler responsibilities under `app/api/` using the Node.js runtime and request-time SQLite access:

- login, logout, and current profile;
- chat list and atomic create-on-first-send;
- ordered messages plus active request recovery;
- follow-up submission;
- request status finalization and eligible retry;
- simulated transcription;
- artifact metadata/preview; and
- artifact row paging.

All resource identifiers, query parameters, JSON bodies, DTO outputs, ownership, and state transitions must be validated. Return safe request IDs/correlation IDs where useful, parameterize every SQL statement, and do not expose implementation details.

Add integration-level handler/domain tests for idempotency after lost transport, one active request per chat, concurrent usability across chats, refresh recovery, recency ordering, no reorder on read/report open, retry rules, expired sessions, and altered cross-user IDs.

**Checkpoint exit:** the entire feature data plane is usable through tested APIs without importing fixtures into a Client Component.

### Checkpoint 8 — Deliver the core typed-chat vertical slice

Implement the first usable branded path:

- `/login` with synthetic designation, visible labels, pending/rejected/failure states, and the supplied logo or disclosed text fallback;
- the authenticated charcoal header, synthetic mode strip, desktop chat sidebar, and core narrow-screen navigation foundation;
- `/app` as the authenticated feature hub and `/app/chat` as the unpersisted empty workspace with suggestions, visible **Your question** label, and composer;
- `/app/chats/[chatId]` with ordered messages, safe Markdown, attachment summaries, request progress, retry where eligible, and per-chat drafts;
- chat switching, **New chat**, first-send navigation, Enter/Shift+Enter/IME behavior, refresh recovery, and logout; and
- visible focus, 44px targets, textual state feedback, and reduced-motion-safe transitions for the implemented surface.

Use API calls for every visible user/chat/message/request/attachment value. A blank new-chat route must remain unpersisted. Stage 1 need not implement the final report preview/canvas, profile route, or recorded-input controls; do not add nonfunctional controls that imply those experiences are complete.

The shell should already use canonical theme tokens, straightforward geometry, direct copy, and a narrow client boundary so Stage 2 extends it rather than restyles or rewrites it.

**Checkpoint exit:** Jordan can sign in, ask the exact Casey-created question, receive the persisted **18 bids** Markdown result, switch chats, refresh, log out/in, and reopen the same result with no duplicate records.

### Stage 1 validation

Run and record:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
npm test
npm run lint
npm run build
```

Also verify against a temporary database copy:

1. Blank `/app/chat` creates no chat.
2. First send creates exactly one chat, user message, and logical request.
3. Reusing the client submission ID creates no duplicates.
4. Refresh during pending processing recovers the stored request rather than resubmitting.
5. Same-chat Casey follow-up resolves to 7 wins; a new chat asks for missing context.
6. Logout invalidates the server session and a later login restores persisted history.
7. Riley cannot discover or retrieve Jordan's chats, requests, messages, artifacts, or rows.
8. Existing `/reports` and `/reports/weekly-sales` still render.
9. The checked-in SQLite checksum matches the Stage 1 baseline after automated tests.

### Explicit Stage 1 exclusions

Do not claim the full feature complete. Defer these to Stage 2:

- final compact report preview and responsive report canvas;
- visible 50/14 page navigation and canvas recovery states;
- Record/Stop/Transcribing/Review controls and late-result UI behavior;
- the completed profile route/account disclosure restoration flow;
- complete tablet/phone/drawer/report layout validation;
- final visual evidence and demo guide; and
- the full manual acceptance matrix.

### Stage 1 stopping condition

Stage 1 is complete only when all eight checkpoints are implemented, automated checks pass or any genuine external blocker is precisely documented, the core Casey typed-chat journey works through APIs and persists across refresh/logout/login, loader preservation and two-user isolation are proven, existing reports are not regressed, and no Stage 2-only control is presented as working.

### Copy-ready Stage 1 `/goal` request

```text
/goal Implement Stage 1 of _PROJECT/tasks/CFIF-003/implementation_plan.md: the persistent platform and core typed-chat vertical slice for Data Insights Chat. Read _PROJECT/tasks/CFIF-003/task_request.md, the Stage 1 plan, all listed input specifications, repository AGENTS.md, relevant installed Next.js 16 guides, reporting documentation, and the applicable brand-kit rules before editing. Work checkpoint by checkpoint, keep changes within Stage 1, preserve unrelated work and existing report behavior, use temporary databases for mutating tests, and keep a compact progress record naming the current checkpoint, verified commands, remaining work, and blockers. Do not integrate any LLM, live data, real transcription, or external identity service, and do not begin the Stage 2 report-canvas/recording/profile/final-polish work. Continue until the Stage 1 stopping condition and validation list in the plan are satisfied, then provide an evidence-based handoff with changed files, schema/API decisions, exact checks run, database checksum result, and deferred Stage 2 work.
```

---

## Stage 2 — Complete branded experience and demonstration

### Stage 2 prerequisite gate

Before adding features:

1. Read the Stage 1 handoff and inspect the actual repository rather than assuming it is complete.
2. Run the Stage 1 automated checks and a compact Casey happy-path smoke test.
3. Confirm migrations are idempotent, APIs enforce ownership, the reporting loader preserves chat data, and the canonical artifact API returns the stored 64-row snapshot.
4. If a prerequisite is incomplete, repair only what Stage 2 requires and record the correction. Do not redesign stable Stage 1 contracts without an acceptance reason.

### Stage 2 objective

Complete the five-screen, on-brand Data Insights Chat experience using the Stage 1 APIs and persistence layer. Finish report preview/canvas behavior, simulated recorded input, profile/account flows, all loading/empty/error/recovery states, responsive and accessible interactions, the exact demo guide, visual evidence, and the full acceptance matrix.

### Checkpoint 1 — Finish the shared shell and five screen destinations

Complete SCR-01 through SCR-05 using the route/state model in `SCREEN_SPECIFICATIONS.md`:

- finish Login states and signed-out/expired transitions;
- complete Empty workspace and Active conversation states;
- add report query-state routing for the conversation/report composition;
- implement the read-only Profile route with Jordan and Riley optional-value behavior;
- implement account disclosure, Profile, Log out, return-to-prior-workspace state, mobile sidebar drawer, and focus restoration; and
- retain the always-visible synthetic mode strip on authenticated screens.

Keep page/layout components compositional, Client Components narrow, and all visible domain data API-backed.

**Checkpoint exit:** every specified destination is reachable, truthful, keyboard-operable, and connected to persisted API data.

### Checkpoint 2 — Implement compact attachment preview and report canvas

Use only the persisted artifact APIs created in Stage 1:

- render the actual compact preview with up to three rows and four desktop columns/two phone columns;
- provide literal **Open report** and **Close report** actions;
- implement the 248px sidebar, 416px conversation, and remaining canvas composition near 1440px;
- at 768–1279px, keep the sidebar and replace the conversation region with the report;
- below 768px, use the sidebar drawer and full-width report region;
- render a semantic ten-column table with its own horizontal scroller, typed formatting, null as **—**, preserved leading zeros, currency codes, precision, and UTC timestamps;
- implement **Previous page**/**Next page**, 50/14 paging, stable row counts, preview/canvas consistency, and provenance;
- preserve draft, message anchor, scroll position, and focus across open/close and **Back to conversation**; and
- implement loading, valid empty, unavailable, unauthorized, recoverable load failure, and page failure without removing the conversation.

Do not add charts, filters, sorting, export, downloads, editing, selection, formulas, or a report library.

**Checkpoint exit:** the primary 64-row journey opens the exact stored snapshot, starts with `000064`, `000063`, `000062`, reaches **Rows 51–64 of 64 · Page 2 of 2**, and reopens unchanged after refresh/logout/login.

### Checkpoint 3 — Implement the simulated recorded-input experience

Build the explicit synthetic flow over the existing transcription endpoint:

1. **Record** enters a visibly labeled **Simulated recording** state without requesting microphone permission.
2. **Stop recording** calls the API and enters Transcribing.
3. The Casey-created transcript is appended to the current draft without overwriting typing performed while pending.
4. Review never auto-sends; only explicit **Send** persists the edited text with voice input mode.
5. Cancel, failure, timeout, empty result, transcript discard, navigation guard, late-response suppression, logout, and session expiry create no message.

Do not capture, upload, retain, or imply processing of audio bytes. Do not show playback.

**Checkpoint exit:** every recorded-input state is testable, truthful, and leaves unrelated drafts/history intact.

### Checkpoint 4 — Complete visible request, Markdown, and failure states

Finish the UI for all states represented by the server contracts:

- queued/running/completed/failed/interrupted and eligible retry;
- refresh recovery without duplicate submission;
- clarification and unsupported-capability answers;
- valid zero and partial-coverage results;
- access limitation, query failure, answer failure, report-save failure, malformed response, artifact failure, and page failure;
- login rejected/service failed/expired/signed out; and
- late result suppression after chat switch, report close, logout, or session expiry.

Render the specified Markdown subset with raw HTML and active content disabled, safe link protocols only, no unsolicited remote images, and inert user/table text. Keep structured report rows outside the Markdown body.

**Checkpoint exit:** technical failures remain application states rather than fabricated assistant replies, and all recovery actions operate on the original logical turn safely.

### Checkpoint 5 — Responsive, accessibility, and brand completion

Apply the screen specification and brand kit as one coherent **CFI Working Desk** experience:

- use `brand-kit/theme.css` roles rather than substitute palette values;
- retain charcoal identity/navigation, neutral work surfaces, restrained red actions/selection, sans-serif hierarchy, and square/near-square geometry;
- use the intact supplied logo modestly, with live-text fallback only if necessary;
- keep messages as aligned groups rather than oversized bubbles;
- maintain literal operational labels and direct simulated-mode disclosures;
- omit marketing photography, gradients, glass effects, decorative maps, robot/AI motifs, KPI tiles, and unsupported product controls;
- preserve one clear page heading, visible labels, 44×44px targets, visible focus, semantic tables, safe live regions, and text in addition to color/animation;
- implement correct focus return for account disclosure, drawer, report, confirmation, profile, and composer;
- trap focus only in actual modal/drawer contexts;
- respect reduced motion; and
- prevent body overflow at phone/zoom widths while keeping intentional table scrolling local.

Inspect an early report-ready screen before propagating layout fixes. Treat the supplied render as composition evidence, not a pixel-perfect production asset.

**Checkpoint exit:** the experience is coherent and usable near 1440×900, 390×844, and around 320px/zoom, with desktop, touch, keyboard, and reduced-motion behavior explicitly checked.

### Checkpoint 6 — Write the exact demonstrator guide

Create `docs/data-insights-chat-demo.md` with:

- local setup, migration, reset, and run instructions;
- fictional demo credentials and a non-production warning;
- the persistent database/testing distinction;
- the visible synthetic-data, no-LLM, no-live-data, no-audio-capture, and UTC limitations;
- the exact primary report, same-chat context, new-chat isolation, monthly, comparison, duplicate-name, valid-zero, unsupported, and simulated-voice messages from the task request;
- expected counts, dates, rows, paging text, and recovery outcomes;
- refresh, logout/login, profile, failure-state, and responsive demonstration notes; and
- concise troubleshooting that does not expose secrets or internal stack details.

The guide must let a demonstrator follow the script verbatim without inventing alternate wording.

**Checkpoint exit:** another person can run the complete demonstration from the document alone.

### Checkpoint 7 — Full automated and manual acceptance pass

Complete any missing Vitest/UI coverage using the existing test setup. Do not add another test framework unless a concrete required behavior cannot be verified otherwise and the choice is documented.

Run and pass:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
npm test
npm run lint
npm run build
```

Then execute the task request's complete manual verification matrix:

1. Primary report journey, exact rows, page 2, close/reopen, refresh, and logout/login recovery.
2. Same-chat context and new-chat isolation.
3. Simulated recorded-input success, review, cancel, failure, timeout/late response, and explicit send.
4. Profile, account disclosure, drawer, report, and confirmation focus behavior.
5. Keyboard-only login/new chat/send/report paging/profile/logout.
6. Desktop three-region report near 1440×900.
7. Empty, conversation, report, drawer, composer, and profile near 390×844.
8. Approximate 320px/zoom overflow and readability check.
9. Pending-refresh recovery, valid zero, query failure, page failure, unauthorized artifact, expired session, retry, and reduced motion.
10. Browser network inspection confirming only same-application routes and no model, tracking, external font/image, identity, analytics, or transcription provider traffic.
11. Regression checks for `/reports` and `/reports/weekly-sales`.
12. Checked-in database checksum comparison.

Capture representative desktop and mobile evidence under `_PROJECT/tasks/CFIF-003/evidence/` and record the actual browser/version and states shown. Do not claim a visual, keyboard, or browser check that was not performed.

### Stage 2 stopping condition

Stage 2 is complete only when every acceptance criterion in `_PROJECT/tasks/CFIF-003/task_request.md` is satisfied, all five screens and required states work through API DTOs against SQLite persistence, the exact demo script is documented and repeatable, the full automated suite passes, required browser/keyboard/responsive checks are recorded honestly, existing reporting behavior remains intact, and no forbidden live or external integration is present.

If completion needs a product decision outside the supplied specifications, stop only for that concrete decision and report the exact acceptance item it blocks. Do not substitute an invented capability.

### Copy-ready Stage 2 `/goal` request

```text
/goal Implement Stage 2 of _PROJECT/tasks/CFIF-003/implementation_plan.md: complete the branded Data Insights Chat experience and demonstration on top of the Stage 1 persistence, DTO, simulation, and API foundation. Read _PROJECT/tasks/CFIF-003/task_request.md, the full Stage 2 plan and prerequisite gate, the Stage 1 handoff and actual code, all listed input specifications, repository AGENTS.md, relevant installed Next.js 16 guides, reporting documentation, and applicable brand-kit rules before editing. First verify the Stage 1 prerequisites; repair only acceptance-critical gaps and do not replace stable contracts without evidence. Work checkpoint by checkpoint and keep a compact progress record naming the current checkpoint, verified commands, remaining work, and blockers. Finish the report preview/canvas, simulated recorded-input UI, profile/account flows, every required state, responsive/accessibility behavior, docs/data-insights-chat-demo.md, visual evidence, and full regression/acceptance pass. Do not add an LLM, live data, real audio/transcription, external identity, analytics/tracking, arbitrary SQL, or any out-of-scope product feature. Continue until the Stage 2 stopping condition is fully satisfied and then provide an evidence-based handoff with changed files, exact checks and browser states verified, database checksum result, brand rules applied, adaptations made, and any genuine remaining limitation.
```

## Planned file-area ownership

Exact filenames may adapt to the implementation, but responsibilities must stay separated.

| Area | Stage 1 ownership | Stage 2 ownership |
| --- | --- | --- |
| `_PROJECT/scripts/build_reporting_database.py` and Python tests | Refresh preservation and tests | Regression only |
| `_PROJECT/data/reporting/README.md` | Ownership/migration/refresh documentation | Update only if final run instructions require it |
| `lib/data-insights/contracts/` | DTOs, parsers, serializers, error unions | Compatible UI-facing refinements only |
| `lib/data-insights/server/` | DB access, migrations, repositories, auth, ownership, transactions | Acceptance fixes only |
| `lib/data-insights/simulation/` | Fixed clock, prompt resolver, fixtures, failure plans | Acceptance fixes only |
| `app/api/` Data Insights handlers | Complete surface | Integration fixes only |
| `app/login/` | Working screen and core states | Final state/interaction polish |
| `app/app/` | Shell, empty workspace, typed conversation | Report, profile, responsive and full state completion |
| `components/data-insights/` | Core reusable shell/chat/Markdown primitives | Canvas, voice, drawers, menus, focus and state refinements |
| `public/brand/` | Intact supplied logo | No identity reconstruction |
| `docs/data-insights-chat-demo.md` | Deferred | Create and verify |
| `_PROJECT/tasks/CFIF-003/evidence/` | Optional diagnostic captures only | Required representative final evidence |

## Acceptance traceability by stage

| Acceptance area | Stage 1 proof | Stage 2 proof |
| --- | --- | --- |
| Synthetic-only architecture | Adapter/API tests and dependency inspection | Browser network inspection and final dependency review |
| DTO/runtime boundaries | Contract and handler tests | All Client Components consume API DTOs |
| SQLite persistence | Migration/repository/request tests | Refresh/logout/login report reopening |
| Reporting refresh preservation | Python success/failure preservation tests | Full regression suite/checksum |
| Auth and ownership | Session and two-user tests | Visible expiry/logout/profile flows |
| Chat lifecycle/idempotency | Atomic first-send and retry tests | Browser pending/refresh/retry journeys |
| Deterministic prompt library | Domain/API fixture tests | Exact demonstrator journeys |
| Artifact snapshot | API schema/64-row/50-14 tests | Preview/canvas/reopen experience |
| Simulated transcription | Endpoint/contract tests | Full review/cancel/late-result UI |
| Safe Markdown | Parser/render tests in core chat | Complete visible unsafe-content/failure checks |
| Brand and layout | Foundational tokens, logo, shell | Full screen/render comparison and responsive evidence |
| Accessibility | Core semantics/focus/input behavior | Full keyboard, drawer, canvas, live-region, and reduced-motion pass |
| Demonstration readiness | Not claimed | `docs/data-insights-chat-demo.md` plus final evidence |

## Brand application record for implementation

Brand basis:

- EXP-001 and EXP-003: keep the tool practical and explicit about simulated/fictional operational claims.
- DES-001, DES-003, and DES-004: use restrained action red, neutral surfaces, charcoal contrast, sans-serif hierarchy, and square geometry.
- DES-005 and DES-009: keep primary hover, focus, pending, disabled, success, and error feedback distinct and restrained.
- DES-006 and DES-007: adapt responsively as an explicitly extended web-app pattern rather than claiming an observed CFI application.
- DES-008: use only the supplied intact logo; do not extract identity or imagery from screenshots.
- PAT-004 and PAT-006: use visible task-sized forms, clear actions, and compact secondary disclosure where warranted.
- `brand-kit/theme.css`: preserve semantic token roles through the existing global import.

Task-local adaptations:

- The **CFI Working Desk** is a reversible application extension derived from the supplied screen specification, not a confirmed corporate application system.
- The desktop report split, mobile drawer, chat messages, table canvas, and simulated voice states are task-specific patterns.
- Marketing photography, media-card styling, project filters, social proof, and decorative imagery are excluded because they do not support this operational workflow.
- The logo supplied in CFIF-003 changes asset availability for this same-brand prototype; it does not authorize tracing, recoloring, isolating, or broader reuse.

The final Stage 2 handoff must identify the actual kit rules and references used, significant adaptations, automated checks, rendered/browser checks, and anything not verified.

## Goal-format note

The prompts above intentionally define a single objective, files to read first, checkpoints, validation artifacts, exclusions, and a stopping condition. This follows OpenAI's guidance for durable `/goal` work: a goal should be larger than one prompt but smaller than an open-ended backlog, with an explicit success condition and validation loop.
