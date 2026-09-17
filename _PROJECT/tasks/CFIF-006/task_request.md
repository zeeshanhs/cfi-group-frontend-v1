# CFIF-006 — Integrate the floating composer with the report canvas and complete screen QA

## Objective

Complete the chat-screen redesign by integrating CFIF-004’s floating composer and CFIF-005’s prompt browser with the report canvas. The desktop canvas must use the full workspace height, and every chat-owned overlay must remain visually and interactively contained inside the conversation pane.

This task also owns the final responsive, accessibility, visual, and regression pass for the complete redesign across new chat, ongoing chat, prompt browsing, simulated voice, request/error states, and report-open layouts.

## Prerequisites

- CFIF-004 is complete: adaptive composer and phase-specific layouts are implemented.
- CFIF-005 is complete: prompt catalog/API and prompt browser are implemented.
- Inspect both completed implementations, task files, and any stored evidence/check notes; if no separate handoff artifact exists, the repository state is the source of truth. Preserve their tested contracts rather than rewriting them.

## Authority and sources

Read in this order:

1. `_PROJECT/tasks/CFIF-006/task_request.md`.
2. `_PROJECT/tasks/CFIF-006/implementation_plan.md`.
3. `_PROJECT/proposals/20260917-chat-screen-redesign/SCREEN_SPECIFICATIONS.md`, especially SCR-004, responsive transformations, requirement coverage, and acceptance criteria.
4. `_PROJECT/proposals/20260917-chat-screen-redesign/WIREFRAMES.md`, especially WF-07 and WF-10.
5. CFIF-004 and CFIF-005 task requests, plans, implemented code, and stored evidence/check notes.
6. CFIF-003’s report artifact/canvas, routing, ownership, recovery, paging, and responsive requirements.
7. Current code, repository `AGENTS.md`, `brand-kit/`, and applicable installed Next.js 16 documentation.

## In scope

### Desktop report split

- Preserve the canonical wide layout: sidebar, constrained conversation pane, and remaining-width report canvas.
- Keep the canvas full height from the application header to the bottom of the workspace.
- Let the canvas own its header, scroll body, and footer/pagination without any row or padding reserved for the chat composer.
- Keep the conversation header, transcript, and composer independent of canvas vertical sizing.
- Adapt the composer to the constrained chat pane: compact prompt-library trigger, visible `Your question` label, round Record, and icon-only Send when required by actual container width.

### Containment invariant

The following must be positioned, measured, painted, and focused only inside the conversation pane:

- floating composer pill;
- functional fade;
- below-pill disclosure/status area;
- `New answer ↓` control;
- prompt-browser popover;
- tooltips;
- focus rings; and
- composer shadow.

Use a conversation-relative containing block and appropriate clipping/insets. Do not solve bleed by hiding focus indicators or making the canvas shorter.

### Canvas behavior

- Preserve existing artifact metadata, preview, paging, stored snapshot, authorization, errors, and URL behavior.
- Preserve report-table horizontal/vertical scrolling and sticky header/identifier behavior.
- Opening/closing a report must preserve the chat draft, transcript anchor, composer state, remembered report page, and focus restoration defined by CFIF-003.
- A prompt browser open during a report transition must close safely without draft loss or stray focus.

### Tablet and mobile

- At 768–1279 px, preserve the report-replaces-conversation behavior while the sidebar remains.
- Below 768 px, preserve the sidebar drawer and report-only main region.
- Do not render or leave the chat composer interactable behind the report-only view.
- `Back to conversation` restores the draft, message anchor, and focus.
- The mobile software keyboard must not affect canvas height or leave the report underneath a chat overlay.

### Final integrated QA

Perform a bounded correction pass across:

- centered new chat and starter prompts;
- prompt loading, search, categories, empty/error, selection, and confirmation;
- one-line and six-line floating composer;
- line-seven internal scrolling;
- sending/processing, recording, transcribing, transcript review, errors, and new-answer state;
- account menu/sidebar drawer;
- report open/close, page changes, loading/error/empty states; and
- narrow/mobile visual viewport and reduced-motion behavior.

## Out of scope

- New prompt records or deterministic answer capabilities except correction of a proven acceptance mismatch.
- Changes to database schema, chat persistence, authentication model, report snapshot semantics, or API shape unless required to fix a regression caused by this redesign.
- New report functionality such as sorting, filtering, charts, export, or editing.
- New dependencies, component frameworks, icon packages, imagery, live AI, or real microphone integration.
- Changes to `brand-kit/`.

## Acceptance criteria

1. At 1440 × 900 report-open state, the canvas spans the full workspace height and the chat composer consumes no canvas row height.
2. Composer, fade, status, prompt popover, tooltip, focus ring, shadow, and new-answer control never paint into or intercept input in the canvas column.
3. The last chat message can scroll fully above the constrained composer.
4. The constrained composer remains operable with visible label, 44 px targets, and accessible icon-only Send where needed.
5. Canvas table, sticky regions, pagination, page restoration, errors, and Close/Back behavior remain functional.
6. At tablet/mobile widths the report replaces conversation and no hidden composer remains focusable or clickable.
7. Closing the report restores draft, transcript anchor, and focus without unexpected scroll jumps.
8. The full integrated redesign has no horizontal body overflow at 320, 375, 390, 768, 1024, 1280, and 1440 px widths.
9. Keyboard order, focus visibility, Escape handling, drawer/dialog traps, tooltips, live announcements, and reduced-motion behavior pass manual inspection.
10. The complete automated suite, `npm run lint`, and `npm run build` pass.
11. Final evidence includes at least new-chat desktop/mobile, ongoing-chat desktop/mobile, prompt browser desktop/mobile, and report-open desktop/mobile views under `_PROJECT/tasks/CFIF-006/evidence/`.

## Completion handoff

Summarize final layout/component changes, any minimal regression fixes to CFIF-004/005, API behavior confirmed unchanged, brand application and rounded-pill exception, automated checks, exact manual interactions/viewports exercised, evidence paths, and any remaining known limitation.
