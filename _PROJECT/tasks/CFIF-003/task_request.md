# CFIF-003 — Implement Data Insights Chat with deterministic simulated APIs

## Objective

Implement the **Data Insights Chat** feature in the current CFI Group Next.js application. The feature must demonstrate a complete, persistent chat experience—login, multiple chats, typed and simulated recorded input, rendered Markdown answers, report attachments, an expanded report canvas, profile, logout, refresh recovery, and failure states—using deterministic fictional data served through application API endpoints.

This task is a **synthetic application prototype**. It must exercise real browser-to-API contracts and real SQLite persistence, but it must not connect to an LLM, AI agent, warehouse, speech-to-text provider, external identity provider, or any other live business service.

The resulting implementation must be structured so a future external AI/data backend can replace the deterministic simulation adapter without requiring the UI to abandon or reinterpret its API DTOs.

## Authoritative inputs and precedence

Read these files before implementation:

1. `_PROJECT/tasks/CFIF-003/task_request.md` — delivery scope and acceptance authority for this task.
2. `_PROJECT/tasks/CFIF-003/inputs/DATA_INSIGHTS_CHAT_SYSTEM_SPECIFICATION_v1.0.md` — functional behavior and logical contracts.
3. `_PROJECT/tasks/CFIF-003/inputs/SCREEN_SPECIFICATIONS.md` — screen, state, content, responsive, fixture, and accessibility baseline.
4. `_PROJECT/tasks/CFIF-003/inputs/PROTOTYPE.html` — interaction reference only. It is a standalone in-memory prototype, not production code or an architectural starting point.
5. `_PROJECT/tasks/CFIF-003/inputs/SCR-04_Conversation-with-report-canvas_example-render.png` — visual composition reference for the desktop report-ready state only.
6. `_PROJECT/tasks/CFIF-003/inputs/CFI_logo.svg` — supplied identity asset for this same-brand prototype.
7. The repository `AGENTS.md`, current implementation, local reporting documentation, installed Next.js 16 documentation, and `brand-kit/`.

When the source documents describe an integrated mode, this request overrides it: **only synthetic API-backed behavior is in scope**. Preserve the specified user experience and contracts, but replace live AI, analytics, authentication, and transcription integrations with explicit deterministic adapters. Do not silently omit states simply because their underlying provider is simulated.

## Repository starting point

- Next.js `16.3.5` App Router, React `19.2.8`, strict TypeScript, and Tailwind CSS 4.
- Existing report routes under `app/reports/` must continue to work.
- The repository already uses `better-sqlite3` and Vitest.
- The repository-local database is `_PROJECT/data/reporting/cfi_reporting.sqlite`.
- The current database contains the reporting tables `account_manager_summary`, `job_cost_change_orders`, and `rpt_new_jobs_opened`.
- `lib/reporting/database.ts` currently opens that database read-only for reports.
- `_PROJECT/scripts/build_reporting_database.py` currently builds a temporary reporting database and atomically replaces the destination file. That workflow would erase new chat tables unless it is changed.
- `app/globals.css` already imports `brand-kit/theme.css`.
- The current `/` route is still a starter page. Do not redesign or restructure the existing report feature as part of this task.

Before using a Next.js API, consult the matching installed guide under `node_modules/next/dist/docs/`. In particular, use App Router Route Handlers, preserve deliberate Server/Client Component boundaries, treat `cookies()` as async, and run SQLite-backed handlers in the Node.js runtime.

## Non-negotiable simulation boundary

### Required

- Every browser-visible user, chat, message, request, profile, transcription, answer, attachment, and artifact-row operation must cross an application API boundary.
- API responses must use shared DTOs and runtime-validated schemas. TypeScript types alone are not sufficient validation at a request/response boundary.
- Responses must be deterministic for the documented fixture clock and exact demonstration prompts.
- All screens must visibly state: **Synthetic demo · Fictional data · Reporting timezone: UTC**.
- Simulated AI answers must be produced by a local intent/fixture adapter, not by a generative model.
- Simulated transcription must be clearly labeled as simulated and must return a canned transcript through its API.
- Chats, messages, requests, request attempts, and report snapshots must persist in SQLite.

### Forbidden

- No OpenAI, Anthropic, Gemini, local model, agent framework, AI SDK, or other LLM call.
- No API key or model/provider configuration.
- No arbitrary SQL generated from chat text.
- No live warehouse or external reporting query.
- No reuse of the existing reporting tables as if they contained the fictional bid dataset.
- No real speech recognition or transcription provider.
- No silent fallback from a failed future live service to fictional success.
- No direct fixture imports in Client Components as a substitute for calling the APIs.
- No client-only persistence presented as saved history.

The adapter boundary should make the implementation honest and replaceable. Name it as a simulation or fixture adapter; do not name it as a production AI service.

## Route and screen scope

Implement the five specified destinations. Equivalent route organization is acceptable, but the preferred route map is:

| Screen | Preferred route | Required purpose |
| --- | --- | --- |
| SCR-01 Login | `/login` | Simulated provisioned-account sign-in, validation, pending, rejected, service-failed, expired, and signed-out states. |
| Feature hub | `/app` | Authenticated entry point that makes Data Insights Chat and Reports discoverable. |
| SCR-02 Empty workspace | `/app/chat` | New independent chat, history sidebar, suggestions, composer, and first-send flow without persisting blank chats. |
| SCR-03 Active conversation | `/app/chats/[chatId]` | Ordered persistent messages, request states, rendered Markdown, simulated voice flow, and report previews. |
| SCR-04 Report canvas | `/app/chats/[chatId]?report=[artifactId]&page=[page]` | Authorized, paginated, read-only snapshot alongside the conversation on wide screens and replacing it on narrow screens. |
| SCR-05 Basic profile | `/app/profile` | Read-only current-user profile, initials fallback, missing-value handling, and return to the prior workspace state. |

Keep `/reports` and `/reports/weekly-sales` behavior intact. The Data Insights Chat shell is a separate product surface; do not merge the weekly-sales report into the chat canvas.

## Functional requirements

### Authentication and profile

- Seed at least two fictional demo users so ownership/isolation can be tested.
- Provide a deterministic local sign-in flow for provisioned demo accounts. Document the demo credentials in the required demo guide; clearly mark them as local, fictional, and non-production.
- Establish the signed-in identity on the server. Do not accept a browser-supplied user ID as authorization.
- Use an `HttpOnly`, `SameSite` session cookie with an appropriate path and secure behavior for the environment.
- Persist sessions or otherwise make logout invalidation authoritative on the server; hiding protected UI locally is not enough.
- Every chat, request, message, artifact, page, and profile endpoint must enforce the current session and resource ownership.
- Use the exact primary fictional profile from the screen specification: Jordan Ellis / JE / `jordan.ellis@cfi-demo.example` / Business Development Manager / Estimating.
- Use Riley Chen / RC as the second-user and missing-optional-values fixture.
- Profile is read-only. Do not add Edit, Save, Settings, role management, password reset, or account administration.
- Logout clears protected client state, drafts, simulated voice state, open canvas data, and late polling results without deleting persisted chats.

### Chat lifecycle

- A blank new-chat view must not create a database row.
- The first accepted message must atomically create the chat, persist the user message, and create its request, or provide an equivalent retry-safe transaction.
- Generate a plain-text title from the first submitted message, normalize whitespace, remove Markdown syntax, and limit it to 60 Unicode code points.
- List only the current user’s chats, ordered by latest persisted user/assistant message activity descending with a deterministic tie-breaker.
- Opening a chat, reading it, or opening its report must not change chat recency.
- Restore ordered messages and request state after refresh and after logout/login.
- A new chat must not inherit another chat’s person, period, metric, draft, report, or attachment context.
- Allow one active simulated-answer request per chat. Other chats remain usable while one chat is pending.
- Drafts may remain session-local and per-chat; completed chats/messages/artifacts must be server-persisted.

### Composer and message behavior

- Provide a visible **Your question** label, multiline input, **Record**, and **Send**.
- Enter sends; Shift+Enter inserts a line break; input-method composition must not submit accidentally.
- Reject whitespace-only messages and messages over 4,000 Unicode code points with the exact guidance from the screen specification.
- Use a client-generated submission/idempotency ID so repeat activation or transport retry cannot create duplicate chats, user messages, requests, or successful answers.
- Show the submitted user message immediately, followed by a truthful queued/processing state from the request API.
- Poll or otherwise query the request-status API until it reaches a terminal state. Do not fake streaming Markdown.
- Refresh during a request must recover the persisted request state and must not resubmit the question automatically.
- Failed or interrupted turns may be retried only through the retry endpoint and only when the server marks them retryable.
- Preserve one user message and at most one terminal successful assistant reply per logical turn.

### Deterministic simulated-answer behavior

- Implement a bounded, documented intent resolver over normalized prompt text and same-chat context.
- The resolver must return one of: a completed Markdown answer, a clarification, a truthful unsupported response, a controlled failure, or a completed answer plus one table attachment.
- A completed assistant message always contains nonempty Markdown and `bodyFormat: "markdown"`.
- The simulation adapter—not the UI—owns fixture values, context resolution, counts, attachment construction, and failure selection.
- Do not claim the resolver is AI. The interface label may remain **Data Insights** as specified, while mode labeling makes the simulation explicit.
- Preserve the fixed fixture clock and UTC periods in `SCREEN_SPECIFICATIONS.md`; do not reinterpret “last month” using the developer’s or viewer’s current date.
- Same-chat follow-ups may reuse unambiguous context. New-chat follow-ups must ask for the missing person/period.
- Distinguish valid zero, valid empty report, partial coverage, access limitation, query failure, answer failure, malformed response, and report persistence failure.

### Rendered Markdown

- Render headings, paragraphs, emphasis, ordered/unordered lists, safe links, inline code, and fenced display-only code.
- Disable raw HTML and active content.
- Reject unsafe link protocols and block unsolicited remote images.
- Render user text and table cells as inert data.
- Keep structured reports out of the Markdown body; show them as separate attachment DTOs.
- Use a focused, well-maintained Markdown dependency only if needed for this concrete requirement. Do not add a component library, state library, or broad framework as a side effect.

### Simulated recorded input

- Preserve the specified Record → Stop → Transcribing → Review → explicit Send experience.
- This task does **not** claim actual microphone capture or speech recognition.
- Starting the flow must visibly say **Simulated recording** and must not request browser microphone permission.
- Stopping must call the simulated transcription API. The successful fixture returns: **How many bids did Casey Patel create in the past seven days?**
- Append the returned transcript to the current draft without overwriting typing that occurred while the request was pending.
- Never auto-send a transcript. Persist only the final reviewed text when the user explicitly sends it.
- Support cancel, late-response suppression, failure, timeout, empty-result, and transcript-discard states without creating a chat message.
- No audio bytes need to be captured or stored. Do not show playback or suggest that audio was processed.

### Report attachment and canvas

- A detailed-report answer contains a Markdown summary and one structured table artifact descriptor.
- The compact preview uses actual rows from the persisted snapshot, up to three rows and four columns on desktop; use two columns on phone as specified.
- Opening a report retrieves metadata and rows from artifact APIs; it must not use a Client Component’s imported fixture array.
- The desktop report-ready view follows the supplied reference: 248px sidebar, 416px conversation, and remaining right-side canvas at the canonical 1440px viewport.
- At 768–1279px, the report replaces the conversation main region while the sidebar remains.
- Below 768px, the sidebar is a drawer and the report occupies the main region; **Back to conversation** restores the draft, message anchor, and focus.
- Preserve all ten fixture columns with horizontal scrolling; do not compress them into an unreadable screenshot fit.
- Use a semantic table, associated headers, stable typed values, a sticky header/leading identifier where practical, and 50-row pages.
- Preserve leading-zero identifiers, decimal precision, explicit currency codes, UTC timestamps, and null as **—**, not zero.
- The primary snapshot contains 64 rows: page 1 has 50, page 2 has 14.
- Preview, canvas, and reopened report must use the same stored snapshot. Reopening must not regenerate fixture rows.
- Provide loading, valid-empty, unavailable, unauthorized, page-failed, and recoverable load-failed states. A report error must not remove the conversation.
- Do not add charts, dashboards, export/download, report editing, filters, sorting controls, selection, formulas, or a separate report library.

## API and DTO contract

Use App Router Route Handlers under `app/api/`, the Node.js runtime, request-time execution, and `Cache-Control: no-store` for all session, chat, request, transcription, and artifact responses. Route Handlers backed by SQLite must not opt into Next.js caching.

Equivalent endpoint organization is acceptable if these responsibilities remain explicit:

| Method and route | Responsibility |
| --- | --- |
| `POST /api/auth/login` | Validate demo credentials and establish the server session. |
| `POST /api/auth/logout` | Invalidate the current session and clear its cookie. |
| `GET /api/me` | Return the current permitted profile. |
| `GET /api/chats` | Return only the signed-in user’s chat summaries in persisted recency order. |
| `POST /api/chats` | Atomically create the first chat/message/request from a first submission, or provide an equivalent atomic create-and-send route. |
| `GET /api/chats/[chatId]/messages` | Return ordered messages, attachment summaries, and active request state. |
| `POST /api/chats/[chatId]/messages` | Validate and persist a follow-up plus its logical request using an idempotency key. |
| `GET /api/requests/[requestId]` | Return authoritative queued/running/terminal state; finalize a due deterministic simulation when appropriate. |
| `POST /api/requests/[requestId]/retry` | Create an eligible new attempt for the same logical turn without another user message. |
| `POST /api/transcriptions` | Return a classified simulated transcript result. No actual audio-provider integration. |
| `GET /api/artifacts/[artifactId]` | Return authorized snapshot metadata, typed columns, preview rows, counts, filters, and provenance. |
| `GET /api/artifacts/[artifactId]/rows?page=1&pageSize=50` | Return one authorized, deterministic page of the stored snapshot. |

### Shared DTOs and schemas

Define shared DTOs and runtime parsers for at least:

- `ApiErrorDto`: safe `code`, user-facing `message`, `retryable`, and request/correlation ID where available.
- `LoginRequestDto`, `LoginResponseDto`, and `UserProfileDto`.
- `ChatSummaryDto`, `ChatListDto`, and chat detail DTOs.
- `CreateMessageRequestDto`: `content`, `inputMode`, and stable `clientSubmissionId`.
- `MessageDto`: stable ID, chat ID, sequence, role, content/body format, timestamp, request ID, input mode, and attachment summaries.
- `RequestStatusDto` as a discriminated union for queued, running, completed, failed, and interrupted states.
- `TableArtifactSummaryDto` and `TableArtifactDetailDto`.
- `TableColumnDto`: stable key, label, data type, and formatting metadata.
- `TableRowPageDto`: page, page size, stable schema, typed rows, snapshot row count, optional matching total, truncation, and next-page state.
- `TranscriptionRequestDto` and `TranscriptionResponseDto` with explicit simulated mode and classified errors.

DTO invariants:

- All IDs are stable opaque strings.
- All timestamps contain an explicit UTC offset.
- `role` is `user` or `assistant`.
- Completed assistant messages have `bodyFormat: "markdown"` and nonempty `bodyMarkdown`.
- Cell values are limited to declared scalar types or null; no executable markup.
- `snapshotRowCount`, `totalMatchingRowCount`, current page length, and `isTruncated` remain distinct.
- Unknown matching total is `null`, not zero.
- API handlers validate requests before database work and validate adapter output before persistence/publication.
- Client Components consume DTOs and do not import server repositories, SQLite helpers, fixture rows, password data, or session secrets.

The deterministic request lifecycle may use a persisted `readyAt` value. Returning `202` from message submission and completing a due request when the status endpoint is polled is acceptable and preferred over an unreliable in-process background timer.

## SQLite persistence and migration requirements

Use `_PROJECT/data/reporting/cfi_reporting.sqlite` as the default database file for this prototype. Extend it with application-owned tables; do not create browser storage as the source of truth and do not mutate the existing reporting table meanings.

The physical schema may vary, but it must represent these logical entities and constraints:

| Table/entity | Minimum persisted fields and constraints |
| --- | --- |
| `chat_users` | ID; unique normalized email; password verifier for local demo use; first/last/display name; optional avatar/designation/department; scope key; created timestamp. Never store a plaintext password. |
| `chat_sessions` | Opaque token hash/ID; user ID; created/expires/revoked timestamps. |
| `chats` | ID; owner user ID; plain title; created and last-activity timestamps; owner/activity indexes. |
| `chat_messages` | ID; chat ID; stable sequence; role; body format/content; created timestamp; request ID; typed/voice input mode; unique chat sequence. |
| `chat_requests` | ID; chat ID; user-message ID; client submission/idempotency ID; status; active attempt; result-message ID; resolved context; ready/start/end timestamps; safe failure code; retryability. Enforce idempotency and one terminal success. |
| `chat_request_attempts` | Request ID; attempt number/ID; status; start/end timestamps; failure code; uniqueness per request. |
| `chat_artifacts` | ID; owner/chat/assistant-message links; title/type; typed-column JSON; snapshot/matching counts; truncation; filters; provenance; stable ordering; scope key; timestamps. |
| `chat_artifact_rows` | Artifact ID; zero-based stable row index; typed row JSON; unique artifact/index key. |
| Migration metadata | Explicit schema version, migration ID, or equivalent idempotent migration record. |

Enable and verify foreign keys for writable connections. Use transactions for first-chat creation, message/request publication, assistant reply plus artifact snapshot publication, retry state changes, and logout/session invalidation where applicable. Add the indexes needed for ownership checks, chat recency, message ordering, request lookup, idempotency, and artifact paging.

### Reporting-loader preservation requirement

The current reporting loader replaces the entire SQLite file. Before chat persistence can be accepted, change that workflow so a reporting refresh cannot silently delete application tables or saved chats.

An acceptable solution is to stage and validate the three reporting tables, then replace only those reporting tables inside a transaction in the persistent destination database. An equivalent approach is acceptable only if it preserves:

- all chat/application tables and rows;
- the loader’s existing header/type/row-count/integrity validation;
- failure atomicity—a bad reporting refresh leaves the previous reporting tables and all chat data intact;
- safe handling of foreign keys and indexes; and
- no lost chat writes caused by copying stale application tables across a whole-file replacement.

Add focused Python tests proving that a successful reporting refresh preserves seeded chat data and that a failed refresh preserves both existing reporting and chat data. Update `_PROJECT/data/reporting/README.md` with the new ownership/migration/refresh behavior.

Do not edit the checked-in database directly in tests. Mutating tests must work against a temporary copy or temporary database. Application startup/migration must be idempotent and must not reseed or erase existing chats on every run.

## Fixture and simulation contract

Use the exact fixture entities, dates, rows, counts, and Markdown content in `SCREEN_SPECIFICATIONS.md` §5 and §15. The canonical clock is 16 September 2026 in UTC.

Minimum fixture coverage:

- Two users with disjoint chat ownership.
- Multiple chats and deterministic recency.
- 42 distinct August bids, including a duplicate raw row that does not change the distinct result.
- 28 distinct July bids.
- Casey Patel created 18 bids and won 7 during 9–15 September 2026, with two wins created earlier.
- Morgan Reed created 10 bids in the same period.
- Two distinct Alex Morgan identities requiring clarification.
- Canonical 64-row, 10-column report with 50/14 paging.
- A valid zero-row report.
- Partial coverage, unknown freshness, cap-known, cap-unknown, access-revoked, query failure, answer failure, report-save failure, page failure, and unsafe-Markdown fixtures.

Keep fixture source data separate from persisted artifact snapshots. A new report request may materialize a new snapshot; reopening an existing artifact must read its stored rows.

## Required demo walkthrough

Create `docs/data-insights-chat-demo.md` during implementation. It must include the local demo account, setup/reset instructions, the visible synthetic-data limitation, and the exact prompt sequence below. The guide must not require the demonstrator to guess alternate wording.

### Primary report journey

1. Sign in as the documented Jordan Ellis demo account.
2. Choose **New chat**.
3. Send exactly: **Show the report of bids created in the past seven days.**
4. Expected result: one pending state, then a rendered Markdown answer stating **64 bids** for **9–15 September 2026**, plus the 64-row/10-column report attachment.
5. Open the report. Verify the first preview/report rows begin with `000064`, `000063`, and `000062`.
6. Move to page 2. Verify **Rows 51–64 of 64 · Page 2 of 2**.
7. Close the report and confirm the same conversation position is restored.
8. Refresh, then log out and back in. Reopen the chat and the same stored 64-row snapshot.

### Same-chat context journey

1. Choose **New chat**.
2. Send exactly: **How many bids did Casey Patel create in the past seven days?**
3. Expected result: **Casey Patel created 18 bids** from **9–15 September 2026**.
4. Send exactly: **And how many did that person win?**
5. Expected result: **Casey Patel won 7 bids**, with the explanation that two were created before the reporting period and that created/won counts are separate measures.

### New-chat isolation check

1. Choose **New chat**.
2. Send exactly: **And how many did that person win?**
3. Expected result: a Markdown clarification asking which person and reporting period to use. It must not inherit Casey Patel or the prior period.

### Additional documented prompts

| Exact message | Expected deterministic outcome |
| --- | --- |
| **How many bids were created last month?** | 42 distinct bids for 1–31 August 2026. |
| **And what about the previous month?** | In the same chat after the August answer, 28 bids for 1–31 July 2026. |
| **How many bids did Casey Patel and Morgan Reed create in the past seven days?** | Rendered list: Casey 18; Morgan 10. |
| **How many bids did Alex Morgan create in the past seven days?** | Clarification listing the two Alex Morgan fixtures; no guessed count. |
| **Alex Morgan in Estimating, East.** | In that clarification context, 16 bids. |
| **Show bids created from 1 to 7 June 2026.** | Valid zero-row result and a ten-column empty report, not an error. |
| **Create a dashboard and export this report.** | Truthful unsupported-capability answer; no dashboard/export control. |

Include a simulated voice demonstration that returns the Casey-created question to the composer for review. State clearly that no audio is captured and no transcription accuracy is being demonstrated.

## UI, brand, and asset requirements

Use the supplied **CFI Working Desk** direction and the named screen records rather than inventing a competing app style.

- Import and preserve the semantic roles in `brand-kit/theme.css`; do not scatter substitute brand colors.
- Use a charcoal header, white/pale-gray work surfaces, restrained CFI red for primary actions and selected navigation, dark readable text, square geometry, and direct operational wording.
- Use the supplied `_PROJECT/tasks/CFIF-003/inputs/CFI_logo.svg` intact at modest header sizes. Copy it to an appropriate application asset location; do not serve it from the task input directory at runtime.
- The supplied SVG contains an embedded raster image. Do not trace, recolor, crop, isolate the ring, stretch it, or treat it as a large scalable wall graphic.
- If the asset cannot be rendered, use disclosed live text **CFI Group** on charcoal. Do not recreate the mark.
- Do not ship the reference screenshot or extract its pixels as production assets.
- Do not ship `PROTOTYPE.html` as the application implementation.
- Do not add photography, decorative maps, gradients, glass effects, robot avatars, AI sparkles, marketing testimonials, KPI tiles, or oversized chat-bubble styling.
- Use plain aligned message groups. Assistant label: **Data Insights**. Literal actions: **New chat**, **Send**, **Record**, **Stop recording**, **Open report**, **Close report**, **Previous page**, **Next page**, **Profile**, and **Log out**.
- Apply the button-hover endpoint from the brand kit only to suitable primary actions; do not put a media-card shadow on every panel.
- Preserve the always-visible synthetic mode strip on authenticated screens and an equivalent synthetic designation on Login.

Relevant working brand rules include EXP-001–004, DES-001–009, PAT-004, and PAT-006. PAT-001/002/003/005 and IMG-001–003 are intentionally not used for this operational surface. This kit is a working approximation, not a confirmed corporate brand manual; do not describe the implementation as official brand approval.

## Accessibility and responsive requirements

- Semantic HTML first; every action keyboard operable with visible focus.
- At least 44×44px interactive targets.
- Visible labels for all form controls; placeholders are not labels.
- Text and named icons for pending, failure, access, empty, and simulated states; do not rely on color or animation.
- Polite announcements for progress/completion and appropriate assertive feedback for blocking errors.
- Correct focus return for account menu, mobile chat drawer, report open/close, confirmation dialogs, and profile return.
- Trap focus only in true modal dialogs/drawers, not in the desktop report canvas.
- Preserve reading position and drafts when opening/closing a report or profile.
- Respect `prefers-reduced-motion`; no autoplay, parallax, or decorative motion.
- Validate the full journey at approximately `1440×900` and `390×844`, plus a zoom/narrow-width check around 320px.
- No body-level horizontal overflow. The table’s own intentional horizontal scroller is permitted.
- The mobile keyboard must not cover the composer or Send action.
- Safe headings and table semantics; one clear page heading per screen.

## Security and failure handling

- Validate every untrusted path/query/body value.
- Enforce same-origin/CSRF protections appropriate to cookie-authenticated state-changing Route Handlers.
- Use parameterized SQLite queries.
- Store only a password verifier for demo accounts, never plaintext.
- Do not expose stack traces, SQL, fixture implementation details, cookie/session tokens, password verifiers, internal scope keys, or unrestricted diagnostic data.
- Sanitize Markdown and external links. Do not allow remote images in assistant messages.
- Use safe, consistent API errors and HTTP status codes.
- Prevent cross-user access by altered chat, request, message, or artifact IDs.
- Expiry/logout must suppress late request, page, and simulated-transcription payloads.
- A failed query must never become a zero result; a failed artifact fetch must never become an empty report.
- Test fixture failures must be selected through server-side test configuration or deterministic test injection, not an undocumented production-looking UI control.

## Suggested implementation organization

Equivalent organization is acceptable if boundaries stay clear.

| Area | Suggested responsibility |
| --- | --- |
| `app/login/` | Login screen and route-local UI. |
| `app/app/` | Authenticated feature hub, chat shell, empty workspace, conversation, report canvas, and profile routes. |
| `app/api/auth/`, `app/api/me/` | Simulated auth/session Route Handlers. |
| `app/api/chats/`, `app/api/requests/` | Chat and request lifecycle handlers. |
| `app/api/artifacts/` | Artifact metadata and row-page handlers. |
| `app/api/transcriptions/` | Explicit simulated transcription handler. |
| `components/data-insights/` | Genuinely shared chat UI primitives; keep client boundaries narrow. |
| `lib/data-insights/contracts/` | DTOs, discriminated unions, serializers, and runtime schemas. |
| `lib/data-insights/server/` | SQLite repositories, transactions, auth/session helpers, migrations, and ownership checks. Server-only. |
| `lib/data-insights/simulation/` | Deterministic prompt resolver, fixed clock, fixture data, and failure plans. Server-only. |
| `public/brand/` | Intact supplied logo used by the application. |
| `docs/data-insights-chat-demo.md` | Canonical demonstrator setup, credentials, script, expected results, reset, and limitations. |

Keep pages/layouts focused on composition. Server Components may provide the static shell and protected-route redirect, but browser-visible chat/profile/request/transcription/artifact data must still be obtained through the validated API contracts. Use narrow Client Components for API loading, the composer, polling, menus, drawers, report interaction, and focus restoration. Do not expose SQLite or fixture modules to the client bundle.

## Automated verification

Use the existing Vitest setup and Python `unittest` loader tests. Do not introduce another test framework unless a concrete uncovered need is documented.

At minimum, automate:

1. Request and response schema validation, including rejection of malformed IDs, bodies, enum values, pagination, and over-limit text.
2. Demo login, logout invalidation, expired session, and current-user profile behavior.
3. Two-user isolation for chats, messages, requests, artifacts, and row pages.
4. Migration idempotency and foreign-key enforcement.
5. Successful reporting refresh preserving chat data.
6. Failed reporting refresh preserving the prior reporting data and chat data.
7. Blank new chat creates no row; first send creates exactly one chat/message/request.
8. Idempotent retry after lost transport creates no duplicate chat, message, request, assistant reply, or artifact.
9. Persisted recency ordering and the rule that reading/opening a report does not reorder chats.
10. Same-chat context reuse and new-chat context isolation using the exact Casey prompts.
11. Deterministic monthly, prior-month, grouped-person, duplicate-name, valid-zero, partial, unsupported, and failure responses.
12. Distinct August count remains 42 despite the duplicate raw fixture row.
13. Created 18 versus won 7 semantics, including the two earlier-created wins.
14. Canonical artifact has ten typed columns, 64 unique rows, exact first-three preview rows, and 50/14 page lengths.
15. Snapshot stability after changing the source fixture for a new request.
16. Known/unknown truncation totals and the distinction among snapshot, matching, and page counts.
17. Null versus `0.00`, leading-zero IDs, currency code, decimal precision, and UTC timestamp serialization.
18. Safe Markdown rendering/serialization fixtures, including unsafe HTML, links, images, and instruction-like table text.
19. Simulated transcription success, cancel, failure, timeout, late-result suppression, append-to-current-draft, and explicit Send.
20. UI rendering for loading, processing, completed, empty, denied, query-failed, answer-failed, and page-failed states.

Tests that mutate SQLite must use a temporary database/copy. Record the checksum of the checked-in SQLite file before and after the test suite; tests must not alter it.

Run and pass:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
npm test
npm run lint
npm run build
```

Do not claim a test category passed if it was not present or run.

## Required manual verification

1. Start the application and complete the primary demo walkthrough at a representative desktop viewport.
2. Repeat login, new chat, typed send, report open/close, page navigation, profile, and logout by keyboard.
3. Verify the three-region `SCR-04.report-ready` composition near `1440×900` against the supplied example render without treating it as a pixel-perfect implementation target.
4. Verify the empty workspace, active conversation, full-width report, mobile drawer, composer, and profile near `390×844`.
5. Verify a 320px/zoom case has no body overflow and retains readable controls.
6. Refresh during a pending answer and recover the request without duplicates.
7. Refresh and log out/in after a completed report; reopen the same snapshot.
8. Exercise valid zero, query failure, page failure, unauthorized artifact, expired session, and simulated transcription cancellation.
9. Check hover, focus-visible, reduced-motion, live-region feedback, report focus return, and mobile drawer focus behavior.
10. Confirm browser network activity contains only same-application routes and no model, analytics, tracking, font, image, identity, or transcription provider calls.
11. Capture representative desktop and mobile evidence in `_PROJECT/tasks/CFIF-003/evidence/` and record the actual browser/version used.

## Out of scope

- Any real AI agent, LLM, prompt orchestration platform, or model SDK.
- Live CFI bid, job, sales, warehouse, Gold-layer, or customer data.
- Reinterpreting the existing reporting snapshot as bid data.
- Real microphone capture, speech recognition, audio storage, playback, spoken answers, or live calls.
- Streaming partial answers.
- Public registration, password reset, account administration, profile editing, or enterprise SSO.
- Shared/team chats, chat search, manual rename, delete, pin, message edit, or regeneration of successful answers.
- File/image uploads.
- Charts, dashboards, report editing, formulas, export/download, interactive report filters/sorting, scheduled reports, and a report library.
- Arbitrary SQL, query builders, write-back, or warehouse construction.
- Production hosting, high availability, disaster recovery, production retention certification, or production identity/asset approval.
- Changes to the canonical `brand-kit/`.

## Acceptance criteria

The task is complete when all of the following are true:

- The five specified screens and their synthetic-mode states are implemented in the current Next.js application without regressing existing report routes.
- All chat/profile/request/transcription/artifact data reaches the browser through typed, runtime-validated API DTOs; Client Components do not import fixture or SQLite modules.
- No LLM, AI SDK, external data source, real transcription provider, or external identity system is present or called.
- Synthetic mode and fictional-data/UTC limitations remain visible on every relevant screen and in report provenance.
- Login establishes a server-authoritative demo session; logout invalidates it; protected endpoints enforce user ownership and reveal no cross-user metadata.
- Blank drafts do not create chats; first send is atomic/retry-safe; multiple chats persist and are ordered only by persisted message activity.
- Refresh and logout/login restore ordered messages, requests, attachments, and the same report snapshots from SQLite.
- One active request per chat, idempotency, refresh recovery, eligible retry, and late-attempt suppression prevent duplicates.
- The exact documented prompts return their exact deterministic outcomes, including 42 August bids, 28 July bids, Casey 18 created/7 won, duplicate-Alex clarification, new-chat context clarification, 64-row report, and valid zero report.
- Every completed assistant response renders safe nonempty Markdown; technical failures remain application error states rather than fabricated assistant replies.
- The Record flow is clearly simulated, uses the transcription API, returns a reviewable transcript, never captures audio, and never auto-sends.
- The compact preview and report canvas use the same persisted artifact snapshot, all ten columns are reachable, pagination is 50/14, and null/zero/identifier/currency/date semantics are preserved.
- Desktop, tablet, and phone transformations follow `SCREEN_SPECIFICATIONS.md`, including the canonical three-region desktop report and full-width narrow report.
- UI expression uses the intact supplied logo, canonical theme tokens, restrained red/neutral CFI working style, literal actions, visible focus, adequate targets, semantic structure, and no unauthorized imagery or identity reconstruction.
- The existing reporting tables and their meanings remain intact, and a reporting database refresh cannot erase chat data.
- Database migrations and seeding are idempotent; tests do not mutate the checked-in database.
- `docs/data-insights-chat-demo.md` documents credentials, setup/reset, exact messages, expected outcomes, and simulation limitations.
- Automated checks pass, and the required desktop/mobile/keyboard/manual states are actually inspected and accurately recorded.

## Implementation references

- `_PROJECT/tasks/CFIF-003/inputs/DATA_INSIGHTS_CHAT_SYSTEM_SPECIFICATION_v1.0.md`
- `_PROJECT/tasks/CFIF-003/inputs/SCREEN_SPECIFICATIONS.md`
- `_PROJECT/tasks/CFIF-003/inputs/PROTOTYPE.html`
- `_PROJECT/tasks/CFIF-003/inputs/SCR-04_Conversation-with-report-canvas_example-render.png`
- `_PROJECT/tasks/CFIF-003/inputs/CFI_logo.svg`
- `_PROJECT/data/reporting/README.md`
- `_PROJECT/data/reporting/semantic_layer.yaml`
- `_PROJECT/scripts/build_reporting_database.py`
- `lib/reporting/database.ts`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`
- `brand-kit/kit.yaml`
- `brand-kit/experience.md`
- `brand-kit/design.md`
- `brand-kit/patterns.md`
- `brand-kit/theme.css`
- `brand-kit/assets/index.yaml`
- `brand-kit/evidence/index.yaml`

Brand adaptation for this task: apply the working kit’s practical, direct, property-oriented voice; red/neutral/charcoal signature; sans-serif hierarchy; square geometry; task-sized forms; compact disclosures; responsive readability; and explicit feedback to the screen specification’s denser operational workspace. Omit marketing photography, media-card styling, filters, social proof, and decorative imagery because they do not support the chat/report task.
