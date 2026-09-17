# CFIF-005 — Implement the searchable prompt library

## Objective

Add a future-ready prompt library to the Data Insights Chat after CFIF-004’s adaptive composer is complete. The feature must:

- expose a visible `Browse prompts` entry point in the centered new-chat composer and a compact accessible entry point in ongoing chats;
- load a vetted supported-prompt catalog through an authenticated application API;
- support text search, single-select category filtering, result counts, empty/error states, and draft-safe selection;
- render as an anchored nonmodal popover on desktop and an accessible modal bottom sheet on mobile; and
- use the same prompt source for starter suggestions and the browser so the interface cannot advertise unsupported behavior.

The design may scale to hundreds of prompts later, but this task must remain truthful about the small supported deterministic catalog available now.

## Prerequisite

CFIF-004 must be complete. Inspect its implemented code, task files, and any stored evidence/check notes before starting; if no separate handoff artifact exists, the repository state is the source of truth. Do not recreate or bypass its shared composer, placement variants, auto-growth, scroll anchoring, or state controls.

## Authority and sources

Read in this order:

1. `_PROJECT/tasks/CFIF-005/task_request.md`.
2. `_PROJECT/tasks/CFIF-005/implementation_plan.md`.
3. `_PROJECT/proposals/20260917-chat-screen-redesign/PROMPT_LIBRARY.md`.
4. `_PROJECT/proposals/20260917-chat-screen-redesign/SCREEN_SPECIFICATIONS.md`, especially SCR-001, SCR-003, prompt-browser accessibility, and acceptance criteria.
5. `_PROJECT/proposals/20260917-chat-screen-redesign/WIREFRAMES.md`, especially WF-02 and WF-09.
6. CFIF-004’s implemented code and task evidence, plus CFIF-003’s deterministic prompt, API, authentication, security, and simulation contracts.
7. Repository `AGENTS.md`, current code, `brand-kit/`, and applicable installed Next.js 16 documentation.

## Functional scope

### Prompt catalog

- Create one server-owned catalog containing only prompts that map to existing deterministic supported behavior.
- Every record includes a stable ID, title, exact inserted prompt text, concise description, primary category, searchable tags, availability, and curated order.
- Expose only `supported` prompts in the production response for this prototype.
- Derive visible category options from categories that contain at least one supported prompt.
- Use user-facing category labels such as `Bids`, `Account managers`, `Jobs`, `Monthly reports`, and `Weekly reports` only when a vetted supported prompt exists for that category.
- Do not expand the simulation adapter merely to fill desired categories. Missing categories are absent, not faked.

### API contract

- Add an authenticated `GET /api/prompts` Route Handler or an equivalently explicit protected endpoint.
- Return a runtime-validated, browser-safe DTO containing catalog revision, categories, and supported prompt summaries.
- Use the Node.js runtime only if required by shared authentication helpers; do not add database work when a static server-owned catalog is sufficient.
- Return `Cache-Control: no-store` unless the current authenticated API contract establishes a safer equivalent.
- Enforce session expiry/error behavior consistently with the existing application.
- Do not accept user IDs from the browser or expose simulation resolver internals.

The initial catalog is small enough to fetch once and filter locally. Do not add pagination, remote search, a prompt database table, CMS, analytics, or admin editing.

### Search and filtering

- Search title, prompt text, description, category label, and tags.
- Match case-insensitively after trimming/collapsing query whitespace.
- Combine category and query with AND semantics.
- `All` clears only category selection; `Clear filters` clears both.
- Keep filtering deterministic and move pure matching/sorting logic into a testable helper.
- Announce result-count changes politely and with a short debounce; do not announce every keystroke.

### Desktop prompt browser

- Use an anchored, nonmodal popover/dialog.
- Open below the centered composer and above the ongoing floating composer when needed to remain in the chat pane.
- Include heading, Close, visible Search label, category group, results count, scrollable result list, and empty/error recovery.
- Keep its straighter 0–4 px geometry; the rounded-pill exception does not spread to this panel.
- The panel must not obscure the composer’s textarea or Send control.

### Mobile prompt browser

- Use a modal bottom sheet up to 85dvh.
- Keep heading/Close, Search, and categories fixed while results scroll.
- Trap focus, support Escape/back and explicit Close, and restore focus to the opener.
- Keep Search and result controls visible with the software keyboard.

### Selection and drafts

- Selecting a prompt inserts its exact prompt text and never auto-sends.
- Close the browser and focus the textarea with caret at the end.
- If the draft is non-empty and differs from the chosen prompt, require confirmation before replacement.
- Canceling replacement keeps both the existing draft and browser state.
- Starter prompts on the new-chat screen come from the same API catalog and share selection behavior.
- Prompt failures must not disable free-form chat entry.

## Out of scope

- New deterministic answer intents or fictional business capabilities.
- Preview/unavailable prompts in the visible catalog.
- Prompt authoring, favorites, recents, personalization, pinning, ranking analytics, CMS, database persistence, pagination, or remote search.
- Changes to chat messages, requests, artifacts, transcription, or report APIs.
- Final canvas containment and report-open responsive QA — CFIF-006.
- New dependencies or component libraries unless an existing platform primitive is demonstrably insufficient and the change is separately justified.
- Changes to `brand-kit/`.

## Acceptance criteria

1. Both new and ongoing chats expose a functional prompt-library opener with no dead state.
2. The protected API returns only runtime-valid supported prompt records and appropriate auth/error responses.
3. Starter suggestions and browser results share the same catalog source.
4. Search and category filtering produce deterministic ordered results and correct counts.
5. Selecting a prompt fills but never sends; non-empty draft replacement requires confirmation.
6. Desktop popover and mobile bottom sheet meet the proposal’s focus, Close, Escape, and restoration behavior.
7. Empty, API error, retry, and no-match states leave free-form input usable.
8. No prompt implies behavior the deterministic adapter cannot currently perform.
9. The prompt panel remains inside the chat pane in ordinary layouts; final canvas-open containment is completed in CFIF-006.
10. Focus targets, category state, results, and announcements are accessible at keyboard and 200% zoom.
11. Focused unit/API tests, the existing suite, `npm run lint`, and `npm run build` pass.
12. Actual desktop/mobile prompt-browser screenshots and interaction notes are stored under `_PROJECT/tasks/CFIF-005/evidence/`.

## Completion handoff

List the exact catalog records/categories shipped, API and DTO changes, visible states verified, automated checks, evidence created, and any canvas-specific follow-up left to CFIF-006.
