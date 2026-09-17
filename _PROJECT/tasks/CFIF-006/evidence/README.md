# CFIF-006 verification evidence

Verified on 17 September 2026 against the production build with headless Chrome 153.0.8010.36. `verification.json` is the machine-readable record produced by `verify.mjs`; the PNG files are direct viewport captures from that same run.

## Automated checks

- `npm test`: 13 test files and 72 tests passed.
- `npm run lint`: passed with no reported errors.
- `npm run build`: passed with Next.js 16.3.5 / Turbopack, including TypeScript, page-data collection, and static generation. The restricted sandbox build process stalled during optimized compilation; the exact command completed outside that process restriction in 3.4 seconds.
- `node --check _PROJECT/tasks/CFIF-006/evidence/verify.mjs` and `git diff --check`: passed.

## Rendered checks

- `new-chat-desktop-1440x900.png` and `new-chat-mobile-390x844.png` — centered new-chat layout and mobile transformation.
- `ongoing-chat-desktop-1440x900.png` and `ongoing-chat-mobile-390x844.png` — floating composer in an existing conversation.
- `prompt-browser-desktop-1440x900.png` and `prompt-browser-mobile-390x844.png` — desktop popover and modal mobile sheet.
- `prompt-replacement-confirmation-desktop-1440x900.png` — destructive draft-replacement confirmation.
- `prompt-browser-error-desktop-1440x900.png` — prompt-catalog failure with freeform chat retained.
- `report-open-desktop-1440x900.png` — canonical 248 / 416 / remaining-width split with an 836 px-high canvas from the 64 px application header to the 900 px viewport bottom.
- `report-prompt-browser-desktop-1440x900.png` — prompt browser contained inside the 416 px conversation rail while the canvas remains usable.
- `report-open-tablet-768x1024.png` — report replacement with a separate non-overlapping Back row.
- `report-open-mobile-390x844.png` — report-only mobile layout, page 1 at local table scroll x=0, with no visible or hit-testable composer.
- `report-page-error-desktop-1440x900.png` — report-local page failure and recovery actions.
- No horizontal document overflow was measured for new chat, ongoing chat, or report-open routes at 320, 375, 390, 768, 1024, 1280, or 1440 px widths.

## Interaction and accessibility checks

- Prompt loading, search, category filtering, no-match clearing, failure/retry, fill-only selection, replacement cancellation/confirmation, focus restoration, Escape, and mobile focus wrapping passed.
- One-line/six-line growth and line-seven internal textarea scrolling passed; all constrained composer controls measured at least 44 px high.
- Sending/processing announcements, disabled-send state, request-error draft retention, simulated recording, transcription review, discard restoration, and the off-screen-reader `New answer` path passed.
- Account-menu Escape and mobile drawer Escape returned focus to their openers; the drawer and mobile prompt sheet trapped focus as designed.
- At 1440×900, the six-line composer and prompt browser stayed within x=248–664, canvas hit testing at x=665 was not intercepted by chat UI, and the last message scrolled 36 px above the composer.
- Breakpoint transition with the prompt browser open closed it, removed the hidden composer from focus/hit testing, and focused the report heading.
- Draft, clamped transcript anchor, report-opener focus, and remembered report page restored on tablet, desktop, and mobile return paths.
- Pagination rendered 50 / 14 rows, preserved horizontal scroll x=320, reset vertical scroll to 0, moved focus to the stable footer when the activator became disabled, announced loading, and recovered from a forced page error.
- Valid-empty report rendering preserved all ten column headers and omitted pagination controls.
- Runtime reduced-motion emulation matched the media query, changed document scrolling to `auto`, and reduced the sidebar transition duration to `0s`.
- Constrained prompt and Send tooltips appeared on hover and were aligned inward (`left: 0` and `right: 0` respectively).

## Scope and limitations

The pass used the repository's synthetic fixtures and simulated transcription only. The 390×560 keyboard check represents a reduced visual viewport; it does not claim testing on a physical device, a real software keyboard, a real microphone, or a screen reader. No API, database-schema, authentication, report-snapshot, prompt-record, dependency, or brand-kit changes were made.
