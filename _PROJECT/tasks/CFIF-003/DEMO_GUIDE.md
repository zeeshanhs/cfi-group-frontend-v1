# Data Insights Chat — Demonstration Guide

This guide runs a local, fictional prototype. It is not connected to a CFI identity service, live business data, a warehouse, an AI/LLM service, a microphone, or a transcription provider. The interface labels the experience **Synthetic demo · Fictional data · Reporting timezone: UTC**. Do not present its people, properties, counts, or reports as real CFI records.

## 1. Local setup and clean reset

From the repository root:

```bash
npm install
cp _PROJECT/data/reporting/cfi_reporting.sqlite /tmp/cfi-data-insights-demo.sqlite
CFI_DATA_INSIGHTS_DB_PATH=/tmp/cfi-data-insights-demo.sqlite npm run dev
```

Open `http://localhost:3000/login`. The application applies its idempotent chat migration and fictional account seeds when the local database is first opened.

The `/tmp` copy is the persistent demonstration database: chats, messages, requests, sessions, and report snapshots survive refreshes and server restarts. Automated tests create separate temporary databases and never use this copy or mutate the checked-in database.

To reset the demonstration, stop the development server, replace only the disposable copy, and restart:

```bash
cp _PROJECT/data/reporting/cfi_reporting.sqlite /tmp/cfi-data-insights-demo.sqlite
CFI_DATA_INSIGHTS_DB_PATH=/tmp/cfi-data-insights-demo.sqlite npm run dev
```

Do not hand-edit the checked-in SQLite database. To validate the reporting loader and chat-table preservation separately, run:

```bash
python3 -m unittest _PROJECT.tests.test_reporting_database
```

## 2. Fictional local accounts

These credentials are local, fictional, and non-production.

| Profile | Email | Password | Expected optional fields |
| --- | --- | --- | --- |
| Jordan Ellis | `jordan.ellis@cfi-demo.example` | `CFI-Demo-2026!` | Designation: Business Development Manager; Department: Estimating |
| Riley Chen | `riley.chen@cfi-demo.example` | `CFI-Demo-2026!` | Designation and Department: Not provided |

Use Jordan for the primary walkthrough. Riley exists to demonstrate account isolation and missing optional profile values.

## 3. Primary report journey

1. Sign in as Jordan Ellis.
2. Choose **New chat**.
3. Send exactly: **Show the report of bids created in the past seven days.**
4. Observe one pending state, followed by a Markdown answer stating **64 bids** for **9–15 September 2026** and a report attachment with **64 rows · 10 columns**.
5. In the compact preview, verify the first three Bid IDs are `000064`, `000063`, and `000062`.
6. Choose **Open report**. Confirm the title **Bids created: 9–15 September 2026**, the UTC/date/filter context, all ten reachable columns, and **Rows 1–50 of 64 · Page 1 of 2**.
7. Choose **Next page**. Confirm **Rows 51–64 of 64 · Page 2 of 2** and 14 rows.
8. Expand **Report details** and verify:
   - Data mode: Synthetic fixtures — not live business data
   - Reporting timezone: UTC
   - Date basis: Bid creation timestamp
   - Period start: 2026-09-09 00:00:00 UTC
   - Period end (exclusive): 2026-09-16 00:00:00 UTC
   - Snapshot rows / Total matching rows: 64 / 64
   - Ordering: Created at descending; Bid ID descending
9. Choose **Close report** (or **Back to conversation** at narrower widths). Confirm the conversation and draft remain in place and focus returns to the report-opening action.
10. Reopen the report: it resumes the remembered page during this browser session. Refresh the page, then log out and sign in again. Reopen the saved chat and report; it is the same persisted 64-row snapshot. A fresh login may begin at page 1 unless the authorized report URL still specifies another valid page.

Important display checks: Bid IDs retain leading zeros; `—` means no value was supplied and is not zero; `0.00` remains zero; amounts retain supplied precision; currency remains a separate `USD`/`CAD` code; timestamps are displayed in UTC. The table itself scrolls horizontally—columns are not compressed or replaced with cards.

## 4. Same-chat context and new-chat isolation

In one new chat, send these two messages in order:

1. **How many bids did Casey Patel create in the past seven days?**
   - Expected: **Casey Patel created 18 bids** from **9–15 September 2026**.
2. **And how many did that person win?**
   - Expected: **Casey Patel won 7 bids**. The answer explains that two were created before the reporting period and that created and won counts are separate measures.

Then choose **New chat** and send only:

**And how many did that person win?**

Expected: a Markdown clarification asking which person and reporting period to use. The new chat must not inherit Casey Patel or the prior period.

## 5. Additional exact messages

Send each message exactly as written. The prior-month follow-up must be in the same chat immediately after its August question; the Alex selection must follow its clarification in the same chat.

| Exact message | Expected deterministic outcome |
| --- | --- |
| **How many bids were created last month?** | 42 distinct bids for 1–31 August 2026. |
| **And what about the previous month?** | 28 bids for 1–31 July 2026. |
| **How many bids did Casey Patel and Morgan Reed create in the past seven days?** | Markdown list: Casey 18; Morgan 10. |
| **How many bids did Alex Morgan create in the past seven days?** | Clarification listing Alex Morgan — Estimating, East and Alex Morgan — Commercial Accounts, West; no guessed count. |
| **Alex Morgan in Estimating, East.** | 16 bids in the existing clarification context. |
| **Show bids created from 1 to 7 June 2026.** | A valid zero-row answer and ten-column empty report. The canvas says **No matching bids** and **0 rows · No pages**; this is not a failure. |
| **Create a dashboard and export this report.** | A truthful unsupported-capability answer; no dashboard or export control appears. |

## 6. Simulated recorded-input journey

No audio is captured, uploaded, retained, played, or transcribed. This demonstrates UI and API state handling only; it does not demonstrate transcription accuracy.

1. In a new chat, optionally type a short preface into **Your question**.
2. Choose **Record**. Confirm the UI says **Simulated recording · no microphone access** and shows the elapsed time with **Stop recording** and **Cancel**.
3. Choose **Stop recording**. Observe **Transcribing…** and **Cancel transcription**.
4. The fixed transcript is appended, not substituted for any text already present: **How many bids did Casey Patel create in the past seven days?**
5. Confirm **Transcript added. Review it before sending.** Nothing has been sent and no chat is created yet.
6. Review or edit the question, then choose **Send** explicitly. The persisted user turn is marked with voice input mode by the API; only the reviewed text is saved.

Cancellation checks:

- **Cancel** during recording preserves the typed draft and creates no message.
- **Cancel transcription** preserves typing and suppresses a late result.
- Choosing New chat, another chat, Profile, report navigation, or Log out during recording/transcription opens the specified confirmation. Keeping the recording/transcription makes no navigation change.
- **Discard transcript** restores the text from immediately before the transcript was appended. If review edits would be lost, the app asks for confirmation.

## 7. Profile, refresh, and responsive demonstration

- Open the account trigger (**JE**) and choose **Profile**. Verify the read-only Jordan fields, initials fallback, and absence of Edit/Save/Settings controls. **Back to conversation** restores a prior chat/report URL; **Back to workspace** is used from an empty workspace.
- Sign in as Riley to verify **RC**, with Designation and Department both shown as **Not provided** rather than guessed values.
- Refresh while a reply is pending. The persisted request resumes and produces at most one answer.
- At approximately 1440×900, a report uses three regions: 248px history, approximately 416px conversation, and the remaining report canvas.
- From 768–1279px, history remains visible while the report replaces the conversation region.
- Near 390×844, Chats opens a focus-contained drawer and the report is full width with **Back to conversation**. The preview shows two columns and discloses eight more. Check 320px or browser zoom for readable controls and no body-level horizontal scrolling; only table regions intentionally scroll.
- Use Tab/Shift+Tab and Enter/Space to exercise sign-in, New chat, Send, Open report, paging, Profile, and Log out. Escape closes the account menu/drawer or keeps the nondestructive choice in a confirmation.

## 8. Failure and recovery demonstrations

Failure fixtures are selected only through server-side local test configuration. Stop the server and restart it with the disposable database path plus one variable below. Remove the variable and restart to return to the normal journey.

| Variable | Value | Demonstration outcome |
| --- | --- | --- |
| `CFI_DATA_INSIGHTS_FAILURE_MODE` | `data_query_failed` | Request becomes a retryable application error; no fake zero/assistant answer. |
| `CFI_DATA_INSIGHTS_FAILURE_MODE` | `answer_failed` | Answer-service failure with eligible **Retry question**. |
| `CFI_DATA_INSIGHTS_SCENARIO` | `partial_coverage` | 44 is explicitly partial for 9–13 September, not a full-period total. |
| `CFI_DATA_INSIGHTS_SCENARIO` | `access_denied` | No count/report is returned outside permitted scope. |
| `CFI_DATA_INSIGHTS_SCENARIO` | `report_save_failed` | The answer says the detailed report could not be saved; no broken attachment appears. |
| `CFI_DATA_INSIGHTS_SCENARIO` | `freshness_unknown` | Report details says **Not supplied by the data source** rather than copying query time. |
| `CFI_DATA_INSIGHTS_SCENARIO` | `cap_known` | 5,000 saved rows of 5,237 matching bids, with 237 not stored. |
| `CFI_DATA_INSIGHTS_SCENARIO` | `cap_unknown` | 5,000 saved rows; more matches exist and exact total is unavailable. |
| `CFI_DATA_INSIGHTS_ARTIFACT_PAGE_FAILURE` | `2` | Page 2 remains a local canvas error with **Retry page** and **Return to page 1**; the conversation remains available. |
| `CFI_DATA_INSIGHTS_TRANSCRIPTION_SCENARIO` | `empty` | “No clear speech was detected…”; no message. |
| `CFI_DATA_INSIGHTS_TRANSCRIPTION_SCENARIO` | `failed` | “The recording could not be transcribed…”; no message. |
| `CFI_DATA_INSIGHTS_TRANSCRIPTION_SCENARIO` | `timeout` | “Transcription took too long…”; no message or late draft update. |

Example:

```bash
CFI_DATA_INSIGHTS_DB_PATH=/tmp/cfi-data-insights-demo.sqlite CFI_DATA_INSIGHTS_ARTIFACT_PAGE_FAILURE=2 npm run dev
```

For an ownership check, obtain an artifact in Jordan's account, sign out, sign in as Riley, and request that same opaque artifact URL. The server returns a generic unavailable response without Jordan's title, counts, metadata, or rows. Do not expose session tokens or internal identifiers in presentation material.

If a session expires, the app clears protected client state and returns to Sign in with the expired-session explanation. Signing out clears unsent drafts, report/capture state, and late client work, but does not delete saved chats.

## 9. Troubleshooting

- **Port already in use:** stop the earlier development server, or follow the URL printed by Next.js when it selects another port.
- **Database path error:** `CFI_DATA_INSIGHTS_DB_PATH` must be an absolute path. Recreate `/tmp/cfi-data-insights-demo.sqlite` with the setup command.
- **A failure persists unexpectedly:** stop the server, remove the `CFI_DATA_INSIGHTS_*FAILURE*`, `CFI_DATA_INSIGHTS_SCENARIO`, or transcription scenario variable, and restart.
- **Unexpected chat history:** reset only the disposable `/tmp` copy as described in section 1.
- **Report does not open:** first confirm the assistant answer contains a saved attachment. Report-save failure and access-denied scenarios deliberately do not provide a working Open report control.

This prototype intentionally has no LLM, arbitrary SQL, live data, real audio, external identity, analytics/tracking, export, dashboard, chart, or report-editing capability.
