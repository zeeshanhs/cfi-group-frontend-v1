# CFIF-005 rendered verification

Browser: Chrome/153.0.8010.36 through Puppeteer  
Application: local Next.js 16.3.5 production server from the webpack build  
Recorded: 17 September 2026

## Captures

- `prompt-browser-desktop-1440x900.png` — centered-composer desktop popover.
- `prompt-browser-tablet-768x1024.png` — tablet-width anchored popover.
- `prompt-browser-mobile-390x844.png` — mobile modal bottom sheet.
- `prompt-browser-keyboard-representative-390x560.png` — reduced visual viewport representative of an open software keyboard.
- `prompt-browser-ongoing-desktop-1440x900.png` — ongoing-chat popover above the floating composer.
- `prompt-replacement-confirmation-desktop-1440x900.png` — non-empty draft replacement confirmation.
- `prompt-browser-error-desktop-1440x900.png` — prompt API failure with free-form input still available.
- `prompt-browser-no-match-mobile-390x844.png` — no-match state and Clear filters recovery.

`verification.json` contains the measured assertions from the same run. It records the authenticated API response, supported-only catalog and categories, five API-backed starters, local search/category intersection, fill-without-send behavior, draft replacement cancel/confirm (including nested mobile Escape handling), desktop outside-click dismissal, mobile Escape/focus trap, failure/retry, Clear filters, 1440/768/390 containment, a 390×560 keyboard representative, and 320px narrow reflow used as the 200%-zoom-equivalent layout check.

The canvas-open containment pass remains assigned to CFIF-006 and was not claimed here.
