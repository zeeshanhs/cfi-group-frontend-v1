# Data Insights Chat — revised screen specification

**Revision:** 2.0 / 2026-09-17  
**Status:** Proposed; ready for implementation planning  
**Routes:** `/app/chat` and `/app/chats/[chatId]`  
**Scope:** New-chat composition, ongoing-chat composition, prompt discovery, composer states, responsive behavior, and canvas containment  
**Out of scope:** Implementing the UI, supplying hundreds of real prompts, changing APIs, or claiming unsupported data capabilities

## 1. Product outcome

Give each chat phase the layout that best supports its task:

- Before a conversation exists, help the user form a useful first question.
- Once messages exist, maximize reading space and keep the input immediately reachable.
- When a report canvas is open, preserve the canvas as a full-height working surface while keeping chat controls inside the chat pane.

The revised design adopts the user’s floating-composer reference as an interaction pattern, not as a visual asset or exact reproduction.

## 2. Shared shell

### Desktop

| Region | Specification |
|---|---|
| Application header | 64 px fixed; preserve brand/product, All features, and account actions. |
| Workspace | Fills the remaining `100dvh`; contains sidebar plus main workspace. |
| Standalone demo strip | Removed. |
| Sidebar | 248 px; independently scrollable. |
| Conversation context bar | 56–72 px; title left and `Synthetic demo · Fictional bid data · UTC` right. |
| Main content | New-chat welcome state or independently scrolling transcript. |
| Composer | Centered in the new-chat state; floating overlay in ongoing chats. |

### Shared visual language

- Keep the charcoal header, white/pale-gray surfaces, dark text, and CFI action red.
- Retain direct labels and restrained decoration.
- The rounded composer pill is an explicit task-local exception to the kit’s square-control default. Limit this exception to the composer and its round icon actions; do not convert the rest of the interface into rounded cards.
- Use a subtle border and restrained shadow to separate the floating pill from messages. Do not use glass blur, translucent text surfaces, or gradient decoration.
- The only gradient is a functional white-to-transparent fade above the floating composer, used to protect legibility where transcript content passes behind it.

## 3. SCR-001 — New chat

### Outcome

Help a user begin with either a free-form question or a known prompt without making prompt discovery feel mandatory.

### Composition

Within the space below the context bar:

1. Center a welcome group vertically at approximately 42% of the available content height so the suggestions have room below.
2. Show eyebrow `Synthetic Data Insights`.
3. Show heading `What would you like to know?`.
4. Show supporting text `Ask about bids, people, jobs, or a reporting period.`
5. Show the large composer pill, maximum width 760 px.
6. Show `Try a prompt` followed by 3–5 starter prompts beneath the pill.
7. Show the persistent simulated-voice disclosure immediately beneath the pill and above suggestions.

The new-chat content area may scroll on short viewports. The composer is not sticky until the first message is submitted.

### New-chat composer

Desktop minimum height: 72 px. Order inside the pill:

1. `Browse prompts` button with a newly authored generic library/grid symbol and visible text.
2. Textarea group with a compact visible `Your question` label and placeholder `Ask about bids, people, jobs, or a reporting period…`.
3. Round Record icon button.
4. Red `Send` button with a directional send symbol and visible `Send` text.

The textarea’s compact visible label remains present in centered and floating placements; the welcome heading and placeholder do not replace it. The accessible name remains stable in every state.

### Starter prompts

Show no more than five. Use a compact two-column list on wide screens and one column below 640 px. Each prompt is a button with a full sentence, not a vague category label. Suggested initial examples:

- `How many bids were created last month?`
- `Compare bids by account manager this month.`
- `Show jobs with bids created in the past seven days.`
- `Create a monthly bid activity report.`
- `Create a weekly bid activity report.`

Only prompts supported by the current prototype may be actionable in an implemented demo. Unsupported examples must be omitted or clearly labeled `Preview` and must not imply the backend can answer them.

Selecting a starter prompt inserts its text into the composer, focuses the textarea, and does not auto-send.

### Prompt browser entry

Activating `Browse prompts` opens the prompt browser described in `PROMPT_LIBRARY.md`. On desktop it is a nonmodal anchored popover below the composer. On mobile it is a modal bottom sheet.

### Transition to an ongoing chat

After a successful first submission:

- Route to the created chat as today.
- Replace the centered welcome composition with the transcript.
- Move the same draft/voice/send affordances into the bottom-floating composer.
- Preserve focus on the composer after route replacement when this does not interfere with announcing the new optimistic message.

## 4. SCR-002 — Ongoing chat

### Outcome

Prioritize reading and navigating the conversation while leaving a compact input within thumb or pointer reach.

### Transcript

- The transcript fills the complete region below the context bar; the composer is not a grid row.
- Maintain the existing 760 px reading measure and message hierarchy.
- Add dynamic `scroll-padding-bottom` and content padding equal to the current composer overlay footprint plus 24 px. The final message must be able to scroll fully above the pill.
- Preserve a user’s scroll position when they are reading older messages.
- Keep `New answer ↓` immediately above the composer’s fade when a reply arrives off-screen.

### Floating overlay layer

The overlay is absolutely positioned inside the conversation pane:

- `position: absolute` relative to the conversation pane, not the viewport or main workspace.
- Inline inset: minimum 16 px; centered maximum width 760 px.
- Bottom inset: 16 px desktop, 12 px tablet, and `max(8px, env(safe-area-inset-bottom))` mobile.
- Overlay width is calculated only from the conversation pane.
- Outer overlay receives no opaque full-width background.
- Only the pill and interactive status content receive pointer events.

The overlay contains:

1. A 32–48 px white-to-transparent fade extending above the pill. It is decorative, has no pointer events, and fades toward the transcript.
2. The composer pill.
3. A 20–28 px quiet area below the pill containing the voice disclosure or current compact status.

The lower quiet area is local to the pill width, not a full-width band.

### Floating composer pill

- Maximum width: 760 px.
- Minimum height: 72 px desktop; 68 px mobile.
- Maximum expanded height: approximately 200 px, sufficient for the label, six text lines, and padding.
- Radius: 28–32 px at minimum height; when expanded, use a 24 px radius so the shape remains intentional rather than capsule-distorted.
- Background: opaque white.
- Boundary: existing divider/border role.
- Shadow: subtle, neutral, and limited to the pill.
- Internal padding: 8 px.

Control order:

1. Optional prompt-library icon button. It is present in ongoing chats if the library is implemented, but uses an icon plus accessible name/tooltip to conserve width.
2. Textarea group with compact visible `Your question` label.
3. Round Record icon button, 44 × 44 px.
4. Red Send control, minimum 44 px tall, with send icon plus visible `Send` text on desktop. On containers below 420 px, it may collapse to an icon-only 44 × 44 px button with `aria-label="Send question"` and tooltip.

### Textarea behavior

- One visible line at rest.
- Auto-grow through six visual lines.
- After six lines, keep the pill height fixed and scroll the textarea internally.
- Disable manual resizing.
- Preserve `Enter` to send, `Shift+Enter` for a new line, and IME composition handling.
- When auto-growth changes the overlay footprint, update transcript bottom padding in the same frame.
- Pin to the latest message only if the user was already within 120 px of the transcript end.

### Icon design

- Do not extract or trace icons from the supplied reference screenshot or CFI evidence captures.
- Use newly authored, conventional line symbols: microphone for Record, upward/rightward send arrow for Send, small grid/bookmark shape for Prompt library, square for Stop, and `×` for Cancel.
- Maintain approximately 1.75–2 px stroke at 20–22 px icon size.
- Icon-only controls require an accessible name, visible tooltip on hover/focus, and 44 × 44 px target.
- Record is neutral by default. Active recording uses textual status plus red accent; red alone must not communicate the state.

## 5. Composer state behavior

### ST-01 — Ready / empty

- Textarea uses one line.
- Record is enabled.
- Send is disabled.
- Below-pill copy: `Demo voice input · simulated; microphone is not accessed.`

### ST-02 — Drafting / multiline

- Send enables when trimmed content is valid.
- Pill grows to six lines without requiring decorative animation.
- At 3,600 characters, show the count in the below-pill status area.
- Above 4,000 characters, show `Shorten your question before sending · 4,037 / 4,000`; disable Send.

### ST-03 — Sending / processing

- Clear the sent draft and collapse the pill to one line.
- Keep the optimistic message and processing status in the transcript.
- Disable input actions while the request is queued/running.
- Replace the below-pill disclosure with `Waiting for this reply before you can send another question.`

### ST-04 — Recording

- Keep the draft visible.
- Replace Record and Send with `Recording · 00:23 / 02:00`, round Stop, and Cancel controls inside the pill.
- Do not announce timer ticks every second. Announce recording start, stop, and the time limit.
- Preserve confirmation before navigation discards a recording.

### ST-05 — Transcribing

- Show `Transcribing…` inside the pill with `Cancel transcription`.
- Set programmatic busy state and prevent sending.
- Preserve the draft.

### ST-06 — Transcript review

- Place transcript text in the textarea.
- Show `Transcript added. Review before sending.` below the pill.
- Replace Record with an icon-plus-tooltip `Discard transcript` action.
- Send becomes available when content is valid.

### ST-07 — Error

- Use the below-pill status area for concise local input or server errors.
- Use text plus error color; do not use action red as the only signal.
- Keep the draft and focus stable.
- Failed answer and Retry remain in the transcript when the failure belongs to the request rather than the input.

## 6. SCR-003 — Prompt browser

The prompt browser is part of new-chat discovery and may also be entered from ongoing chat. Its detailed specification is in `PROMPT_LIBRARY.md`.

Required visible regions:

1. Heading `Browse prompts` and Close action.
2. Search field labeled `Search prompts`.
3. Single-select category pills: `All`, `Bids`, `Account managers`, `Jobs`, `Monthly reports`, `Weekly reports`.
4. Results count.
5. Scrollable prompt results with title, one-line description, and category.
6. Empty state with `Clear filters`.

Selecting a prompt inserts it into the composer and closes the browser. It never submits automatically.

The prompt browser is future-ready, not evidence that hundreds of prompts already exist. The current prototype should expose only vetted prompts that map to supported behavior.

## 7. SCR-004 — Canvas open

### Layout invariant

The composer overlay, fade, below-pill area, prompt popover, and `New answer` control belong to the conversation pane. None may cross into the canvas column.

### Desktop split view

- Workspace grid remains sidebar | chat pane | canvas.
- Canvas spans the entire vertical workspace below the application header.
- Canvas owns its own header, scroll body, and footer/pagination; no height is reserved for the chat composer.
- Conversation pane is `position: relative; overflow: hidden` so overlay paint is clipped at its inline boundary.
- Composer width is `min(760px, calc(100% - 24px))` within the chat pane.
- In the current 416 px chat rail, Send collapses to icon-only and the prompt-library trigger may move into a compact leading icon group.
- The fade width equals the pill width and cannot extend over the canvas divider.
- Any shadow is clipped before the canvas boundary or uses a sufficiently small spread that does not visually tint the canvas.

### Tablet and mobile

Preserve the current report-only behavior: opening the canvas replaces the chat view, with a clear `Back to conversation` action. The chat composer is not rendered behind or over the canvas.

## 8. Responsive transformation

### 768–1279 px

- Sidebar remains 216 px where persistent.
- New-chat composer remains centered, with suggestions reduced to one column when needed.
- Ongoing composer keeps icon-plus-text Send while its container is at least 420 px.
- Desktop prompt popover width is `min(680px, available width)`.
- Canvas continues to replace conversation below the desktop split threshold already used by the product.

### Up to 767 px

- Preserve the Chats drawer and account controls.
- Context bar stacks the product title/disclosure compactly.
- New-chat welcome group starts nearer the top rather than true vertical center so the composer and suggestions are reachable without excessive scrolling.
- Composer pill inset: 12 px.
- Prompt-library, Record, and Send may be icon-only, but all remain 44 × 44 px with accessible names and tooltips where hover/focus exists.
- Prompt browser becomes a bottom sheet up to 85dvh with a fixed search/category header and scrolling results.
- When the software keyboard opens, the composer follows the visual viewport; only the transcript shrinks.
- Below-pill spacing includes the device safe area.

## 9. Prompt-browser accessibility

- Desktop popover is a nonmodal dialog/popover, not an ARIA `menu`; it contains form controls and results.
- Focus moves to Search when opened.
- Escape closes and restores focus to the opener.
- Outside click closes only on desktop; mobile requires Close, Escape/back, or swipe dismissal if implemented accessibly.
- Category pills are single-select controls with visible and programmatic selected state.
- Search results are a labeled list of buttons. Arrow-key roving is optional; ordinary Tab navigation is sufficient and less surprising.
- Results update announcement is debounced and concise, such as `8 prompts found`.
- Selecting a result closes the browser, places its text in the composer, and focuses the textarea.

## 10. Requirement coverage

| User suggestion | Resolution |
|---|---|
| Center input for a newly created chat | Dedicated centered new-chat composition. |
| Suggestions under the centered input | 3–5 supported starter prompts below the pill. |
| Searchable prompt menu | Desktop popover and mobile bottom sheet with search, categories, results, and empty state. |
| Future hundreds of prompts | Scalable prompt metadata and scrollable/filterable results; no claim that content already exists. |
| Floating pill in ongoing chats | Composer becomes a local overlay rather than a full-width layout row. |
| Grow to six lines | Auto-grow to six visual lines, then internal textarea scroll. |
| Controls inside pill | Prompt library, Record, Send, and state controls are contained in the pill. |
| Simple Record icon | Round 44 px microphone icon with accessible name and tooltip. |
| Send icon plus text | Default desktop treatment; icon-only allowed below 420 px. |
| Fade above and area below | Local 32–48 px fade and 20–28 px status/breathing area, not full-width bands. |
| Do not bleed into canvas | Conversation-relative positioning, clipping, and explicit split-view acceptance checks. |
| Canvas uses full vertical space | Composer does not participate in canvas row sizing. |

## 11. Acceptance criteria

### New chat

- At 1440 × 900, the welcome heading, composer, voice disclosure, and at least three prompts appear without page scrolling.
- Selecting a starter or library prompt inserts text without sending.
- Search, category filtering, selection, empty state, Close, Escape, and focus restoration work.

### Ongoing chat

- No full-width opaque composer band is visible.
- The pill is entirely contained within the conversation pane at every supported width.
- One through six lines grow the pill; line seven scrolls inside the textarea.
- The last message can scroll completely above the pill and fade.
- The user’s transcript position does not jump when composing while reading older messages.

### Canvas

- At desktop split widths, canvas content, canvas header, and footer span the full workspace height.
- Pill, fade, status area, tooltip, focus ring, shadow, and prompt browser do not paint into the canvas.
- At tablet/mobile widths, the chat composer is absent while the canvas view is active.

### Accessibility and responsive checks

- Test 320, 375, 390, 768, 1024, 1280, and 1440 px widths.
- All icon-only controls expose accessible names and 44 px targets.
- Focus rings are not clipped by the pill or pane boundary.
- Recording state is not communicated by color alone and its timer does not announce every tick.
- Reduced-motion users do not receive smooth automatic transcript scrolling.
- Software keyboard does not cover the active textarea or Send control.

## 12. Implementation mapping

This document specifies future work; it does not authorize implementation.

| Current area | Planned treatment |
|---|---|
| `.appShell` / `.modeStrip` | Merge disclosure into context bar and remove the separate strip row. |
| `.emptyWorkspace` | Become the centered new-chat composition. |
| `.suggestions` | Remain below the centered composer and source only supported prompt records. |
| `.conversation` | Become the containing block and clipping boundary for the ongoing overlay. |
| `.messageScroller` | Fill the conversation and receive dynamic bottom padding/scroll padding. |
| `.composer` | Share composer semantics but render in centered or floating placement by screen state. |
| `.captureRow` / `.composerActions` | Consolidate into pill-contained state controls. |
| `.mainWorkspace.withReport` | Preserve grid split; ensure composer belongs exclusively to the chat grid cell. |

Prefer a shared `ChatComposer` with placement variants (`centered`, `floating`, `constrained`) and a separate `PromptBrowser`. Avoid a component library, icon package, or state library unless later implementation proves a concrete need.

## 13. Proposed implementation sequence

1. **Shell and containment:** merge the demo disclosure into the context bar, make the conversation pane the overlay containing block, and prove that the canvas retains full height.
2. **Shared composer:** extract the existing form into a shared composer with centered, floating, and constrained variants; preserve drafts, keyboard submission, voice states, and error behavior.
3. **Elastic input:** add one-to-six-line auto-growth, textarea overflow after line six, and synchronized transcript bottom padding without scroll jumps.
4. **New-chat discovery:** move the composer to the centered welcome state and bind the existing supported suggestions.
5. **Prompt browser:** add the bundled prompt model, search, category filtering, desktop popover, and mobile bottom sheet. Keep unsupported future categories empty or absent until vetted content exists.
6. **Icon and status pass:** add newly authored generic symbols, accessible names/tooltips, compact voice states, and below-pill disclosure/error text.
7. **Responsive and canvas QA:** verify mobile keyboard behavior, sidebar drawer, report replacement, desktop split clipping, focus rings, shadows, and prompt-browser containment.

Implement the canvas-containment proof before visual polish. If the pill cannot be reliably clipped without cutting off its own focus indicators, increase its chat-pane inset rather than allowing paint into the canvas.

## 14. Brand basis and deliberate exceptions

**Applied:** EXP-001 task-focused practicality; EXP-003 truthful operational language; DES-001 restrained red/neutral/charcoal recognition; DES-002 alignment and purposeful space; DES-003 readable hierarchy; DES-004 action roles; DES-006 responsive extension; DES-007 application-specific adaptation; DES-009 explicit feedback; PAT-004 task-sized forms and clear actions.

**Preserved:** action red, neutral fields, dark shell, direct copy, clear state feedback, fictional/simulated-data disclosure, and absence of unnecessary imagery.

**Task-local exceptions:** the user-requested floating pill and round Record control depart from the kit’s default square geometry. The exception is contained to this high-frequency chat affordance and balanced with opaque white surfaces, restrained border/shadow, literal tooltips, and CFI action color. It does not redefine the reusable brand system.

**Icons:** the kit contains no reusable original icon library. Any implementation must use newly authored generic interface symbols, disclosed as adaptations, and must not trace the supplied screenshot or brand evidence.

## 15. Verification completed for revision 2.0

- Visually inspected both supplied screenshots, including the 2400 × 538 floating-composer reference.
- Re-read the current proposal, implementation structure, brand manifest, applicable rules, theme, and asset restrictions.
- Mapped new-chat, ongoing-chat, prompt-browser, voice, error, mobile, and canvas states.
- Checked the artifacts for internal consistency and file presence after revision.

Not performed: implementation, browser rendering, interaction testing, build, lint, or automated accessibility testing.
