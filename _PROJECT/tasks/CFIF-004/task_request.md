# CFIF-004 — Implement the adaptive chat composer and conversation layouts

## Objective

Upgrade the Data Insights Chat composer and shell to the approved revision 2.0 design:

- center the composer and supported starter prompts in the new-chat state;
- use a floating composer pill inside the conversation pane for ongoing chats;
- auto-grow the textarea through six visual lines, then scroll internally;
- consolidate Record, Send, recording, transcription, review, pending, count, and error controls into the pill and its compact local status area;
- remove the full-width opaque composer band and standalone demo strip; and
- preserve all existing chat, draft, request, simulated voice, authentication, report, and API behavior.

This task builds the reusable layout and interaction foundation. It does not implement the searchable prompt browser or complete the final report-canvas containment pass; those are owned by CFIF-005 and CFIF-006.

## Authority and sources

Read in this order before editing:

1. `_PROJECT/tasks/CFIF-004/task_request.md`.
2. `_PROJECT/tasks/CFIF-004/implementation_plan.md`.
3. `_PROJECT/proposals/20260917-chat-screen-redesign/SCREEN_SPECIFICATIONS.md`, especially SCR-001, SCR-002, composer states, responsive behavior, acceptance criteria, and implementation mapping.
4. `_PROJECT/proposals/20260917-chat-screen-redesign/WIREFRAMES.md`.
5. `_PROJECT/tasks/CFIF-003/task_request.md` and the current Data Insights implementation; CFIF-003 remains authoritative for simulation, persistence, security, route, DTO, and API behavior not explicitly changed here.
6. Repository `AGENTS.md`, `brand-kit/`, and the applicable installed Next.js 16 documentation.

The proposal governs the updated screen composition. The repository and CFIF-003 rules continue to govern truthful simulation, data contracts, ownership, and existing feature behavior.

## In scope

### Shared shell

- Reduce the application header to the proposal target where content permits.
- Remove the standalone synthetic-mode strip as a separate grid row.
- Move `Synthetic demo · Fictional bid data · UTC` into a compact conversation context bar without dropping or hiding the disclosure.
- Preserve the sidebar, account actions, All features navigation, routes, and responsive drawer behavior.

### New-chat composition

- Replace the current top-aligned empty workspace with the centered new-chat composition.
- Keep a compact visible `Your question` label in the composer.
- Place only currently supported starter prompts below the composer.
- Selecting a starter prompt fills the draft, focuses the textarea, and does not send.
- Keep the blank `/app/chat` state unpersisted until the first accepted submission.
- Do not display a prompt-library trigger until CFIF-005 gives it working behavior; no dead or disabled placeholder control.

### Ongoing-chat composer

- Position the composer as an overlay relative to the conversation pane, never the viewport.
- Use the proposed local fade above the pill and local status/breathing area below it.
- Keep the overlay and fade within the conversation width.
- Give the message scroller dynamic bottom padding and `scroll-padding-bottom` equal to the current overlay footprint plus the required clearance.
- Ensure the last message can scroll fully above the pill.
- Preserve `New answer ↓` when the user is reading older messages.

### Composer behavior

- Use one shared composer implementation with centered, floating, and constrained-ready placement variants.
- Keep a visible `Your question` label in every placement.
- Auto-grow from one through six visual text lines; line seven and beyond scroll inside the textarea.
- Disable manual textarea resizing.
- Keep Enter, Shift+Enter, IME composition, 4,000-code-point validation, per-chat draft persistence, first-send navigation, optimistic messages, and request recovery unchanged.
- Keep the user’s transcript position stable when composing away from the end; pin only when already near the latest message.
- Use newly authored generic inline symbols for Record, Stop, Cancel/discard, and Send. Do not add an icon package or copy icons from screenshots.
- Record is a round 44 × 44 px icon-only button with accessible name and focus/hover tooltip.
- Send uses icon plus visible text at normal desktop widths and may become icon-only only in a genuinely constrained container, with accessible name and tooltip.

### State consolidation

Support the proposal states without reintroducing permanent stacked rows:

- ready/empty;
- drafting and 3,600/4,000-character feedback;
- sending/queued/running;
- recording with timer, Stop, and Cancel;
- transcribing and cancellation;
- transcript review and discard;
- local validation/API error; and
- scrolled-away/new-answer.

Preserve confirmation before discarding an active recording or edited transcript where currently required. Timer ticks must not announce every second.

### Responsive behavior

- Desktop, tablet, and mobile composer layouts must follow the proposal.
- Keep all controls at least 44 × 44 CSS px.
- Account for `env(safe-area-inset-bottom)`.
- The software keyboard must not cover the active textarea or Send action.
- Respect reduced motion when programmatically scrolling.

## Out of scope

- Searchable prompt browser, category pills, prompt catalog DTOs, or a prompts API — CFIF-005.
- Final report-canvas height, clipping, constrained 416 px chat rail, and report-open visual acceptance — CFIF-006.
- Changes to deterministic answer behavior, SQLite schema/data, authentication, artifact contracts, transcription endpoint, or report pagination.
- New libraries, component frameworks, state managers, icon packages, imagery, analytics, or live AI/microphone integrations.
- Changes to `brand-kit/`.

## Brand and content requirements

- Apply EXP-001, EXP-003, DES-001, DES-002, DES-003, DES-004, DES-006, DES-007, DES-009, and PAT-004 through existing theme roles.
- The rounded composer and round Record control are task-local exceptions. Keep other controls and surfaces in the established straighter geometry.
- The fade is functional, restrained, and local; do not introduce glass blur or decorative gradients.
- Preserve visible synthetic, fictional-data, UTC, and simulated-recording disclosures.
- Newly authored generic interface symbols are adaptations, not CFI identity assets.

## Acceptance criteria

1. `/app/chat` shows the centered composer, visible label, disclosure, and supported starter prompts; no blank chat is persisted before send.
2. `/app/chats/[chatId]` shows a floating pill with no full-width opaque composer band.
3. The textarea grows through six lines and scrolls internally from line seven onward.
4. All existing send, draft, retry, processing, recording, transcribing, review, discard, validation, and navigation behavior remains functional.
5. The final transcript message can scroll completely above the pill/fade.
6. Composing while reading older messages does not force the transcript to the bottom.
7. Record and any icon-only controls have accessible names, focus states, tooltips, and 44 px targets.
8. The standalone mode strip is removed while its disclosure remains visible in the context bar.
9. Existing report opening remains functional; detailed canvas layout polish is explicitly deferred to CFIF-006.
10. Existing automated tests, `npm run lint`, and `npm run build` pass.
11. Rendered desktop and mobile checks cover ready, six-line, processing, recording, review, error, and software-keyboard-representative states. Save actual evidence under `_PROJECT/tasks/CFIF-004/evidence/`.

## Completion handoff

Report changed files, preserved API/backend behavior, brand basis and pill exception, automated checks, rendered viewports/states actually inspected, and any specific issue deferred to CFIF-005 or CFIF-006.
