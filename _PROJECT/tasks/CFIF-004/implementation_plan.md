# CFIF-004 — Implementation plan

## Outcome

Deliver the adaptive composer and phase-specific chat layouts without changing the deterministic backend contract. This session ends with a centered new-chat experience and a fully functional floating ongoing-chat composer across the existing interaction states.

## Session dependency

Run against the completed CFIF-003 implementation. CFIF-005 and CFIF-006 have not started and must not be partially implemented here.

## Phase 0 — Establish the baseline

1. Read the sources in `task_request.md` and the applicable brand-experience web/Next.js guidance.
2. Inspect `git status --short`; preserve unrelated changes and the proposal/task artifacts.
3. Inspect the current chat component, CSS, shared DTOs, route structure, and existing tests.
4. Read installed Next.js guides before changing any version-sensitive route, navigation, or Client Component behavior.
5. Run the existing tests, lint, and build once; record pre-existing failures rather than weakening checks.

## Phase 1 — Extract the shared composer boundary

1. Refactor the current inline form into a named shared component or tightly bounded colocated component.
2. Keep existing state ownership unless moving it produces a clearly smaller and safer interface.
3. Define explicit placement variants: `centered`, `floating`, and `constrained` readiness for CFIF-006.
4. Preserve form semantics, visible label, textarea ID/description relationships, submission handler, draft storage, IME guard, character counting, and voice callbacks.
5. Add small, newly authored inline SVG components for required generic symbols. Keep them decorative inside named buttons and avoid copied paths or a new dependency.

**Exit:** the current UI still functions with the refactored composer before layout changes.

## Phase 2 — Implement elastic textarea behavior

1. Measure the textarea scroll height after draft/layout changes and clamp it to six visual lines.
2. Reset height before measuring so deletion shrinks the control.
3. Switch textarea overflow from hidden to auto only at the maximum.
4. Use a layout-safe mechanism to report the composer overlay height to the transcript, such as `ResizeObserver` with cleanup; avoid polling.
5. Preserve scroll anchor rules: pin only when near the end, otherwise keep position stable.
6. Respect reduced motion for any programmatic scroll.

Add focused tests for any extracted pure clamping/scroll-anchor helpers. Do not introduce a test framework solely for DOM measurement.

**Exit:** one through six lines grow predictably; further input scrolls internally and deletion shrinks correctly.

## Phase 3 — Build the new-chat composition

1. Move the empty-workspace composer into the centered welcome group.
2. Place the existing supported suggestions beneath it and keep their behavior fill-only.
3. Add responsive one/two-column suggestion layouts.
4. Keep synthetic/voice disclosures and the visible question label.
5. Confirm first send still atomically creates/navigates to the chat and drafts remain isolated.
6. Do not render a prompt-library control yet.

**Exit:** `/app/chat` matches WF-01 minus the CFIF-005 library trigger and passes first-send/regression checks.

## Phase 4 — Build the ongoing floating composer

1. Make the conversation pane the containing block.
2. Let the transcript fill the available region; remove the composer from the grid-row height budget.
3. Add the scoped fade, pill, and below-pill status region.
4. Bind transcript bottom padding and scroll padding to the measured overlay footprint.
5. Place the new-answer control above the overlay.
6. Restyle only the composer as rounded; retain the rest of the application geometry.
7. Verify tooltips/focus rings remain visible and the pill stays within the conversation pane in normal non-canvas layouts.

**Exit:** ongoing chat has no opaque full-width composer band and the last message clears the overlay.

## Phase 5 — Consolidate composer states

1. Map each existing capture/request/error state to the shared action/status slots.
2. Keep state controls inside the pill and one compact status line below it.
3. Ensure disabled actions explain why they are unavailable.
4. Suppress per-second screen-reader announcements from the recording timer.
5. Exercise recording navigation/discard confirmations and late transcription suppression.
6. Verify 3,600-character count, over-limit error, API error, sending, processing, review, and reset behavior.

**Exit:** all states remain truthful, compact, keyboard operable, and height-stable except intended multiline growth.

## Phase 6 — Responsive and visual verification

1. Verify representative widths: 390 × 844, 768 × 1024, 1280 × 720, and 1440 × 900.
2. Check new chat, one-line ongoing, six-line, line-seven overflow, processing, recording, transcription review, error, and scrolled-away states.
3. Exercise keyboard submit/newline/IME, tab order, tooltips, visible focus, reduced motion, and the mobile visual viewport/software keyboard where tooling permits.
4. Confirm report opening still works without claiming final canvas acceptance.
5. Save only actual screenshots/check notes under `_PROJECT/tasks/CFIF-004/evidence/`.
6. Run the complete relevant test suite, `npm run lint`, and `npm run build`.

## Planned file-area ownership

Expected primary ownership:

- `components/data-insights/chat-workspace.tsx` or a new colocated composer component;
- `components/data-insights/data-insights.module.css`;
- focused chat/composer helper tests if supported by the current test setup; and
- `_PROJECT/tasks/CFIF-004/evidence/`.

Avoid API, database, prompt-catalog, and report-canvas rewrites.

## Copy-ready Codex session request

Implement CFIF-004 completely. Read `_PROJECT/tasks/CFIF-004/task_request.md` and `implementation_plan.md`, the revision 2.0 chat redesign proposal, CFIF-003’s preserved contracts, repository instructions, applicable brand-kit rules, and installed Next.js 16 documentation before editing. Build the centered new-chat composer and floating ongoing-chat composer with six-line auto-growth and all existing voice/request/error states. Do not implement the prompt browser or final canvas rework. Verify with existing tests, lint, build, and representative rendered desktop/mobile states; save and report only evidence actually produced.
