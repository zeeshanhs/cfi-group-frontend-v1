# Data Insights Chat
## Prototype System Specification

**Version:** 1.0  
**Date:** 16 September 2026  
**Status:** Proposed implementation baseline; not a production-system specification.  
**Working product name:** Data Insights Chat. No client brand, technology stack, or hosting platform is assumed.  
**Audience:** Product owner, designer, developer, integration team, and tester.

## 1. Purpose and intended outcome

Build an authenticated chat application that lets business users ask questions about business data, receive readable answers, and inspect detailed reports without overcrowding the conversation.

The prototype addresses a specific interaction problem: a short KPI answer belongs in the chat, but a report with many rows and around ten or more columns needs a larger reading surface. The application therefore combines conversational answers with expandable report attachments.

**The core response rule is fixed:** every AI answer has a Markdown body, and the application always renders that Markdown. A response may additionally include a structured table attachment. The attachment is not a replacement for the Markdown answer and is not a second plain-text or HTML response mode.

The prototype must demonstrate this end-to-end journey: a user signs in, creates or resumes a private chat, submits a typed or recorded question, receives a data-grounded answer, opens an attached report in a canvas, closes the canvas, and continues the conversation. Chats and report attachments remain available when the user returns.

### 1.1 How to interpret this specification

**[Brief]** identifies functionality explicitly requested by the user. **[Derived]** identifies behavior needed to make that functionality coherent, safe, or testable. **[Default]** identifies a proposed, reversible implementation choice where the brief left a detail open. Defaults are adopted for planning, not represented as previously approved business decisions.

All requirements in Sections 4–10 belong to the proposed prototype baseline. Section 11 records configurable defaults; Section 12 identifies missing external inputs. Missing business definitions must not be invented. A labeled synthetic demonstration can proceed while live integrations are unresolved.

This document defines product behavior and integration boundaries. Brand styling, detailed layouts, exact copy, and component styling belong to the subsequent screen-by-screen specification. They must not change the functional contract silently.

## 2. Scope, users, and boundaries

### 2.1 Included

| Capability | Prototype outcome |
| --- | --- |
| Authentication | A login screen, authenticated sessions, protected access, and logout. |
| Application shell | A top navigation/header area, left chat sidebar, central conversation, and account menu. |
| Multiple chats | Create independent chats, list recent chats first, and reopen previous conversations. |
| Text and recorded input | Type a question or record speech, review the transcription, and submit it. |
| Data answers | Answer agreed KPI questions using authorized data and agreed metric definitions. |
| Rendered Markdown | Render every AI answer as Markdown; never display an alternative raw-text response mode. |
| Report attachments | Show a compact table preview and expand it into a read-only canvas. |
| Basic profile | Display the user's avatar, name, designation, email address, and department. |
| Persistence and recovery | Retain chats, messages, and attached report snapshots; handle loading and failure states. |

### 2.2 Explicitly outside this prototype

The baseline excludes public registration, password-reset screens, account administration, multiple permission-management roles, shared/team chats, chat search, manual chat renaming or deletion, message editing, and regeneration of successful answers.

It also excludes file/image uploads, voice playback, spoken AI replies, live voice calls, charts, dashboards, report editing, spreadsheet-style formulas, export/download controls, configurable table columns, interactive report filters or sorting, scheduled reports, and a separate report library. A new question can request a different report or filter; that is not a visual report builder.

Building the warehouse, implementing its ingestion/medallion pipelines, defining the organization's reporting policy, and permitting unrestricted SQL or write-back operations are not included. Enterprise production hardening, disaster-recovery certification, high-availability commitments, and enterprise identity rollout are separate work.

### 2.3 User and access model

The prototype has one application role: **authenticated business user**. Each user owns their chats, messages, and report attachments. No cross-user sharing or administrative browsing is exposed.

Conversation ownership and warehouse-data permission are separate controls. A user must own the conversation and be permitted to access the requested business data. If the prototype uses one common data scope for all users, the data owner must explicitly authorize that scope for all provisioned users. Otherwise, server-side data filtering must enforce each user's allowed scope. A shared warehouse credential is not evidence that every user is entitled to every row.

## 3. Experience structure and primary journeys

### 3.1 Screen and state inventory

These are functional destinations or significant states, not final visual designs. The canvas and profile can be panels or overlays rather than independent routes.

| ID | Screen or state | Required content and behavior |
| --- | --- | --- |
| SCR-01 | Login | Sign-in fields, submit action, validation, submitting state, and unsuccessful-login feedback. |
| SCR-02 | Empty workspace / new chat | Header, account menu, chat sidebar, New chat action, empty conversation area, and composer. |
| SCR-03 | Active conversation | Chat history, rendered Markdown answers, input composer, processing/error states, and optional report previews. |
| SCR-04 | Conversation with report canvas | Selected report title, context, full column set, paginated rows, loading/error/empty states, and close control. |
| SCR-05 | Basic profile | Avatar, display name, first name, last name, email, designation, and department; return to workspace. |

The account/avatar menu is a shared shell component. It exposes **Profile** and **Log out**. A Settings label is acceptable only if it opens the implemented basic profile view; do not display nonfunctional settings actions.

On a wide screen, the left sidebar, central conversation, and expanded right-side canvas can coexist. On a narrow screen, the sidebar becomes a drawer and the canvas may occupy the main content area. Closing it returns to the same conversation and reading position. Final breakpoint and panel dimensions are design decisions, not established measurements.

### 3.2 Primary journeys

**J-01 — Ask a KPI question.** Sign in → create a chat → type a question → submit → see the submitted message immediately → see processing feedback → receive a rendered Markdown answer.

**J-02 — Ask by recording.** Open the composer → start recording → stop → transcribe → review or edit the transcript → submit → receive the same kind of answer as a typed question. The saved user message is the submitted transcript.

**J-03 — Open a report.** Ask for a detailed report → receive a Markdown summary with a compact attachment preview → open the preview → inspect columns and pages in the canvas → close it → continue the chat.

**J-04 — Resume work.** Return to the application → sign in if required → select a previous chat → read its messages and reopen the original attached report snapshot.

**J-05 — Review identity and leave.** Open the avatar menu → view the read-only profile → return to the workspace or select Log out → return to Login.

## 4. Functional requirements

### 4.1 Authentication, shell, and profile

**FR-01 — Login [Brief].** Provide a login screen. Successful authentication opens the workspace; an unsuccessful attempt produces a clear error without revealing whether an account exists. The proposed login method is recorded in D-01.

**FR-02 — Protected resources [Derived].** Only authenticated users may create, list, read, or modify their chats and access associated messages or attachments. Enforce authentication, ownership, and relevant data permission on the server for every operation. A manually altered URL or identifier must not bypass these checks.

**FR-03 — Logout and session expiry [Brief / Derived].** The avatar menu must offer logout. Logout ends the session, clears sensitive in-memory state, closes any canvas, and returns to Login. An expired session blocks further access and requests reauthentication. Late AI or report responses must not reappear after logout. Logout does not delete saved history.

**FR-04 — Application shell [Brief].** Provide a top navigation/header area that identifies the application and signed-in user, a left chat sidebar, and a central conversation area. The sidebar provides New chat and existing chats. The shell remains available when moving between conversations and the basic profile.

**FR-05 — Basic profile [Brief / Default].** Show avatar, display name, first name, last name, email address, designation, and department. Use initials when no avatar exists and an explicit empty-value label when designation or department is unavailable. The prototype profile is read-only; no save action or account-editing workflow is required.

### 4.2 Chat lifecycle and typed input

**FR-06 — Create independent chats [Brief].** New chat opens a blank conversation with an enabled composer. The first submitted message creates a persistent chat. An unsent blank draft need not appear in the history list. A new chat must not inherit another chat's messages, filters, or report context.

**FR-07 — Order by activity [Brief / Default].** List the user's chats by most recent persisted user or assistant message, newest first. Opening a chat, reading it, or opening its canvas does not change its position. Use a deterministic tie-breaker when timestamps match.

**FR-08 — Identify chats [Default].** Create a plain-text sidebar title from the first submitted message, limited to approximately 60 characters. Use New chat while the first submission is pending. Remove Markdown syntax and avoid rendering user-provided markup in titles. Manual renaming is outside scope.

**FR-09 — Retain and reopen history [Derived].** Persist chats, ordered messages, and their attachment references on the server. Reloading or returning after logout must restore completed conversations and their report snapshots. Client-only storage is not sufficient for the integrated prototype. Message ordering must remain stable after a refresh.

**FR-10 — Submit typed messages [Brief].** Provide a multiline text input and a clear Send control. Reject whitespace-only and over-limit submissions with useful feedback. Enter sends; Shift+Enter inserts a line break. Respect input-method composition so that composing text does not accidentally submit it. The configured input limit must be visible when relevant.

**FR-11 — Pending work and submission control [Derived / Default].** Show the submitted user message immediately, then show a pending/processing state until an answer or failure is available. Allow one active AI request per chat. Prevent repeated clicks from creating duplicates; the user may draft the next question while a reply is pending. Other chats remain usable, and any response belongs to its originating chat even after navigation.

**FR-12 — Same-chat follow-ups [Derived].** Use relevant conversation context within the current chat. A follow-up such as “And how many did that person win?” must retain a previously resolved person and period when unambiguous. A new chat starts with no such context. If earlier context cannot be retained or resolved reliably, ask a clarifying question rather than guessing.

### 4.3 Recorded input

**FR-13 — Record speech [Brief / Derived].** Provide microphone start, recording indicator with elapsed time, stop, and cancel controls. Request microphone access only when recording is initiated. Enforce the configured duration limit, stop safely, and release the microphone after stopping or canceling. Switching chats must not silently attach a recording to a different conversation.

**FR-14 — Transcribe, review, then send [Default].** Stopping a recording sends the captured audio for transcription. Put the returned transcript into the composer for review and editing; do not send the question automatically. The user explicitly sends it or discards it. If the composer already contains text, preserve it and append the transcript for review rather than silently replacing the draft. Once sent, it appears as a normal text message, with an optional voice-input indicator. The AI answers the submitted transcript, not an earlier unedited version.

**FR-15 — Voice failure and fallback [Derived].** Handle denied microphone permission, unavailable input device, unsupported recording, empty or unintelligible speech, transcription failure, and timeout. Explain the issue and keep typing available. A failed or canceled transcription must not create a chat message. A transcript arriving after cancellation or a chat switch must not overwrite another draft.

**FR-16 — Audio handling [Default].** Keep raw audio only as temporary transcription input; do not retain it in chat history. Delete application-held temporary audio after completion, cancellation, or failure. Document the selected transcription provider's handling separately. No audio playback or speech-response feature is required.

### 4.4 AI answers and data behavior

**FR-17 — Always-rendered Markdown [Brief].** Each completed assistant reply contains a nonempty Markdown body, rendered with supported headings, paragraphs, emphasis, lists, links, and code formatting. There is no switch between raw text, HTML, and Markdown. Clarifications, no-data answers, and AI-authored explanations of limitations also use Markdown. Application controls and status labels are not assistant replies.

**FR-18 — Supported business questions [Brief / Derived].** Support the agreed bid/KPI scenarios in Section 5 using an authorized analytics adapter over available Gold-layer reporting data. Metrics, filters, and numeric results must come from validated data operations. The language model may explain results; it must not invent values or treat its general knowledge as the warehouse.

**FR-19 — Clarify or decline unsupported requests [Derived].** Clarify materially ambiguous people, metrics, date bases, or reporting definitions before querying. For unsupported data, metrics, or capabilities, explain the limitation without fabricating a result or presenting a nonfunctional feature. Do not promise unrestricted ad hoc analysis beyond the configured dataset and question scope.

**FR-20 — Distinguish result conditions [Derived].** Distinguish a valid zero count, a valid empty report, missing/incomplete data, access denial, a failed data query, and an AI-service failure. A failed query must never become “0 bids.” Explain partial coverage explicitly. State the effective date range and material filters in the answer; include available source freshness information without inventing a refresh time.

### 4.5 Report attachment and canvas

**FR-21 — Attach structured reports [Brief].** A detailed-report answer contains a Markdown summary and an associated table artifact, not a large report embedded entirely in the chat body. A scalar KPI answer does not require an attachment. The baseline supports one table attachment per answer; the structure may allow additional types later without exposing them now.

**FR-22 — Compact preview [Brief / Default].** Render an attachment card with title, table-type cue, row-count or truncation status, and a small actual-data preview. Default to up to three rows and four columns. Indicate additional columns where relevant and provide an explicit Open report action. Do not present the preview as the full dataset.

**FR-23 — Expand and close [Brief].** Clicking the attachment preview or Open report opens the selected table in a canvas associated with that chat. Show report title, period/filter context, source/query timing when available, and a close control. Opening another attachment replaces the selected canvas content. Closing it preserves the conversation, report association, and reading position.

**FR-24 — Read-only table navigation [Derived / Default].** The canvas displays all returned column headers, typed cell values, total available snapshot rows, page position, and pagination controls. Support horizontal scrolling for wide reports and vertical scrolling as needed. Keep header labels accessible while inspecting rows. Preserve identifiers, dates, numeric precision, currency codes, and null values; do not replace null with zero. Editing, export, interactive filtering, and user-controlled sorting are not required.

**FR-25 — Stable report snapshots [Derived].** The preview and canvas must use the same persisted result snapshot. Reopening a report must not silently rerun the query against changed warehouse data. The summary and report must use consistent metric definitions, filters, authorization scope, and query context. Report counts distinguish the full matching result from any capped snapshot and from the current displayed page. A fresh request creates a new result.

**FR-26 — Attachment availability and errors [Derived].** Provide loading, valid-empty, unavailable, unauthorized, and load-failed canvas states. Failure to open an attachment must leave the existing conversation usable. Recheck access before serving cached report rows; owning an old chat does not override revoked data access. Show a retry action only for recoverable failures.

### 4.6 Recovery and operational behavior

**FR-27 — Safe retry and refresh [Derived].** Track the request behind each submitted message. A network retry must not create another user message or duplicate successful answer. After refresh, recover the request's known state rather than assuming success or resubmitting automatically. If completion cannot be established, show an interrupted state and let the user explicitly retry the same failed turn. Track attempts so a late result from a timed-out or superseded attempt cannot publish a second answer. Never execute a warehouse write as part of retry.

**FR-28 — Clear, operable states [Derived].** Distinguish idle, recording, transcribing, ready-to-send, processing, completed, empty, and failed states. Every visible control must work or be disabled with a meaningful reason. Provide keyboard-operable menus, composer, report opening/closing, and pagination, with visible focus and readable labels. Announce major processing/error changes accessibly without moving focus unexpectedly.

## 5. Business-data rules and supported scenarios

### 5.1 Minimum supported question set

| Scenario | Expected result | Required semantic agreement |
| --- | --- | --- |
| “How many bids were created last month?” | A Markdown answer containing the count and exact reporting period. | Unique bid definition, creation-date field, reporting timezone, and exclusions. |
| “How many bids did [person] create in the past seven days?” | A count for the resolved person and period; grouped results when several people are requested. | Person identity, created-by field, and handling of duplicate names. |
| “How many bids did [person] win in the past seven days?” | A won-bid count based on the agreed win event and person role. | Meaning of won, win-date field, won-by/credited-person mapping, and reversals. |
| “Show the report of bids created in the past seven days.” | A Markdown summary and table attachment with the agreed report columns. | Report grain, included columns, default ordering, filters, and allowed row scope. |
| “And what about the previous month?” | A new answer using relevant same-chat context with an explicitly changed period. | Unambiguous retained metric/person context. |

A request for “the bids report for last week” needs an agreed default date basis. Without one, the assistant asks whether the report concerns bids created, won, or another defined event. It must not silently pick one.

### 5.2 Metric and dataset contract

Before live-data acceptance, the data owner must provide the approved dataset/view, its row grain, unique identifier, metric definitions, date and person-field mappings, status mappings, exclusions, null handling, and permission scope. Existing report documentation may satisfy this requirement; do not create a second conflicting definition.

Count distinct business bids where the source can contain multiple rows per bid. A count of won bids must use the agreed win date, not the creation date by convenience. Creation credit, ownership, and win credit are not interchangeable. If a required field is absent, that scenario remains unsupported until an alternative definition is explicitly supplied.

Return separate created and won counts when both are requested. Do not add them into a unique-bids total unless overlap is handled according to an agreed definition. Do not combine amounts in different currencies without an agreed conversion rule. Currency is irrelevant to pure bid counts but must be preserved in report rows.

An illustrative ten-column report could contain Bid ID, Bid title, Created at, Created by, Bid owner, Status, Won at, Won by, Bid amount, and Currency. This is a proposed demonstration schema, not evidence that these columns exist. Actual column names, availability, and order come from the approved Gold-layer contract.

### 5.3 Date interpretation

Use one configured reporting timezone. Do not silently substitute the user's device timezone. Resolve a relative period once when the request is accepted, and retain that resolved range through processing and retries.

The proposed defaults are: **last month** means the previous complete calendar month; **last week** means the previous complete Monday–Sunday week; **past seven days / last one week** means the seven complete reporting dates before today, excluding the current partial day. Explicit dates override these defaults. Display the actual dates used, so users can correct a different intended interpretation.

Use inclusive start and exclusive end boundaries internally and convert them consistently for the source timestamps. For a synthetic demonstration with today fixed at 16 September 2026 in UTC, last month is 1–31 August 2026, and the past seven days are 9–15 September 2026. These are fixture examples, not the client's reporting configuration.

### 5.4 Provenance and honest results

Distinguish **queried at** from **data updated through**. The first is the execution time; the second is a source-provided freshness value and may be unknown. Store applied filters and the resolved period with each answer/report. Identify synthetic mode persistently in the interface and in its report metadata; synthetic results must not look like live business results.

Calculate scalar totals over the full authorized query result, not over preview rows, the visible page, or a capped report snapshot. When a report cap is reached, disclose it in both the attachment and canvas. If the exact total matching count is unavailable, say that additional rows exist rather than inventing a total.

## 6. Logical system design and execution

### 6.1 Components

| Component | Responsibility |
| --- | --- |
| Web client | Login, shell, chat navigation, composer, recording controls, Markdown rendering, table preview, canvas, and profile. |
| Application backend | Authentication enforcement, resource ownership, request lifecycle, conversation orchestration, validation, and API responses. |
| Persistent application store | Users or identity references, chats, messages, request state, artifact metadata, and bounded report snapshots. |
| AI adapter | Interpret supported questions, identify missing information, and produce Markdown grounded in validated results. |
| Analytics adapter | Map approved intent and filters to read-only, permission-scoped Gold-layer queries; return typed results and provenance. |
| Transcription adapter | Convert temporary audio to text and return actionable failures. |

These are logical responsibilities, not a requirement for separate services or repositories. One application and a persistence store, with adapters for external services, are sufficient. This specification does not select a framework, database engine, AI model, transcription provider, warehouse vendor, or cloud platform.

### 6.2 Request execution

The backend authenticates the user and authorizes the chat, persists the submitted question, and creates a request record. It resolves same-chat context and validates the requested metric, person, period, and scope. If a necessary detail is missing, it publishes a Markdown clarification without executing a speculative data query.

For a supported question, the analytics adapter executes approved read-only query logic with validated parameters and server-derived access scope. The resulting values, typed rows, filters, and provenance are supplied to the answer-generation step. The backend constructs artifact metadata from actual results; the language model does not invent attachment identifiers, column schemas, or row counts.

The system persists the completed Markdown message and any associated snapshot before marking the request complete. The client renders the answer and attachment preview. Opening the canvas retrieves authorized pages of that same snapshot.

If valid data cannot be obtained, publish the appropriate limitation/error state, not an unsupported number. If a requested table cannot be persisted, do not publish a working-looking attachment. A valid scalar answer may still be shown only if it clearly states that the requested report is unavailable.

### 6.3 Integration guardrails

Use an allowlisted set of metrics, report definitions, and query parameters for the first prototype. Do not execute arbitrary SQL generated by a model or supplied in a chat message. Gold-layer access is read-only; credentials and service secrets remain server-side.

Treat text from warehouse rows and model responses as untrusted content, not as instructions to change permissions or tool behavior. Keep browser payloads limited to the user's authorized result. Do not expose internal prompts, credentials, connection strings, or unrestricted warehouse tools in the UI.

## 7. Application data and response contracts

Field names below are proposed interface names, not a required physical database schema. IDs must be stable. All timestamps must carry an unambiguous timezone/offset.

### 7.1 Persistent entities

| Entity | Minimum fields and relationships |
| --- | --- |
| User / identity profile | ID; identity-provider reference if used; first/last/display name; email; optional avatar, designation, department; server-resolved data-scope reference. |
| Chat | ID; owner user ID; title; created timestamp; last activity timestamp. |
| Message | ID; chat ID; sequence; user/assistant role; body format; body content; created timestamp; request ID; user input mode where applicable. |
| Request | ID; chat ID; user-message ID; idempotency key; active attempt identifier; queued/running/completed/failed/interrupted state; result message ID; safe error code; start/end timestamps; resolved query context. |
| Table artifact | ID; owner/chat/assistant-message references; title; type; typed columns; snapshot reference; snapshot row count; optional total matching count; truncation status; filters; provenance; ordering; permission scope reference. |

For user messages, store the submitted text, including the final edited transcript, with input mode typed or voice. For assistant messages, body format is always `markdown`. Keep the table's structured data separate from Markdown. A successful request has one terminal assistant reply; transport retries do not create additional replies.

### 7.2 Table contract

Each column has a stable key, business-facing label, and data type such as text, identifier, integer, decimal, date, timestamp, boolean, or currency. Include necessary formatting metadata, including currency code and precision where relevant. Represent empty values explicitly; preserve identifiers with leading zeros.

Rows use the declared column keys. `snapshotRowCount` is the number of rows retained for the attachment. `totalMatchingRowCount` is the exact authorized query total when known, otherwise null. `isTruncated` states whether additional matching rows were omitted by a configured limit. Never label the current page length as the report total.

The preview is a subset of the persisted snapshot. Page requests include a stable page/cursor and return the same column schema, rows, available snapshot count, and next-page information. The backend uses deterministic ordering. A report snapshot is retained with its parent chat for the prototype; reopening it does not refresh it.

### 7.3 Illustrative successful response

The following example uses fictional IDs and a synthetic two-row result. It shows the shape of the response, not actual business data. The artifact-detail endpoint supplies the typed columns, preview rows, snapshot pages, and complete provenance.

```json
{
  "requestId": "req_demo_001",
  "chatId": "chat_demo_001",
  "status": "completed",
  "assistantMessage": {
    "id": "msg_demo_002",
    "bodyFormat": "markdown",
    "bodyMarkdown": "**2 bids** were created in August 2026.\n\nSynthetic demo data; reporting timezone: UTC. Open the attached report for details.",
    "attachments": [
      {
        "id": "table_demo_001",
        "type": "table",
        "title": "Bids created: 1–31 August 2026",
        "snapshotRowCount": 2,
        "totalMatchingRowCount": 2,
        "isTruncated": false
      }
    ]
  }
}
```

For a Markdown-only answer, `attachments` is an empty list. The list form does not expand the baseline beyond one attachment per assistant answer. A technical request failure uses the request error state rather than a fabricated successful assistant response.

## 8. Logical application interfaces

The routes below are a proposed interface contract; the implementation may use equivalent routes without changing behavior. All resource endpoints enforce the access model in Section 2.3. Do not accept a browser-supplied user ID as proof of identity.

| Interface | Responsibility |
| --- | --- |
| POST `/api/auth/login` | Establish the prototype session from valid credentials, or use the selected identity flow. |
| POST `/api/auth/logout` | Invalidate the current session. |
| GET `/api/me` | Return the authenticated user's permitted profile fields. |
| GET `/api/chats` | Return only the user's chats, ordered by last activity. |
| POST `/api/chats` | Create an owned chat when the first question is submitted. |
| GET `/api/chats/{id}/messages` | Return ordered messages, attachment descriptors, and active request status. |
| POST `/api/chats/{id}/messages` | Accept text plus input mode and an idempotency key; return persisted message and request identifiers. |
| GET `/api/requests/{id}` | Recover queued/running/terminal status and the completed response when available. |
| POST `/api/requests/{id}/retry` | Retry an eligible failed/interrupted turn without creating another user message. |
| POST `/api/transcriptions` | Accept bounded temporary audio and return text or a classified failure. |
| GET `/api/artifacts/{id}` | Return authorized table metadata, actual preview rows, and snapshot context. |
| GET `/api/artifacts/{id}/rows` | Return an authorized page of the persisted snapshot. |

The first-chat submission must be retry-safe across chat creation and message submission. Reuse a client submission identifier or use an equivalent atomic create-and-send operation so network loss cannot produce duplicate new chats.

The default client receives a complete final answer rather than streaming partial Markdown. It may poll request status or use an equivalent notification mechanism. Request cancellation is not a required user feature; timeouts and safe recovery are required. Login, transcription, and query failures return a safe error code, user-facing message, and whether retry is appropriate.

## 9. State and failure contract

| Situation | Required behavior |
| --- | --- |
| No existing chats | Show a usable empty workspace and composer, not an error page. |
| AI or data work pending | Preserve the user's submitted message, show progress, and prevent duplicate submission for that turn. |
| No authorized matching rows | Return a truthful zero/empty result with period and filters; an empty requested report may open in the canvas. |
| Ambiguous person or metric | Ask a Markdown clarification; do not run a guessed query. |
| Permission denied | Show a safe access limitation; do not disclose another user's chat or restricted data. |
| Data/AI timeout or failure | Show a failure attached to the original turn and a retry action when safe; never substitute invented data. |
| Report row fetch fails | Keep the answer and conversation intact; show a canvas-local error and retry. |
| Session expires | Stop sensitive access, clear protected client views, and return to Login. Retain server-side history. |
| Refresh during a request | Restore the persisted user message and recover actual request status. |
| Navigate while recording | Require cancellation/confirmation before leaving the recording context; never send to a new chat automatically. |
| Cancel during transcription | Discard the late result, clean up temporary audio, and preserve unrelated drafts. |

Errors should describe what failed and what the user can do next. Do not display stack traces, raw SQL, provider credentials, or an internal exception as the assistant's answer.

## 10. Nonfunctional requirements

**NFR-01 — Security and content rendering.** Keep secrets server-side; validate inputs and file size/duration; secure sessions; protect state-changing operations against unauthorized cross-site requests. Disable raw HTML and active content in Markdown. Render table cells as data, not executable markup. Reject unsafe link protocols and block unsolicited remote-image loading in AI answers. Restrict login and expensive AI/transcription operations with appropriate abuse controls.

**NFR-02 — Persistence and consistency.** Use durable server-side storage. Persist a complete reply and attachment references coherently, enforce request/message uniqueness, and prevent orphaned or cross-chat results. Retain request status sufficiently to distinguish an interrupted request from a successful one whose browser response was lost. After revoked access, previous cached rows must not be served merely because a snapshot exists.

**NFR-03 — Responsiveness and bounded work.** The UI must show a local submitted/pending state promptly, with a provisional target of 300 ms in the declared test environment. Page report rows rather than loading an unbounded result into the browser. For an already stored 50-row page with ten columns, target canvas usability within one second on the declared test setup. These are targets to validate, not measured performance claims; external AI/data latency is reported separately.

**NFR-04 — Accessibility and responsive behavior.** All required actions must be keyboard operable, labeled, and visibly focused. Associate table headers and data cells appropriately; provide text alternatives to status color alone. Validate the complete journey at 1440-pixel and 390-pixel viewport widths. Record actual browser versions tested; do not imply broader compatibility without testing.

**NFR-05 — Observability without data leakage.** Record request IDs, processing stages, durations, safe error categories, and integration failures. Avoid logging credentials, raw audio, full report rows, or unrestricted conversation contents by default. Support diagnosing a failed turn without exposing another user's data.

**NFR-06 — Testability and scope discipline.** Keep AI, transcription, and analytics adapters replaceable by deterministic test fixtures. Verify integration contracts independently of visual styling. Do not add dashboards, administration, report builders, or additional artifact types as prerequisites for completing the stated prototype.

## 11. Proposed defaults and decision log

The following decisions make the specification executable without an approval round. They are provisional choices, not newly discovered client facts.

| ID | Default | Reason and boundary |
| --- | --- | --- |
| D-01 | Pre-provisioned email/password accounts; one application role. | Demonstrates login and logout without registration or account administration. An existing identity integration may replace it. |
| D-02 | Read-only profile; initials fallback for missing avatar. | Covers the requested identity review without an editing workflow. |
| D-03 | Speech-to-text followed by review and explicit Send. | Keeps both input paths consistent and prevents accidental submission of a mis-transcription. |
| D-04 | Auto-title from first message; activity-based chat ordering. | Makes multiple chats usable without extra management features. |
| D-05 | Complete responses; one active request per chat. | Reduces prototype complexity while retaining clear progress and safe retries. |
| D-06 | One table per answer; right-side desktop canvas and narrow-screen main-area view. | Delivers expanded report reading without a general-purpose artifact workspace. |
| D-07 | Preview up to 3 rows / 4 columns; canvas pages of 50 rows. | Makes detail discoverable without cramming it into the conversation. |
| D-08 | Persist report snapshots; provisional cap of 5,000 rows per attachment. | Keeps reopening stable and storage bounded. Disclose truncation and ask the user to narrow an oversized report. |
| D-09 | Past seven days excludes today; last week is the prior Monday–Sunday week. | Removes a common ambiguity while showing the resolved dates in each answer. |
| D-10 | UTC and a fixed clock for synthetic tests only. | Provides deterministic fixtures. The live reporting timezone must come from the data owner. |
| D-11 | 4,000-character submitted text limit; 120-second recording limit. | Bounds prototype inputs. Validate provider-specific byte limits and show relevant limits to users. |
| D-12 | 30-second transcription timeout; 90-second overall answer timeout. | Ensures visible recovery rather than an indefinite spinner. These are configurable test defaults, not provider guarantees. |
| D-13 | Retain chats and snapshots until an operator resets the prototype dataset. | Enables return visits without adding retention-management or delete screens. Final retention/data-handling terms remain an integration input. |

A changed default must be recorded in the implementation decision log and reflected in affected screens and acceptance tests. Changes to business meaning, permissions, or the core Markdown-plus-attachment behavior are not merely visual adjustments.

## 12. Dependencies, delivery modes, and unresolved inputs

### 12.1 Inputs needed for live acceptance

| Input | Needed from | Consequence if absent |
| --- | --- | --- |
| Approved Gold-layer view and read-only connectivity | Data/integration owner | Use synthetic analytics fixtures; do not claim warehouse integration. |
| Metric definitions, grain, dates, people/status mappings, report columns | Business/report owner | Affected questions remain synthetic or unsupported; do not infer business meaning. |
| User data-access scope | Data/security owner | Do not expose real warehouse data to prototype users. |
| Reporting timezone and available freshness metadata | Business/data owner | Use labeled fixture defaults only; live periods remain unresolved. |
| Provisioned users and profile values | Application owner | Seed explicit demo accounts/profiles; do not invent real employee details. |
| AI and transcription services, credentials, and data-handling constraints | Technical owner | Use declared test adapters; recorded input is not live-validated without actual transcription. |
| Hosting, persistence, supported test browsers, and network access | Technical owner | Run locally or in a declared demo environment; no deployment-readiness claim. |
| Brand kit or approved visual direction | Design owner | Use neutral styling until the screen specification supplies brand guidance. |

### 12.2 Delivery modes

**Synthetic demonstration mode** can implement all screens, interaction states, persistence, and deterministic answers against clearly labeled fictional fixtures. It is suitable for experience review and automated tests. A simulated microphone or canned transcript does not prove that actual recording/transcription works and must be labeled accordingly.

**Integrated prototype mode** connects real authentication, actual microphone/transcription behavior, an AI service, and approved read-only Gold-layer data. The defined KPI/report scenarios must pass against verified reference queries before the prototype is described as live-data capable. Never silently replace a failed live query with synthetic data.

Unresolved provider, schema, or brand details do not prevent interface and contract implementation with fixtures. They do prevent claiming that the corresponding live integration has passed. This specification is sufficient for design and implementation planning; live-data acceptance requires the listed inputs.

## 13. Acceptance criteria and verification matrix

Test against a controlled fixture dataset, then repeat the applicable data tests against approved reference queries in integrated mode. Each criterion below must have a recorded pass/fail result and evidence. Synthetic and integrated results must be distinguishable.

**AC-01 — Protected entry.** Given no valid session, opening the workspace or calling a chat/report endpoint requires authentication and reveals no protected content. Valid credentials open SCR-02; invalid credentials give safe feedback. **Covers:** FR-01–02; SCR-01–02.

**AC-02 — Two-user isolation.** Given User A and User B, neither can list, read, modify, or open the other's chats, messages, requests, or artifacts by changing identifiers. Authorized data scope is also enforced. **Covers:** FR-02, FR-26; SCR-03–04.

**AC-03 — Multiple chats and recency.** Create at least three chats, send a new message in an older chat, and verify that it moves to the top. Merely opening another chat or its canvas does not reorder it. Blank unsent drafts do not accumulate as saved chats. **Covers:** FR-06–08; SCR-02–03.

**AC-04 — Persistence.** After a completed conversation and attached report, refresh and then log out/in. Verify that messages remain correctly ordered and the same report snapshot reopens. **Covers:** FR-09, FR-25; SCR-03–04.

**AC-05 — Typed submission and Markdown.** Submit a valid typed question and see one user message, a pending state, and one rendered Markdown answer. Exercise emphasis, lists, headings, and links. Reject empty/over-limit input; verify Enter, Shift+Enter, and text-composition behavior. **Covers:** FR-10–11, FR-17; SCR-03.

**AC-06 — Context boundaries.** Ask about a named person and period, then ask a clear follow-up. Verify appropriate context reuse. Ask the same follow-up in a new chat and verify that it does not inherit the previous chat's person or period. **Covers:** FR-06, FR-12, FR-19; SCR-02–03.

**AC-07 — Actual recorded-input journey.** Record speech, stop, edit the transcript, and send it. Verify that only the edited text is submitted and persisted and that the microphone is released. Confirm that stopping recording alone does not submit a question. **Covers:** FR-13–14, FR-16; SCR-03.

**AC-08 — Voice failures and cancellation.** Exercise denied permission, no speech, transcription failure, duration limit, and cancellation during transcription. Typing remains possible; no unintended message appears; late results do not contaminate another chat. Verify temporary-audio cleanup. **Covers:** FR-13–16; SCR-03.

**AC-09 — Monthly created count.** Compare the monthly count with an approved reference result using boundary timestamps and repeated source rows for one bid. Verify distinct-bid counting and the exact disclosed reporting period. **Covers:** FR-18, FR-20; SCR-03; Section 5.

**AC-10 — Person and won-date semantics.** Include bids created outside the selected period but won inside it, and distinguish creator, owner, and win-credit person. Verify the created and won questions use their respective approved fields, with no accidental double-counted combined total. **Covers:** FR-18–19; SCR-03; Section 5.

**AC-11 — Ambiguity and unsupported requests.** Use duplicate person names, an undefined KPI, and an ambiguous report date basis. Verify clarification or a truthful limitation rather than a guessed data query or fabricated result. **Covers:** FR-19; SCR-03.

**AC-12 — Zero versus failure.** Compare a valid zero-count result, a valid empty report, missing coverage, access denial, and an unavailable warehouse. Only the actual zero result may be stated as zero. **Covers:** FR-20, FR-26; SCR-03–04.

**AC-13 — Attachment preview and full canvas.** Request a report with at least ten columns and more than one page of rows. Verify a compact real-data preview, a working Open report action, all column headers in the canvas, horizontal scrolling, and correct pagination. **Covers:** FR-21–24; SCR-03–04.

**AC-14 — Closing and reopening.** Open a report, navigate its rows, close it, and continue chatting. Verify preserved conversation position, no unintended chat reordering, and correct attachment selection when another report is opened. **Covers:** FR-07, FR-23, FR-25; SCR-03–04.

**AC-15 — Snapshot and count truthfulness.** Change the underlying fixture after producing a report and verify that reopening shows the original snapshot. Test more than 5,000 matching rows, exact-total and unknown-total cases, and null/currency/identifier formatting. Full KPI totals must not be calculated from capped or preview rows. **Covers:** FR-24–25; SCR-04; Section 5.

**AC-16 — Retry and refresh integrity.** Interrupt the first-chat submission, an in-flight request, and the delivery of a successful answer. Refresh or retry as appropriate. Verify no duplicate chat, user message, or successful assistant answer and no permanently unexplained spinner. **Covers:** FR-11, FR-27; SCR-02–03; Section 8.

**AC-17 — Logout and revoked access.** Log out while a response is pending and confirm that no late protected content appears. Revoke report/data access and confirm that cached artifact endpoints no longer serve the rows. **Covers:** FR-03, FR-26; SCR-01, SCR-04.

**AC-18 — Profile completeness.** Open the profile and verify every requested field, initials for a missing avatar, and a clear unavailable label for missing optional values. No nonfunctional edit or save control appears. **Covers:** FR-04–05; SCR-05.

**AC-19 — Canvas-local failure.** Cause an attachment page request to fail. Verify a useful canvas-local error, safe retry, and a still-usable conversation. An empty report must instead show a valid-empty state. **Covers:** FR-26, FR-28; SCR-03–04.

**AC-20 — Safe rendering and tool boundaries.** Supply Markdown/table values containing scripts, unsafe links, remote images, and text asking to override permissions. Verify no active content executes, no unauthorized external load occurs, and no unrestricted query or warehouse write is executed. **Covers:** FR-02, FR-17–18, FR-24; NFR-01; Section 6.3.

**AC-21 — Keyboard, narrow screen, and responsiveness.** Complete login, chat selection, text submission, profile access, and report open/close/pagination by keyboard. Repeat the core journey at the two target viewport widths and record performance targets and browser versions. **Covers:** FR-04, FR-23–24, FR-28; NFR-03–04; SCR-01–05.

**AC-22 — Mode and provenance honesty.** Verify a visible synthetic-mode label when fixtures are used. In integrated mode, confirm the configured reporting timezone, query timestamp, available freshness information, and no silent substitution of demo data after a service failure. **Covers:** FR-18–20, FR-25; SCR-03–04; Sections 5 and 12.

## 14. Handoff and completion requirements

### 14.1 Design handoff

Use this document together with the relevant brand kit to produce the screen-by-screen specification. Preserve screen IDs and map every applicable FR/AC to a screen, shared component, backend behavior, or explicitly unresolved integration. Cover empty, populated, processing, recording, transcribing, clarification, no-data, error, canvas-open, profile, and expired-session states.

Specify visual hierarchy and responsive behavior without adding charts, dashboards, application settings, or other excluded features. Treat report columns as data-driven, not hardcoded measurements inferred from an example. The system specification remains the authority for functionality; the brand kit governs expression.

### 14.2 Build handoff

The implementation must include the working application, durable persistence, logical interfaces/adapters, environment/setup instructions, a synthetic fixture dataset, demo accounts without embedded production credentials, and a short record of decisions differing from Section 11. Keep integration configuration and secrets outside client code.

The test package must include reference results for the supported KPI scenarios, at least two users, multiple chats, ambiguous names, date-boundary records, zero/empty cases, a ten-column multi-page report, truncation cases, missing profile values, and injected service failures. Include automated tests for ownership, data semantics, response contracts, request uniqueness, and stable report paging.

### 14.3 Definition of done

The prototype is complete in its declared delivery mode when the required journeys work end to end, every applicable acceptance criterion has recorded evidence, report data and AI statements agree, no required control is merely decorative, and remaining live-integration limitations are explicit.

A polished static interface alone is not an integrated prototype. Conversely, production-only capabilities excluded here are not prerequisites for accepting this bounded prototype.
