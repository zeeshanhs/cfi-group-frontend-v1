# CFIF-003 Stage 2 browser evidence

Captured on 17 September 2026 with the Codex in-app browser using Chromium `152.0.0.0` on macOS. The application ran locally against the disposable database `/tmp/cfi-data-insights-stage2.sqlite`; no checked-in database was used for browser writes.

## Captures

- `SCR-04_report-ready_1440x900.jpg` — primary 64-row report, page 1, at an exact 1440×900 viewport. The capture shows the desktop three-region layout, report context, leading table columns, local table overflow, and pagination.
- `SCR-04_report-ready_390x844.jpg` — the same saved report at an exact 390×844 viewport. The capture shows the compact header, full-width report canvas, back-to-conversation action, horizontally scrollable table, and touch-sized paging controls.

Both files were read back as baseline JPEG images with the dimensions in their filenames.

## Browser states actually exercised

- Fictional Jordan login, empty workspace, primary exact prompt, queued/running state, persisted answer, three-row attachment preview, report open, page 1, page 2 (50/14 rows), close/reopen, refresh, and profile return to report page 2.
- Primary metadata disclosure, including UTC, bid-creation date basis, exact exclusive period, no-person filter, fixture watermark, counts, and deterministic ordering.
- Mobile history drawer and recording-discard confirmation focus containment; profile content; report and composer layouts near 390×844; body overflow check at 320×740 (`scrollWidth` equaled `innerWidth`).
- Simulated recording success, typing preserved during transcription, transcript review without auto-send, transcript discard, navigation guard, and server-configured transcription timeout.
- Valid zero report with one semantic ten-column schema table, **No matching bids**, and **0 rows · No pages**.
- Server-configured page-2 failure with **Retry page** and **Return to page 1**, followed by successful return to page 1.
- Server-configured retryable data-query failure, including persistence of the failure card across reload. Retry success is covered by the automated service test after the simulated failure is removed.
- `/reports` and `/reports/weekly-sales` regression routes, with the weekly report reaching its populated state.
- Browser console error inspection returned no errors for the final primary report and weekly report checks. Page-resource inspection showed only same-application routes/assets; no model, identity, analytics, external font/image, microphone, or transcription-provider request was present.

Keyboard focus was inspected through the browser accessibility tree for headings, the mobile drawer close action, recording confirmation, report return, and form controls. Mouse/touch-equivalent activation was also exercised. Reduced-motion behavior was verified from the checked-in media-query rule; the browser runner did not expose a reduced-motion emulation control, so no claim of runtime OS preference emulation is made.

The images are implementation evidence only. They are not production assets and must not be shipped as interface content.
