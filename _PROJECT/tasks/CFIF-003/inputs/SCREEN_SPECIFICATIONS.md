# CFI Group — Data Insights Chat
# Screen Specifications

**Specification ID:** CFI-DIC-SCREENS  
**Revision:** 1.0.0  
**Date:** 16 September 2026  
**Status:** Design and rendering baseline; not an implemented or tested application.  
**Functional authority:** `DATA_INSIGHTS_CHAT_SYSTEM_SPECIFICATION_v1.0.md`, version 1.0.  
**Expression authority:** `CLIENT_KIT_FOR_CHAT.md`, CFI Group CEK Chat 1.0.0 / kit v1.0.0; all kit rules remain working, not client-confirmed.  
**Current delivery:** This Markdown specification only. No screen images, HTML, application code, generated photography, or production validation are delivered.

## 0. Start here

The direction is **CFI Working Desk**: a practical, white-and-pale-gray information workspace, anchored by an intact CFI identity on a charcoal header. CFI red identifies the next action and selected navigation. Clear type, aligned rectangles and literal task language carry the brand; photography, decorative maps and marketing content do not enter the operational workspace.

Retain the system specification's five IDs: **SCR-01 Login; SCR-02 Empty workspace / new chat; SCR-03 Active conversation; SCR-04 Conversation with report canvas; SCR-05 Basic profile.** States are suffixes of these IDs, not additional product destinations. The kit's `SCR-001` naming example does not supersede the system's instruction to preserve its IDs.

**Suggested first render:** `SCR-04 / report-ready / desktop / 1440×900 / CFI-DIC-SCREENS v1.0.0`. Use fixture `FX-REPORT-64`, page 1, horizontal scroll at the first column. This view tests the distinctive three-region experience: recent chats, a rendered Markdown answer with its compact attachment, and the expanded read-only report. It also tests whether the brand remains clear in a dense working interface rather than a marketing hero. See §9.8 for the resolved brief.

**Read in order for a render:** source/asset boundaries (§1), decisions and theme (§2), shared shell/components (§3–4), fictional data (§5), the relevant screen record (§6–10), and the rendering contract (§14). Requirements and acceptance coverage are in §11–13. A screen brief inherits all shared rules; do not improvise another visual system.

### 0.1 Status vocabulary

| Label | Meaning |
| --- | --- |
| **[S] Source fact / source requirement** | Stated in the supplied system specification or kit, or directly inspected in a supplied file. It is not independently verified as a real CFI operational fact. |
| **[A] Working assumption** | A reversible choice needed to complete this particular prototype, not a discovered client fact. |
| **[X] Application extension** | A task-specific layout, component, interaction or safety decision derived from the kit and functional requirements. It does not modify the reusable kit. |
| **[F] Fictional fixture** | Deliberately invented demonstration people, records, results, timestamps and metric definitions. Never present these as CFI business data. |
| **[U] Unresolved external input** | Requires an actual data, identity, technical or business owner before corresponding integrated acceptance. It is not resolved by visual design. |
| **Specified; verification pending** | The behavior is covered here. Neither implementation nor a passing test is claimed. |
| **Out of scope** | Explicitly excluded by the system baseline; no working-looking control is provided. |

**No baseline functional requirement is silently deferred.** All FR-01–FR-28, NFR-01–NFR-06 and AC-01–AC-22 are mapped. Backend-only obligations remain mandatory backend/test contracts rather than invented screens. Live integrations remain unresolved where their inputs are missing.

## 1. Source register, inspection and asset boundaries

### 1.1 Authority and exact attachments

Use `SYS` below for the supplied system specification and `KIT` for the supplied working brand kit. Portable citations in this document use source ID plus original section/requirement/rule ID. They remain readable when this file is moved to another chat or repository. Source files are not reproduced here.

The `(1)` suffix is an attachment filename suffix, not a newer source version. The two Markdown documents and all six reference images were available and inspected. No website refresh or repeat brand discovery was performed.

**SYS — `DATA_INSIGHTS_CHAT_SYSTEM_SPECIFICATION_v1.0(1).md`**  
Functional contract, original screen IDs, FR/NFR/AC, defaults and integration boundaries.  
SHA-256: `bf1772b8406e8d053d4b22c270f252f0c61b4d8b4808bb549e25ca9de5176326`

**KIT — `CLIENT_KIT_FOR_CHAT(1).md`**  
Working CFI expression, consumer contract, 22 rules, theme and reference-only restrictions.  
SHA-256: `9af7fbf37acaa21d361a57711769b1120c894fb58ea64de71e8c11810bbfb6e4`

**LOGO — `CFI_logo.svg`**  
Newly supplied standalone identity file; updates the older kit statement that no identity file is attached.  
SHA-256: `ad04dfac4e45465a0b0614ee334d7e301805f1ece9723bb850c8074ed967d9a7`

The kit's **canonical kit-tree fingerprint** is `29ffdd66a21461c534f7af8cdb137da8fb6d2ece18704fad9bb75143535b7b3e`. It identifies the kit's declared canonical tree; it is not the hash of the attached chat packet and is not a client-approval signature. The packet hash above was computed from the actual attachment.

### 1.2 Six inspected visual references — application consequences only

These are file-pixel dimensions, not measured browser viewports or responsive breakpoints. Inspection confirms the kit's applicable visual roles; it does not establish the website's live CSS or behavior.

| Evidence / current file | Inspected dimensions | Relevant appearance | Resolved use / boundary |
| --- | --- | --- | --- |
| EV-001 · `CFI_REF_01_home(1).png` | 489×2048 | Dark architectural opening; broad light information fields; red actions; charcoal proof/contact areas. | Transfer alignment, neutral fields and restrained contrast. Do not import its long marketing sequence, form, phone number, testimonials or photos. |
| EV-002 · `CFI_REF_02_service(1).png` | 417×2048 | Centered photo opening, light benefit sections, dark proof blocks, disclosure rows; visibly repeated/seamed regions. | Use compact disclosure language for secondary metadata. Repetition, seams and clipping are not design instructions. No interior photo or FAQ section is required. |
| EV-003 · `CFI_REF_03_portfolio(1).png` | 783×2048 | Aligned image rows, red text actions, scope labels and a white/charcoal rhythm. | Transfer alignment and selected-state emphasis only. Its scope filters do not authorize report filters or a new portfolio screen. |
| EV-004 · `CFI_REF_04_navigation_hover(1).png` | 1382×888 | Red active tab above an opaque white dropdown with spacious dark labels. | Adapt to the account-menu trigger and white disclosure panel. App actions remain Profile / Log out, not the website navigation. |
| EV-005 · `CFI_REF_05_button_hover(1).png` | 938×446 | Pale rectangular button, red border, red label on a dark setting. | Primary buttons use this hover endpoint; keyboard focus is separately specified. No measured animation or hover timing is claimed. |
| EV-006 · `CFI_REF_06_card_hover(1).png` | 1022×820 | White rectangular heading/action/photo card with diffuse shadow. | Do not apply its media-card shadow to every answer, row or attachment. There are no image-led cards in this product; preserve the interaction distinction, not the card itself. |

### 1.3 The supplied logo changes availability, not the brand rules

**[S, inspected]** `CFI_logo.svg` has an outer width of **169**, height **43**, and `viewBox="0 0 169 43"`. It wraps an embedded **1192×302 PNG** through an SVG pattern; it is **not an all-vector path logo**. Its visible treatment is a warm orange/red circular mark with a white CFI GROUP wordmark. Inspection found an internal fragment reference and an embedded PNG data reference, with no external asset reference, script element or event-handler attribute. This is source inspection, not a general security certification.

**[A]** Treat the identity file explicitly supplied for this same-brand task as the intended prototype identity. Use the intact supplied SVG, not a traced or recolored replacement. This does not establish ownership, broad redistribution rights, official clear space or a brand-approved minimum size. Those remain unverified. The old kit's missing-logo instruction is now conditionally satisfied for this task; other missing originals remain missing.

**[X] Placement:** desktop header 169×43 CSS pixels, with a selected minimum 12-pixel quiet surround; tablet 152×38.67; phone 126×32.06. These sizes are chosen, not official identity specifications. Use a charcoal backing so the white wordmark reads. Preserve the outer SVG's aspect ratio and internal composition. Never stretch, filter, redraw, isolate the ring or recolor the wordmark. Do not use this raster-backed asset as a large wall-scale graphic.

If a later renderer cannot use the actual file, the already resolved fallback is plain live text **CFI Group**, white on charcoal, with no invented mark. Disclose that substitution. For an image concept, exact logo reproduction is not guaranteed; do not call a model-drawn approximation the original. In later HTML, the actual intact supplied asset is the required identity when inclusion is permitted.

### 1.4 Asset dispositions

| Asset ID | Disposition in these screens | Reason / fallback / later handling |
| --- | --- | --- |
| AS-APP-001 · supplied CFI logo | Use intact on SCR-01–SCR-05 headers. No new logo asset is generated. | User-supplied standalone file; same-brand task use only. Fallback: plain CFI Group label. Keep private source metadata and inspection derivatives out of UI. |
| AS-REF-001–006 · six screenshots | Reference-only; never embed in UI and never extract photographs, logo pixels, icons or legal copy. | May accompany the same-brand continuation as supplied references, subject to the kit boundary. They are not reusable production artwork. |
| AS-APP-002 · fonts | Use Arial, Helvetica, sans-serif from the local environment. | Exact brand font is unverified. No external font request, font binary or bundled font file. |
| AS-APP-003 · profile avatar | Use JE or RC initials for fixtures. No portrait is supplied. | Show an authorized actual avatar only when provided by the implemented identity system; load failure falls back to initials. Do not invent an employee photograph. |
| AS-APP-004 · functional icons | Specify newly authored, simple line icons: menu, plus, microphone, stop, close, chevrons, table and warning. | Application extensions, not recovered CFI icons. Later implementation may use local inline vector glyphs; names and text labels carry meaning. No icon package/network dependency is prescribed. |
| AS-APP-005 · property photography | Omitted from all five screens. | It does not improve this chat/report task. Original property imagery remains missing; omission is intentional, not an invisible placeholder. |
| AS-APP-006 · environmental linework / map | Omitted. | No original was supplied and operational density does not justify new decoration. |
| AS-APP-007 · favicon / alternate logo variants | Not supplied; not a screen dependency. | Do not crop the ring out of the logo to manufacture a favicon. Leave unspecified for production identity supply. |
| AS-APP-008 · charts / generated images | Not used. | Charts are out of scope; no screen needs illustrative generation. No reusable image asset is claimed. |

## 2. Resolved shared direction and decisions

### 2.1 CFI Working Desk

**Recognition:** real supplied identity on one charcoal header; red primary actions; white conversation and report rows; pale-gray navigation/context surfaces; black/gray typography; square controls. The application is light themed. A dark header does not establish a dark mode.

**Hierarchy:** current conversation → submitted question → answer → optional report → expanded detail. The report canvas is a larger reading surface, not an analytics dashboard. Do not add KPI tiles, hero photography, gradients, glass blur, ornamental illustrations, chat-bubble tails, AI sparkles, a robot avatar, testimonials, stars or marketing CTAs.

**Density:** the conversation keeps a readable text measure; the table remains a table with horizontal scrolling. A ten-column report must never be squeezed into ten illegible columns to fit a screenshot. Broad alignment and clean section boundaries transfer from the kit; the website's giant headings and marketing spacing do not.

**Language:** use the product name **Data Insights Chat** beneath/alongside CFI identity. Assistant label: **Data Insights**. Literal actions: **New chat**, **Send**, **Record**, **Stop recording**, **Cancel**, **Open report**, **Close report**, **Previous page**, **Next page**, **Profile**, **Log out**. Do not use “Start a Conversation” as an operational button. Fixture records use multi-family/property/scope vocabulary without claiming real CFI work.

Sources: KIT EXP-001–004; DES-001–009; PAT-004/006; SYS §§1–4, 14.1.

### 2.2 Prototype decision log

| ID / class | Resolved decision | Boundary / affected areas |
| --- | --- | --- |
| XD-01 [X] | Keep five original SCR IDs and model all other experiences as states, shared controls or backend contracts. | SYS §14.1; no dashboard, settings suite or report library. |
| XD-02 [X] | Use CFI Working Desk; app title sizes are smaller than marketing title tokens. | Do not rewrite the kit. All screens inherit the same app scale. |
| XD-03 [A] | Use the supplied raster-backed SVG intact on charcoal. | New attachment satisfies earlier logo-availability gap for this task; legal/official identity specifications remain unverified. |
| XD-04 [X] | At ≥1280 CSS pixels use 248px sidebar + conversation + right canvas; canonical 1440 split is 248 / 416 / 776. | New design dimensions, not measurements from references. |
| XD-05 [X] | At 768–1279 show a 216px sidebar and one main region; an open canvas replaces the conversation region. Below 768, sidebar is a drawer and canvas occupies main content. | No compressed three-pane phone layout. Close returns to the preserved conversation. |
| XD-06 [X] | Profile is a read-only main-region route; shell remains present. Save and restore the prior workspace view. | No modal account editor and no Settings action. |
| XD-07 [A/F] | Design renders use synthetic fixtures and a fixed 16 September 2026 UTC reporting date. | Persistent synthetic label. Not a claim about CFI timezone, employees, data or integration. |
| XD-08 [X] | Use semantic text/status icons on neutral surfaces; red is never the sole error, access or pending signal. | No invented brand status palette and no blue primary form action. |
| XD-09 [X] | Drafts and reading positions are per-chat, session-memory UI state. Saved chats/messages/snapshots are durable backend state. | Logout clears unsent drafts; integrated persistence cannot be replaced by browser-only storage. |
| XD-10 [X] | One recording/transcription interaction at a time per browser tab; guard navigation away from its originating context. | Does not limit separate AI requests in different chats. No AI-request cancellation button is added. |
| XD-11 [X] | Report previews use Bid ID, Status, Bid amount and Currency at desktop; phones show Bid ID and Status. | Both are actual subsets of the same snapshot. Additional-column labels become +6 or +8 respectively. |
| XD-12 [X] | Use metadata disclosure for period, filters, queried-at and source freshness; keep essential period/filter context visible in answer/canvas. | Secondary provenance may collapse; disclosure cannot hide a truncation or missing-data warning. |
| XD-13 [X] | Report ordering is Created at descending, then Bid ID descending for the fixture. No clickable sort/filter headers. | Real ordering/schema comes from the approved analytics contract. |
| XD-14 [X] | Use complete Markdown responses, not streaming or staged invented answer text. | Processing stage labels only reflect actual known request state; SYS D-05. |
| XD-15 [X] | Treat optional standalone HTML later as a local experience demo, explicitly distinct from a durable synthetic application. | KIT local/offline requirements do not waive SYS server persistence, authentication or actual-recording acceptance. |
| XD-16 [X] | On a detected access revocation, remove affected cached rows/previews before rendering an access limitation. | Server rechecks every protected request. No promise of instantaneous revocation detection without an actual signal. |
| XD-17 [X] | All safe reversible design decisions are adopted now. Human approval is not a progression gate for screen design. | Actual data definitions, permission scope and external-provider behavior cannot be invented as client facts. |

### 2.3 Semantic theme and app-scale overrides

Color/font foundations below are the kit's working values, not extracted live CSS. New app dimensions are marked [X]. Use the same tokens across all screens and states.

| Role / token | Value | Application use |
| --- | --- | --- |
| Primary text · `--ce-color-text` | #1D1D1D | Headings, answers, table values, profile labels. |
| Muted text · `--ce-color-muted` | #555555 | Readable timestamps, help, empty optional fields. |
| Primary surface · `--ce-color-surface` | #FFFFFF | Conversation, table, menu, inputs. |
| Alternate surface · `--ce-color-surface-alt` | #F0F0F0 | Sidebar, mode strip, report context, primary hover. |
| Primary action · `--ce-color-action` | #D4111D | Send, Sign in, New chat; selected accent and disclosure indicator. |
| On action / inverse | #FFFFFF | Filled red button labels; header labels. |
| Control border · `--ce-color-border` | #767676 | Inputs and actionable secondary control boundaries. |
| Quiet divider · `--ce-color-divider` | #D9D9D9 | Panel separators, table rows, message grouping boundaries. |
| Inverse / inset inverse | #1C1C1C / #2F2F2F | Global header and avatar backing. No dark data table. |
| Primary hover | #F0F0F0 fill; #D4111D label and 1px border | No movement, scaling or drop shadow on a primary button. |
| Focus | #1D1D1D on light; #FFFFFF on charcoal | 2px outline, 3px offset; ensure focus is not clipped. |
| Font stack | Arial, Helvetica, sans-serif | Offline-safe selected fallback, not a verified CFI typeface. |
| Weights | 400 body; 600 headings; 700 actions | Local font rendering may resolve weights differently. |
| App page heading [X] | 28px / 34px desktop; 24px / 30px phone | Empty workspace, Login and Profile. Not the kit marketing hero size. |
| Panel heading [X] | 22px / 28px; phone 20px / 26px | Report title and major in-app subheadings. |
| Chat title [X] | 18px / 24px; at most two visible lines | Full title remains accessible; do not change the saved title. |
| Answer / form body | 16px / 24px | Readable primary text; answer measure ≤65ch. |
| UI labels / table values [X] | 14px / 20px | Compact labels, report rows, controls; timestamps may occupy two lines. |
| Micro metadata [X] | 12px / 18px | Only short timestamps, mode label and overline. Never the main answer or report values. |
| Geometry / spacing | 0px control and panel radius; 4px spacing unit | Normal gaps 8, 12, 16, 24 and 32px. No pill-shaped input. |
| Control target | At least 44×44px for interactive controls | Larger hit region may surround a smaller icon. |
| Table geometry [X] | 48px header; rows at least 56px desktop | Allow row growth for content. Do not clip values to maintain a uniform height. |
| Motion | 160ms ease-out for color/border only | Use 0ms under reduced motion. No animated decorative background. |
| Disabled controls [X] | #F0F0F0 fill, #555555 label, #D9D9D9 boundary | Provide adjacent reason; do not rely on low opacity alone. |
| Status treatment [X] | Charcoal label and named icon on white/pale gray | Error may add a thin red rule; words distinguish Error, No data, Access limited and Processing. |

Neutral separators are not control boundaries. Preserve the stronger control border and visible focus for interactive elements. Color selections and dimensions are specifications, not measured accessibility or rendering results. Contrast, zoom, focus clipping and actual font rendering remain implementation checks.

## 3. Shared shell, navigation and responsive transformations

### 3.1 Route/state model

| Destination | Proposed route | Ownership / history behavior |
| --- | --- | --- |
| SCR-01 | `/login` | No protected content. Safe optional expired/signed-out notice. |
| SCR-02 | `/app` | Authenticated, unsaved blank conversation. New chat does not create a stored row until first submission. |
| SCR-03 | `/app/chats/{chatId}` | Server verifies current user's ownership and relevant access. IDs in the browser are not authorization. |
| SCR-04 | `/app/chats/{chatId}?report={artifactId}&page=1` | The selected artifact must belong to this chat/answer and current authorized scope. |
| SCR-05 | `/app/profile` | Current user's read-only profile. Previous chat, report, page and scroll state remain in session-memory return context. |

Routes are an application extension; equivalent implementation routes are acceptable if these behaviors are retained. Do not expose another user's identity, report title or row count in an unauthorized-route error.

Opening a report creates one navigable view state. Pagination replaces that state instead of creating one history entry per page. Browser Back can close a report. The explicit close action resolves the originating chat route; it must not accidentally leave the application when a report URL was opened directly. An invalid page index is corrected to the nearest valid snapshot page after authorized metadata loads and announced; an empty report has no numbered page.

Successful login opens SCR-02 as required by AC-01. An interrupted deep-link destination may be offered as a **Return to conversation** action only after the server has revalidated ownership/access; it is not silently opened with cached content. No such extra action appears in the primary render fixture.

### 3.2 Header and mode strip — CMP-01

**Desktop, ≥1280:** 72px charcoal header, full width. Left identity region aligns to the 248px sidebar; intact logo is 169×43 at x=24, vertically centered. Product name appears in the main header, left aligned with 24px inset after the sidebar. Right account trigger shows **Jordan Ellis**, **JE** initials and a downward chevron; its accessible label is **Open account menu for Jordan Ellis**. No search, notifications, settings, theme toggle, marketing navigation or website links.

A 32px pale-gray mode strip sits below the header and above all body regions. Exact text: **Synthetic demo · Fictional data · Reporting timezone: UTC**. It is visible on every authenticated view, including canvas and profile. Login has the same synthetic designation, without exposing user-specific information. This strip is informational, not a switch to live mode.

**Tablet, 768–1279:** header remains 72px; logo 152×38.67; sidebar 216px. Product name and account name may use the available width; collapse the visible account name before truncating the product name. Initials button keeps its accessible full-name label.

**Phone, <768:** 64px charcoal header with **Open chats** icon button left, centered 126×32.06 logo, JE account button right. The logo is not a navigation link. A 56px pale-gray strip below has two lines: **Data Insights Chat**, then **Synthetic demo · Fictional data · UTC**. Do not squeeze the desktop product title, long mode string and name into the same row. On Login omit the chats/account buttons; center the logo.

The header/strip remain visually stable while conversation or report regions scroll. Use available dynamic viewport height; do not overlay the composer on the mobile keyboard or double-scroll the entire application shell.

### 3.3 Chat sidebar / drawer — CMP-02

Desktop sidebar is pale gray with a 1px right divider, 24px inset and a top **New chat** red button, width 200px, height 44px. Below: **RECENT CHATS**, then optional plain date group labels. No chat search, overflow menu, delete, manual rename or pin control.

Each chat row has a stable ID, title in up to two lines, and a short activity time. Use a 3px red left edge, a light/white backing and an explicit selected state for the active chat; do not use red fill across the entire sidebar. Nonselected row hover uses a subtle white field, no diffuse media-card shadow. A pending chat adds **Reply in progress**; an inactive chat with a newly completed reply may add **New reply** [X]. Neither label contains sensitive answer content. Reading a chat does not change recency.

Sort by most recent **persisted user or assistant message timestamp descending**, then stable chat ID ascending for exact ties [X]. Use full timestamps for ordering, not the displayed minute. A pending first submission reads **New chat** until a canonical title is assigned from its first persisted question. Strip Markdown syntax, normalize whitespace, store a plain-text title capped at 60 Unicode code points [X], and keep the full question inside the conversation. Render no user HTML in a title. Reordering after background completion must not move keyboard focus to a different row.

At tablet widths, sidebar inset is 16px and New chat fills the available width. On phone it is a modal drawer, width `min(320px, viewport − 48px)`, below/alongside the shell with its own close control. The drawer has a heading **Chats**, traps focus, closes on Escape/outside activation, and returns focus to **Open chats**. Selecting a chat closes the drawer and focuses the conversation heading. Keep the same list order and selected state across all widths.

List loading shows neutral skeleton rows and **Loading chats…**. List failure shows **Your chats could not be loaded.** and **Retry**; the new-chat surface may remain available only if the authenticated backend is reachable. A genuinely empty list shows **No chats yet** and **Your first sent question will appear here.** No fake saved chats are inserted into the empty-state variant.

### 3.4 Account disclosure — CMP-03

Click or keyboard activation toggles an opaque white panel aligned to the trigger's right edge, 208px wide. The open trigger receives the red selected treatment, adapting EV-004 without importing its large marketing menu. Panel actions, in order: **Profile**, **Log out**, each at least 44px high. Profile navigates to SCR-05; Log out invokes session invalidation and SCR-01. No Settings label.

Use a semantic menu-button pattern or equivalently correct disclosure with keyboard-operable actions. Enter/Space opens; supported menu-arrow navigation follows the chosen semantics; Escape closes; outside activation closes; focus returns to trigger on dismissal. Do not open exclusively on hover. On narrow screens the panel stays within the viewport with at least 12px side clearance. Selecting an action resolves any active recording/transcription navigation guard first; an actual forced session expiry does not wait for confirmation.

### 3.5 Conversation and canvas responsive geometry

| Viewport | Workspace without canvas | Workspace with canvas | Profile |
| --- | --- | --- | --- |
| ≥1280 | 248px sidebar; conversation fills remainder; message column max 800px, centered in available area | 248px sidebar; conversation width `clamp(400px, 35% of remaining width, 520px)` rounded down to a 4px increment; canvas gets the rest. At 1440 use exactly 248 / 416 / 776. | Sidebar stays; read-only content max 720px in the main region. |
| 768–1279 | 216px sidebar; conversation fills remainder | Sidebar stays; canvas replaces the conversation main region; **Back to conversation** is visible. Conversation state stays mounted or recoverably retained. | Same 216px sidebar; profile fills the main region with normal margins. |
| <768 | Sidebar drawer; full-width conversation; 16px side inset | Full-width canvas in main region; no composer while report is foreground; **Back to conversation** returns to the same position and draft | Sidebar drawer available from shell; profile in one column, normal vertical scroll. |

At 1440×900, header + mode strip occupy y=0–104. Body has 796px available. Chat title area is 80px; canonical composer is approximately 208px high; its transcript/error variants may grow. The message region receives the remaining height and owns its vertical scroll. The report uses its own title/context region, table scroll region and fixed-in-panel pagination footer. No report canvas overlays a visible but unusable composer.

The first-render layout chooses a 188px canvas title/context region and 64px pagination footer, leaving approximately 544px for table header, rows and horizontal scrollbar. These are designed framing values; use content-driven growth rather than clipping if text size or font metrics require more space. At shorter heights prioritize a usable scrolling table over a large title region.

**At 390×844:** header 64 + mode strip 56; remaining content is 724px before the software keyboard. Main inset 16px. The canvas preserves all ten columns through local horizontal scrolling and paging; it does not convert the report into unrelated summary cards. Only the table/preview's intentional scroll region may overflow horizontally, not the page itself. At 320px and browser zoom, controls reflow and labels wrap; do not shrink the body text to simulate fit.

### 3.6 Navigation, restoration and focus rules

A chat switch stores its current reading position and unsent draft, closes the foreground report and loads the selected chat's own context. It does not bring a prior report/filter/person into a new chat. Returning within the session restores that chat's draft and reading position. New chat always opens a clean scratch conversation; leaving and returning to an existing chat does not create extra blank history entries.

Opening a report stores the source message/scroll anchor and moves focus to the report heading/close control. Closing returns focus to the originating **Open report** control and restores its reading position; if the user subsequently scrolls the visible desktop conversation while the canvas is open, preserve the latest reading position instead of jumping to a stale one [X]. Opening another attachment replaces the selected canvas; late fetches for the previous artifact cannot overwrite it.

Profile navigation stores the whole current workspace view, including the selected artifact/page, so **Back to conversation** can restore it after access revalidation. Selecting another chat from Profile goes to that chat instead. Authentication expiry supersedes all these restorations: immediately clear protected views and transient content, then show Login. Saved server history is not deleted.

While an answer is pending, switching chats, viewing Profile and drafting elsewhere are allowed. Each completion belongs to its original chat/request, including sidebar recency. Do not auto-open the completed report or force the user back to that conversation. Auto-scroll to a new answer only when the reader was already near the end; otherwise show an accessible **New answer** in-conversation jump control [X]. Never move focus just because processing finishes.

### 3.7 Recording/transcription leave guard — CMP-09

Before a deliberate chat switch, New chat, Profile navigation, report opening that replaces the composer on a narrow screen, or Log out during capture/transcription, show a local confirmation:

- Recording: **Discard recording?** / **This recording has not been sent. Discard it and continue?** Actions **Keep recording** and **Discard and continue**.
- Transcribing: **Cancel transcription?** / **The transcript has not been added to your question. Cancel it and continue?** Actions **Keep transcribing** and **Cancel and continue**.

Initial focus is the nondestructive action. Escape returns to the original interaction. Confirmation discards only the temporary recording/transcription and releases the microphone; preserve the typed draft. On desktop, merely reading a concurrently visible report need not change recording ownership; selecting another chat still does. Forced expiry/logout completion clears audio/drafts even if a dialog was open. Browser close/reload is best-effort cleanup, not a promise of a guaranteed browser confirmation; the server's temporary-audio expiry must clean up abandoned uploads.

## 4. Shared component, interaction and state contracts

### 4.1 Actions and fields — CMP-04

Primary action: square red fill, white 14px/700 label, minimum 44px height, 16px horizontal padding. Hover uses the observed pale field/red border/red label. Focus uses the separate visible outline. Secondary action: white/light field, dark label, 1px control border. Tertiary action: red underlined text with a clear hit area. Do not show every attachment operation as a red-filled button; **Send** remains the composer's primary action.

Inputs have visible labels, white background, 1px #767676 boundary and 16px text. Field error text is associated with the input and reads as a sentence; mark invalid state programmatically. Do not use placeholder text as the only label. Pending controls display a verb/progress label and prevent duplicate activation. Disabled controls have an adjacent reason. Icon-only controls retain readable accessible names.

### 4.2 Composer — CMP-05

Order: visible **Your question** label → multiline input → action row → hint/status line. Placeholder: **Ask about bids, people or a reporting period…**. Action row: **Record** with microphone icon on the left; **Send** on the right. Hint: **Enter sends · Shift+Enter adds a line** on keyboard-first devices; **Review your question, then send.** on touch-only layouts. A hardware keyboard on mobile retains the same Enter behavior.

Default input height 64px, grows to 160px then scrolls internally. Canonical outer padding is 16px vertically / 24px horizontally at desktop, 16px on phone. The composer is an anchored region, not a floating rounded capsule. When the mobile keyboard opens, it moves into the visible viewport; conversation content scrolls above it. On very short heights it may use compact padding but cannot obscure the input or Send.

**Validation:** reject whitespace-only input. Exact helper on an attempted empty submission: **Enter a question to send.** Set a 4,000 Unicode-code-point limit [X clarification of D-11]; show the counter from 3,600 onward and whenever over limit. Do not silently truncate a typed or appended transcript. Over-limit text remains editable; Send is unavailable, with **Your question is over 4,000 characters. Shorten it before sending.** and the count. Handle input-method composition before Enter; composition-confirming Enter never submits.

**Submission:** Enter/Send submits the current reviewed text once. Shift+Enter inserts a line break. Show one optimistic user message with **Sending…** until acknowledgement, then the persisted message/time. The first submission atomically or equivalently retry-safely creates its chat. Save a submission ID before network transport; repeat activations/retries reuse it. A transport interruption after acceptance must recover the existing chat/request, not create a new one.

**While processing:** allow editing/recording a next draft; disable its Send within the same chat with **Wait for this reply before sending another question.** Other chats remain usable. The previous submitted question is no longer the editable composer text. Do not expose edit-message, regenerate-successful-answer or AI-request-stop controls. Once a failed turn is terminal, typing another question is permitted; retry of the failed turn is allowed only when the server still marks it eligible and no same-chat request is active. A superseded earlier turn displays its failure but no active Retry [X].

### 4.3 Recorded input — CMP-06

Microphone permission is requested only on **Record**, never on page load or focus. The integrated implementation uses actual device capture. Synthetic visual/interaction fixtures use a clearly labeled **Simulated recording** state; a timer animation alone does not prove recording.

Recording state replaces the composer action row with **Recording · 00:12 / 02:00**, **Stop recording** and **Cancel**. The draft text stays visible/editable but Send is unavailable until capture/transcription resolves. Do not allow two concurrent microphone captures. At 02:00 stop safely, release the device, announce **Recording limit reached. Preparing your transcript.**, then transcribe the captured audio. Cancel discards it and retains any typed draft.

Stopping immediately releases capture and starts **Transcribing…** with **Cancel transcription**. Timeout is 30 seconds from accepted transcription work under D-12, not a provider-performance claim. Typed changes remain possible while waiting. When the result arrives, take a snapshot of the **current** draft and append the returned transcript at its end, separated by a blank line when the draft was nonempty. Do not use an earlier draft snapshot that would overwrite intervening typing.

Ready state: editable combined input plus **Transcript added. Review it before sending.** and **Discard transcript**. Never auto-send. The message persisted on explicit Send is the final edited combined text; input mode is `voice` if the retained text includes the voice-origin contribution. A small **Voice input** message label is optional but selected for this design; it is not a playback control.

**Discard transcript:** if unchanged after append, restore the exact pre-append draft. If the combined text was edited, confirm **Discard the reviewed transcript?** / **This restores the question text from before the transcript was added. Changes made during transcript review will be discarded.** Actions **Keep editing** / **Discard transcript**. This prevents silent loss of pre-existing typed content or later review edits. Canceling a transcription before append never needs to revert current typing.

Every capture/transcription has a session generation token and originating draft/chat ID. Cancellation, switch, logout or expiry invalidates it. Late transcripts are discarded, not attached to the current screen. Application-held raw audio is deleted after completion/cancel/failure, with server expiry for abandoned temporary files. No waveform recording is saved in history and no audio playback, spoken reply or live call exists. Provider-side retention is unresolved separately.

### 4.4 Messages and rendered Markdown — CMP-07

Use plain, aligned message groups rather than oversized speech bubbles. User group has **You** plus small time and literal safely rendered text on a pale-gray rectangular surface. Assistant group is white with **Data Insights** plus small time and rendered Markdown. Assistant prose remains readable with a maximum 65ch measure; on a 416px conversation it simply wraps naturally.

Every completed assistant reply, including clarification, zero, no-data and supported limitations, has a nonempty `bodyMarkdown`. Render headings, paragraphs, emphasis, lists, safe links, inline code and fenced code. Use semantic heading levels within the message without displacing the screen's own heading hierarchy. Code is display-only and never an execution control. No raw-text / HTML / Markdown selector, raw-response tab or raw-SQL panel.

Disable raw HTML/active content and unsolicited remote images. Render table cells and user text as data. Reject unsafe link schemes; allow application-relative destinations and validated HTTPS links according to the implementation's allowlist. Do not transform data-row text into instructions. A safe in-document link can target the matching message's scoped heading. Long links/code may wrap or scroll within their own block, not overflow the screen. An actual structured report always stays in its attachment, not pasted wholesale into Markdown.

Request-stage and technical-error blocks are **application UI**, not empty/fake assistant replies. An empty Markdown response or malformed successful payload is a contract failure: **The answer could not be displayed. Retry this question.** Show eligible retry on the original turn; do not publish a fake complete assistant message.

### 4.5 Pending and retry — CMP-08

Show a local submitted/pending state promptly; SYS NFR-03's 300ms is a validation target, not a measured result. Use **Working on your question…** when no more specific stage is known. If the backend reports stages, use **Question queued**, **Checking the selected data…**, **Preparing your answer…** or **Saving your answer…**. Do not invent progress percentages or simulate a warehouse stage as real.

One turn has one logical request and one active attempt. At the provisional 90-second answer timeout, show **This answer took too long. You can retry this question.** only when the backend reports an eligible terminal failure. If the server remains running, show **Still checking the request status…** instead of starting a competing attempt. If status cannot be established, show **This request was interrupted. Check its status or retry when available.** with the action returned as safe by the backend.

**Retry answer** reuses the same logical turn/user-message identity, creates or selects an eligible attempt, and disables during acceptance. A superseded/timed-out attempt cannot publish a later duplicate answer. Refresh asks for known request status; it does not automatically resubmit. A response completed while its transport was lost is recovered as the original successful answer. There is no Retry on an already successful reply.

An existing response to valid data can be published without a requested attachment only when it explicitly says the report could not be saved. Example in §7.4. Do not display an attachment with an invented identifier or an Open report control that cannot work.

### 4.6 Attachment preview — CMP-10

A white rectangular attachment panel follows the assistant's Markdown. Structure: table icon + title → count/truncation line → small actual-data preview → additional-column cue → **Open report →**. No property photograph and no diffuse media-card hover. The whole title/preview area can activate the same report as the explicit action; implement it with one primary focusable opening control or an equivalent accessible pattern without nested interactive elements. Allow text selection in the preview; it must not unexpectedly open on selection. Pointer activation on the non-control preview surface is a convenience, not the only way to open.

Use the first three rows of the persisted deterministic ordering, never separately invented preview data. Desktop columns: **Bid ID / Status / Bid amount / Currency**. At <768 use **Bid ID / Status**, with **8 more columns in the full report** instead of 6. Preview values use readable 14px text. In the 416px conversation, inner preview width fits these four compact columns; it does not shrink all report columns into the card.

Primary title: **Bids created: 9–15 September 2026**. Count line: **64 rows · 10 columns**. Footer: **Preview: 3 of 64 rows · 6 more columns**. At cap, replace count wording using §9.4, on both preview and canvas. A valid zero-row preview retains its title and column count, shows **No matching rows**, and still provides Open report to inspect context/schema. Unavailable or denied attachments display status without a working-looking Open control.

### 4.7 Canvas table and provenance — CMP-11 / CMP-12

The report panel is an `aside`/labeled region when side-by-side, and the main labeled report surface on narrow screens. It is not a modal at desktop: the visible conversation stays usable. Header: title + close/back control; visible date basis, period and material filters; counts; synthetic/source marker; a **Report details** disclosure for complete provenance. Keep truncation and partial-coverage warnings outside the disclosure.

A semantic table has a caption, header cells associated with data cells, stable typed column labels, and deterministic row ordering. Sticky header stays readable during vertical scroll. A chosen sticky **Bid ID** first column aids cross-column reading [X]; ensure it does not cover the adjacent cell or hide focus. The remaining columns scroll horizontally with a visible scrollbar and instruction **Scroll horizontally to see all 10 columns.** No sort arrows, column-menu controls, filters, selection checkboxes, row actions, totals footer, export, download or spreadsheet editing.

Values preserve IDs with leading zeros; decimal precision and currency codes; timestamps with explicit UTC for this fixture; and a null marker **—** explained by **— means no value supplied, not zero.** Text wraps when needed. Identifier or timestamp copy remains possible as ordinary selection; no new copy/export toolbar is added. Never show an amount without its currency context. Do not sum different currencies.

Pagination footer: **Rows 1–50 of 64 · Page 1 of 2**, **Previous page**, **Next page**. Previous is disabled on page 1; Next on page 2. Page size 50 is fixed for the baseline; no page-size selector. On page change reset table vertical scroll to its header while preserving horizontal position, announce the new page, and keep focus on the activating control or stable footer region if it becomes disabled. Old rows cannot remain labeled as the new page during loading.

**Report details** uses PAT-006's light disclosure with red indicator. Exact fields: **Data mode; Reporting timezone; Date basis; Period start; Period end (exclusive); Applied filters; Queried at; Data updated through; Snapshot rows; Total matching rows; Ordering**. Use source-provided values; if freshness is absent show **Not supplied by the data source**, never copy the query time into it. Internal credentials, SQL, prompts, security-scope IDs and provider diagnostics do not appear.

### 4.8 Global feedback and accessibility — CMP-13

Use named status and icon plus text; do not rely on red, gray, a spinner or an animation alone. Major pending/completed changes use a polite status announcement; blocking validation and safe error summaries use appropriately assertive announcements without repeatedly reading a timer. Associate field errors with fields. A recording timer announces start, limit and stop, not every second.

Keyboard order follows visual task order: skip-to-conversation/main link → header account/chats controls → sidebar → main content controls → composer; canvas opening moves focus explicitly to its labeled report region. Both conversation and canvas are keyboard reachable when coexisting. The mobile drawer/confirmation dialog alone trap focus; the desktop report does not. Escape closes the topmost menu/drawer/dialog; it must not close a report while the user is handling a nested confirmation. Provide a visible focus ring, readable control labels, and a non-hover way to perform every action.

Error copy is safe and local. Never include stack traces, raw SQL, credentials, another user's name, another chat title or restricted row counts. A log correlation/request ID may be present as plain **Reference: …** on a failed turn if authorized; it is not a debug console.

## 5. Representative fictional data and exact answer library

### 5.1 Fixture boundary

Everything in this section is **[F] fictional**: people, employment labels, account addresses, properties, bids, amounts, access scopes, results and timestamps. “Demo” property names are not assertions of CFI clients or completed projects. These fixtures establish a consistent rendering/test vocabulary, not the organization's data model or reporting policy.

**Fixture clock:** accepted question date fixed at **16 September 2026**, reporting timezone **UTC**. The main report request is accepted at **2026-09-16T12:00:00Z**; query time **12:00:04Z**; answer persisted **12:00:06Z**. Its fictional source watermark is **2026-09-15T23:59:59Z**. A captured snapshot stays fixed when a later question is asked. Synthetic login/demo behavior must not be presented as live authentication.

**Fixture-only semantic contract:** one business bid is identified by its string Bid ID. Created count uses distinct IDs and `createdAt`; won count uses distinct IDs, `wonAt`, status Won, and the specified win-credit person. Creator, owner and win credit are separate fields. Base fixtures contain no reversal/exclusion policy beyond excluding an explicitly marked test-invalid variant; actual live mappings/definitions require U-02. Use half-open ranges internally and show inclusive human-readable dates.

### 5.2 People and profile fixtures

| Object | Exact visible data | Role / boundary |
| --- | --- | --- |
| U-A · signed-in fixture | Display name Jordan Ellis; first name Jordan; last name Ellis; email jordan.ellis@cfi-demo.example; designation Business Development Manager; department Estimating; initials JE. | Fictional authenticated user and owner of C-A01–C-A03, not a real employee. |
| U-B · isolation / missing values | Display name Riley Chen; first name Riley; last name Chen; email riley.chen@cfi-demo.example; designation null; department null; initials RC. | Owns a separate fixture chat and scope. UI displays Not provided, not fabricated employment details. |
| P-01 | Casey Patel — Estimating | Fixture bid person; unambiguous name. |
| P-02 | Alex Morgan — Estimating — East | One of two distinct people sharing a display name. |
| P-03 | Alex Morgan — Commercial Accounts — West | Other Alex Morgan. Resolve using department/region label, not a guessed ID. |
| P-04 | Morgan Reed — Estimating | Separate requested grouped-count person. |
| P-05 | Sam Rivera — Commercial Accounts | Included in report rows. |
| Scope A / Scope B | UI default: Your authorized demo scope. | Server fixtures enforce disjoint user ownership and authorized data scope. Internal scope IDs are not user-selectable filters. |

No password is embedded in a render or this document. Provision test credentials separately for an implemented synthetic application. A future local-only demo may have a declared simulated sign-in, but it is not evidence for AC-01/02.

### 5.3 Chat fixtures and recency

| Chat / owner | Saved title (plain text) | Last activity / visible state |
| --- | --- | --- |
| C-A01 / U-A | Show the report of bids created in the past seven days. | 16 Sep 2026 12:00:06 UTC; first in list; active in the first render. |
| C-A02 / U-A | How many bids did Casey Patel create in the past seven days? | 16 Sep 2026 11:40:06 UTC; second; contains the created / won follow-up pair. |
| C-A03 / U-A | How many bids were created last month? | 16 Sep 2026 10:20:06 UTC; third; contains August count and optional previous-month follow-up. |
| C-B01 / U-B | How many bids were created last month? | Separate user’s history. It must never appear in U-A sidebar or altered-ID reads. |
| New scratch / U-A | New chat | Unsent; no persistent history entry or activity timestamp. |

Primary render shows Today and these three U-A rows, with times **12:00**, **11:40**, **10:20**. In C-A02, the created-count turn is submitted at 11:30:00 and answered at 11:30:06; the won-count follow-up is submitted at 11:40:00 and answered at 11:40:06, all on 16 September 2026 UTC. C-A03's primary monthly turn is submitted at 10:20:00 and answered at 10:20:06. Adding its optional previous-month follow-up is a separate fixture variant that updates that chat's activity timestamp. Selecting C-A03 alone does not reorder it. Persisting a new message there at 12:10 moves it to the top. A deterministic test with equal last-activity timestamps sorts ascending by chat ID.

### 5.4 Base dataset and fixture packs

`FX-REPORT-64` is the canonical snapshot in §15: **64 rows, 10 columns, no cap**, default order Created at descending then Bid ID descending. Pages contain **50 and 14 rows**. The first three exact rows power the preview. The rows have multiple currencies and nulls; no monetary grand total is displayed.

The companion monthly fixture has **42 distinct August bids**, IDs `000101`–`000142`, and **28 distinct July bids**, IDs `000201`–`000228`. For a reproducible seed, assign August row j=1…40 to day `1 + ((j−1) mod 28)` at 10:00 UTC; row 41 to 30 August 10:00; row 42 to 31 August 23:59:59. Override `000101` to 1 August 00:00. Assign July row j=1…27 to day j at 10:00 and row 28 to 31 July 23:59:59. Give these rows `Demo archive bid {ID}` titles, P-02 as creator, P-04 as owner, Submitted status, null won fields and null amount/USD, except the two win-credit exceptions below. A deliberate duplicate raw source row for `000120` does not change the distinct August result.

**Casey wins:** five report rows (`000062`, `000059`, `000056`, `000053`, `000050`) plus archived bids `000141` and `000142` have win credit P-01 and Won status. `000141` was created 30 August, won 11 September 14:00 UTC; `000142` was created 31 August, won 14 September 15:00 UTC. Thus Casey created **18** bids in 9–15 September but won **7** in that period, including two created earlier. Do not add 18 and 7 into a unique-bids total. The remaining main report creators are P-02:16, P-03:12, P-04:10 and P-05:8; together with P-01:18 they sum to 64.

Fixture variants below are separate injected scenarios. Do not combine their totals with the primary 64-row screen.

| Fixture | Exact condition / expected result | Required use |
| --- | --- | --- |
| FX-MONTH-42 | 1–31 Aug 2026: 42 distinct bids; raw duplicate for 000120 ignored. | Monthly created count; August boundary handling. |
| FX-PREV-MONTH-28 | 1–31 Jul 2026: 28 distinct bids. | Same-chat “And what about the previous month?” after the August answer. |
| FX-PERSON | 9–15 Sep: Casey created 18; Morgan Reed created 10; Casey won 7 using win date/credit. | Person counts, grouped request and follow-up semantics. |
| FX-ZERO | Scope/report variant explicitly contains no authorized matches for 1–7 June 2026. | Valid zero count and zero-row report; not a service failure. |
| FX-PARTIAL | Known covered dates 9–13 Sep; 44 distinct created bids in base rows; 14–15 Sep unavailable in this variant. | Show 44 only as a subtotal for covered dates; requested whole-period total is unknown. |
| FX-FRESHNESS-UNKNOWN | Same valid result; watermark null. | Queried-at remains visible; freshness says Not supplied by the data source. |
| FX-CAP-KNOWN | 5,237 matching bids; snapshot holds 5,000; 10 columns; 100 pages of 50. | Preview/canvas disclose cap; scalar count is 5,237, not 5,000. |
| FX-CAP-UNKNOWN | 5,000 snapshot rows; additional matches exist; exact total unavailable; isTruncated true. | Do not invent matching total or say Page 1 of a matching-result total. |
| FX-BOUNDARIES | Isolated records around July/August and 8/9/15/16 Sep UTC boundaries. | Include start and exclude end; preserve the request-resolved range across retries. Details §15.3. |
| FX-REVOKED | Access to selected artifact/scope revoked after earlier successful open. | Subsequent authorized fetch denies; clear affected cached rows/previews. |
| FX-FAILURES | Injected login, chat list, submit transport, analytics, AI, transcription, persistence and page-fetch failures. | Use state copy in owning screen; never silently swap in a successful synthetic result in integrated mode. |

### 5.5 Canonical question and answer content

The blocks below are the exact **stored Markdown** for fixture replies. In a screen, render their formatting; do not display the surrounding code fence or raw asterisks. Each reply additionally has visible source/mode metadata as defined in the relevant screen. User questions are safely rendered plain text.

**ANS-01 — monthly created count**  
User: **How many bids were created last month?**

```markdown
**42 bids** were created from **1–31 August 2026**.

This counts distinct bids by creation date within your authorized demo scope. Reporting timezone: **UTC**.

*Synthetic demo data; not live business results.*
```

**ANS-02 — person created count**  
User: **How many bids did Casey Patel create in the past seven days?**

```markdown
**Casey Patel created 18 bids** from **9–15 September 2026**.

This uses the Created by field and creation date, not bid ownership. Reporting timezone: **UTC**.

*Synthetic demo data; not live business results.*
```

**ANS-03 — same-chat won follow-up**  
User after ANS-02: **And how many did that person win?**

```markdown
**Casey Patel won 7 bids** from **9–15 September 2026**.

This uses win date and win credit. Two of these bids were created before the reporting period. The 7 won bids and 18 created bids are separate measures, not a combined unique-bids total.

*Synthetic demo data; reporting timezone: UTC.*
```

**ANS-04 — grouped count**  
User: **How many bids did Casey Patel and Morgan Reed create in the past seven days?**

```markdown
From **9–15 September 2026**:

- **Casey Patel:** 18 bids created.
- **Morgan Reed:** 10 bids created.

Counts use each bid's Created by field. Reporting timezone: **UTC**.

*Synthetic demo data; not live business results.*
```

**ANS-05 — detailed report; primary render**  
User: **Show the report of bids created in the past seven days.**

```markdown
**64 bids** were created from **9–15 September 2026**.

The report includes all 64 matching bids in your authorized demo scope. Open it to inspect the 10 columns.

*Synthetic demo data · UTC.*
```

Attachment: `ART-A01` / snapshot `SNAP-A01` / title **Bids created: 9–15 September 2026** / snapshot 64 / total matching 64 / `isTruncated=false` / created-date period `[2026-09-09T00:00:00Z, 2026-09-16T00:00:00Z)` / query **2026-09-16T12:00:04Z** / watermark **2026-09-15T23:59:59Z** / no person filter / **All statuses; your authorized demo scope**. Metadata is constructed from the actual fixture result, not invented by the assistant.

**ANS-06 — previous month follow-up**  
User after ANS-01: **And what about the previous month?**

```markdown
**28 bids** were created from **1–31 July 2026**, the month before the August period we just used.

The metric and authorized demo scope are unchanged. Reporting timezone: **UTC**.

*Synthetic demo data; not live business results.*
```

**ANS-07 — duplicate-name clarification**  
User: **How many bids did Alex Morgan create in the past seven days?**

```markdown
I found two people named **Alex Morgan** in the demo data:

- Alex Morgan — Estimating, East
- Alex Morgan — Commercial Accounts, West

Which person should I use for **9–15 September 2026 (UTC)**?
```

No data query for the count runs until identity is resolved. Choices remain ordinary Markdown text; the user replies **Alex Morgan in Estimating, East.** The resolved answer is **16 bids** for P-02, not the combined 28.

**ANS-08 — ambiguous report basis**  
User: **Show the bids report for last week.**

```markdown
Should the report include bids **created** or bids **won** during **7–13 September 2026 (UTC)**?

I need the date basis before I run the report.
```

**ANS-09 — valid zero / empty report**  
User: **Show bids created from 1 to 7 June 2026.**

```markdown
**No bids matched** the creation-date period **1–7 June 2026** in your authorized demo scope.

The attached report has **0 rows**. This is a valid empty result, not a failed query.

*Synthetic demo data; reporting timezone: UTC.*
```

Attach `ART-ZERO`, title **Bids created: 1–7 June 2026**, ten declared columns, snapshot 0, matching 0, not truncated. For the equivalent scalar-only question use **0 bids were created…** and no attachment.

**ANS-10 — partial coverage**

```markdown
I cannot give a complete total for **9–15 September 2026**.

The available demo data contains **44 bids created from 9–13 September**. Data for **14–15 September** is unavailable in this test scenario. **44 is a partial count, not the requested full-period total.**

Reporting timezone: **UTC**. Synthetic demo data.
```

**ANS-11 — unsupported feature**  
User: **Create a dashboard and export this report.**

```markdown
This prototype can answer the configured bid questions and open read-only table reports. **Dashboards and report exports are not available.**

You can ask for a count or request a report for a different person or period.
```

**ANS-12 — new-chat context missing**  
User in a new chat: **And how many did that person win?**

```markdown
Which person and reporting period should I use for the won-bid count?

This new chat does not have a previously selected person or period.
```

**ANS-13 — permission limitation after an authorized question submission**

```markdown
I cannot return that result because it is outside your permitted data scope.

Ask about data you are authorized to view. No count or report has been returned.
```

A protected-route/API denial before an assistant turn exists is application UI, not this Markdown reply. Do not disclose restricted people, columns, row counts or an alternate user's chat.

**ANS-14 — valid scalar, requested report failed to persist**

```markdown
**64 bids** were created from **9–15 September 2026** in your authorized demo scope.

**The detailed report could not be saved, so no report attachment is available.** Ask for the report again to make a new request.

*Synthetic demo data; reporting timezone: UTC.*
```

There is no fake attachment and no regeneration action on this successfully persisted scalar/limitation reply.

## 6. SCR-01 — Login

### 6.1 Purpose and bindings

Authenticate a pre-provisioned business user before showing any protected chat, profile or report. This is a login form, not registration or a marketing landing page.

**Requirements:** FR-01–03, FR-28; NFR-01/04; AC-01/17/21.  
**Source defaults:** D-01; SYS §§2.3, 8–9.  
**Shared components:** CMP-01, CMP-04, CMP-13.  
**Backend contracts:** B-01 authentication/ownership; B-02 session termination; B-08 safe rendering/security.

### 6.2 Entry, exit and hierarchy

Entry: direct `/login`, initial protected-route redirect, successful Log out, expired session, or a safe sign-out-recovery state. An unauthenticated direct report URL must not briefly render its title, snapshot or previous cached rows.

Exit: successful login → SCR-02. Invalid credentials, service failure or validation stay on SCR-01. Profile and account menu are absent. No public registration or password-reset link.

Hierarchy: CFI identity → **Sign in to Data Insights Chat** → account guidance → credentials → **Sign in** → safe local feedback.

### 6.3 Exact primary content and region layout

1. **Header:** charcoal, intact logo, no protected user name or sidebar controls. Desktop product name may appear beside it; phone centers logo.
2. **Mode strip:** **Synthetic demo · Fictional data · Reporting timezone: UTC** (phone uses shared two-line variant).
3. **Form block:** width 440px maximum, centered horizontally in the white main region. At 1440×900 its top starts around y=220; no floating/glass card or photo background. Heading **Sign in to Data Insights Chat**. Supporting text **Use your provisioned account to access your private chats.**
4. **Fields:** **Email address**, placeholder **name@example.com**; **Password**, masked; separate **Show password** toggle becomes **Hide password**, with stable field association. Input heights at least 44px; 20px between field groups.
5. **Primary action:** full-width **Sign in**, 44px high, red with observed hover endpoint.
6. **Support text:** **Accounts are provisioned for this prototype. Contact your project administrator for access.** This is plain copy, not an invented working contact link.

The primary idle rendering uses empty fields; no fictional password or apparent real credential is shown. A filled validation fixture may use `jordan.ellis@cfi-demo.example` with masked password bullets, without storing or disclosing a usable password.

### 6.4 State records

| State ID | Trigger / exact visible content | Available actions / focus / result |
| --- | --- | --- |
| `SCR-01.idle` | Empty labeled fields and baseline guidance. | Email receives initial form focus after normal navigation; Sign in validates; Show password toggles mask. |
| `SCR-01.validation` | Empty email: **Enter your email address.** Invalid shape: **Enter an email address in the format name@example.com.** Empty password: **Enter your password.** | Focus first invalid field; preserve safe input; no authentication attempt for invalid form. |
| `SCR-01.submitting` | Button **Signing in…**; status **Checking your account…** | Prevent duplicate requests. Do not reveal a guessed account name before authentication succeeds. |
| `SCR-01.credentials-rejected` | **Unable to sign in. Check your email and password and try again.** | Keep entered email, clear password, focus password after announcing error. Same message whether account is absent or password is wrong. |
| `SCR-01.service-failed` | **Sign-in is temporarily unavailable. Try again.** | Sign in becomes available when safe. No stack trace or provider details. |
| `SCR-01.rate-limited` | **Too many attempts. Try again shortly.** If server supplies a retry time, fixture may read **Try again in 30 seconds.** | Respect actual retry-after; do not invent a provider countdown. Explain temporary disabled Sign in. |
| `SCR-01.expired` | **Your session has expired. Sign in again to continue.** Supporting note **Unsent text and recordings were cleared.** | All protected views, cached rows and audio cleared; blank form. Successful authentication opens SCR-02; saved history remains server-side. |
| `SCR-01.signed-out` | **You’re signed out. Your saved chats are still available when you sign in again.** | Fresh credentials required; no late answer/preview may appear. |
| `SCR-01.signout-unconfirmed` [X] | **This device’s protected views have been cleared, but the server sign-out could not be confirmed.** | **Retry sign-out**. Block protected reopening/automatic session restore until resolved; do not falsely claim server invalidation succeeded. After confirmation show signed-out state. |

### 6.5 Interactions and responsive transformation

Email uses email input affordances; password permits paste/password-manager input. Enter in a valid form submits once. Focus stays predictable; status announcements do not repeatedly move focus. Authentication errors have a safe summary linked to the affected form, without distinguishing account existence.

On 390px, form occupies viewport minus 32px, begins 32px below the shared strip, and scrolls naturally with the keyboard. Do not vertically center it in a way that pushes fields off a short screen. Show/hide password has a 44px target and cannot overlap entered text. The page has no desktop sidebar, marketing photo or external link dependency.

### 6.6 Asset and brand application

Use AS-APP-001, AS-APP-002 and functional field icons only. Plain CFI Group identity is the declared fallback if the real asset cannot be rendered. KIT EXP-001/003, DES-001/003/004/005/006/007/009 and PAT-004 apply. No website consent language is copied; no new legal certification is implied.

### 6.7 Concrete acceptance checks

A renderer must preserve real identity geometry, the synthetic label, visible field labels, the chosen button hover and a clean white task surface. An implementation must pass invalid/valid login, protected deep-link, account-existence-safe error, keyboard and session-expiry tests. A failed logout cannot be reported as a successful server logout. No registration/reset/settings controls appear. Authentication and isolation need server tests; a static login image is not evidence.

### 6.8 Resolved render brief

**ID:** `SCR-01__idle__1440x900__v1.0.0`.  
**Composition:** 72px charcoal identity header, 32px pale mode strip, white body, 440px form at x≈500/y≈220. Exact heading/copy/fields from §6.3; empty fields; red full-width Sign in. No errors, decorative imagery or account menu.  
**Phone companion:** `SCR-01__idle__390x844__v1.0.0`; centered 126px-wide actual logo, 56px product/mode strip, 16px page inset, one-column form.  
**Asset decision:** intact supplied logo or disclosed plain-text fallback; no generated assets. Render only the named state, not a collage of validation variants.

## 7. SCR-02 — Empty workspace / new chat

### 7.1 Purpose and bindings

Provide a usable starting point for a first or independent conversation without creating empty persistent chats. A new chat must not inherit another chat's metric, person, report or filters.

**Requirements:** FR-04, FR-06–15, FR-17/19/27/28; NFR-02–04; AC-03/05–08/16/21/22.  
**Defaults:** D-03–05, D-09–12.  
**Components:** CMP-01–09, CMP-13.  
**Backend:** B-01, B-03, B-04, B-07.

### 7.2 Entry, exit and hierarchy

Entry: successful login, New chat, or an authorized `/app` visit. Initial login defaults to a blank workspace rather than implicitly selecting someone else's or the last user's conversation.

Exit: first accepted submission creates the owned chat and transitions to SCR-03 using the same submitted user turn; selecting a saved chat opens SCR-03; account Profile opens SCR-05; Log out opens SCR-01. Recording/transcribing remains a state of this unsent context until a question is explicitly sent. Opening an old chat never attaches this context's audio to it.

Hierarchy: persistent shell → **Ask about bids. Inspect the details.** → concise guidance/examples → anchored composer. Existing history stays discoverable on the left; there is no report canvas until an attachment exists.

### 7.3 Exact content and layout

**Main heading:** **Ask about bids. Inspect the details.**  
**Support:** **Ask for a count or a detailed report. Your chats are private to your account.**  
**Small section label:** **Try a question**.

Show three plain, vertically stacked example actions, not a grid of promotional cards:

1. **How many bids were created last month?**
2. **How many bids did Casey Patel create in the past seven days?**
3. **Show the report of bids created in the past seven days.**

Each example fills the composer and focuses it; it does **not** send or create a chat. Only display the example actions while the draft is empty, so activation never overwrites an existing typed draft. Their text wraps at a comfortable size; each target is at least 44px high. Use dark text with a small red directional cue, not media-card shadow.

Desktop: normal header/mode strip/sidebar. Empty content occupies a max-640px block inside the max-800px conversation column, with 48px top margin after the main-region start and 32px between conceptual groups. Composer remains at the bottom of the main region. No staged fake conversation is used to decorate emptiness.

There are two intentionally separate sidebar fixtures: **first use**, with No chats yet; and **new conversation with history**, showing C-A01–C-A03 and no row selected as the new draft. Primary SCR-02 render uses the latter. Do not show the three fixtures inside a state declared to have no saved chats.

### 7.4 State records

| State ID | Exact content / behavior | Transition and focus |
| --- | --- | --- |
| `SCR-02.first-use` | Sidebar **No chats yet**; full empty prompt, examples and enabled composer. | Typing or selecting an example is immediately possible. No empty database chat created. |
| `SCR-02.new-with-history` | Three existing U-A chats, no selected saved row; main empty prompt. | Select history → its own SCR-03; New chat again does not add another blank history record. |
| `SCR-02.draft-ready` | Example/typed text appears under Your question; examples no longer invite replacement. | Send/Enter validates and submits once. Shift+Enter remains multiline. |
| `SCR-02.input-invalid` | Shared whitespace or >4,000-character feedback. | Keep draft editable; no chat/message/request created. |
| `SCR-02.first-submit-pending` | User text immediately appears as a message; sidebar temporary **New chat**; processing indicator. | On acknowledgement replace temporary IDs/title with persisted values, then SCR-03. Prevent double new chats. |
| `SCR-02.create-submit-interrupted` | **Your question may have been received. Checking its status…**; preserve one local user turn. | Recover via submission ID. If known accepted, load that chat; if definitively failed, offer **Retry question** using the same submission. Never auto-create a second chat. |
| `SCR-02.chats-loading` | **Loading chats…** in sidebar; main remains empty. | Do not treat a loading list as no history. Composer only enabled once session/required service availability is established. |
| `SCR-02.chats-failed` | **Your chats could not be loaded.** and **Retry**. | Retry only list fetch; do not reload/reset the typed question. |
| `SCR-02.voice-*` | Inherit CMP-06 and SCR-03 voice-state copy with this scratch context as owner. | Stop → review; only explicit Send creates a stored chat. Cancel/failure creates no message. |
| `SCR-02.context-missing` | After sending “And how many did that person win?”, the new chat receives ANS-12 Markdown. | This is now SCR-03.clarification-context; it must not borrow C-A02's Casey/period. |

### 7.5 Interactions and responsive transformation

New chat closes any prior canvas and clears its selected data/person/filter context. It does not delete the previous conversation. Preserve previously typed drafts by their existing chat ID only within the current session; no draft from an old chat appears in the new scratch composer.

At phone width, Open chats controls the drawer; empty heading becomes 24px/30px with 16px main inset. Examples stack and wrap; no side-by-side cards. Composer and keyboard remain usable without hiding the guidance behind a fixed overlay. On first submission, focus stays in the composer unless the user intentionally navigates; announce the pending state.

### 7.6 Assets and brand

Actual logo and initials only. No property hero, looping linework, assistant portrait or “new AI” icon. KIT EXP-001–004; DES-001–007/009; PAT-004 apply. Example questions derive from SYS §5 and fictional P-01, not evidence of CFI systems.

### 7.7 Concrete acceptance checks

Verify both true-first-use and new-with-history states. Three example controls must fill, not send. Empty/oversized/IME-composing submissions cannot create chats. First-send retry must produce one chat and one user message. New chat must not inherit prior context. Recording cancellation creates no history entry. At 1440 and 390 widths, sidebar/drawer, account actions and composer remain available without adding excluded navigation.

### 7.8 Resolved render brief

**ID:** `SCR-02__new-with-history__1440x900__v1.0.0`.  
**Content:** Jordan Ellis / JE, synthetic UTC mode strip, three fixture chats on left, none selected. White main area with exact heading, support and three question suggestions above an empty bottom composer. New chat and Send follow the shared action system; empty Send is unavailable with a discernible reason on interaction.  
**Phone:** `SCR-02__first-use__390x844__v1.0.0`; drawer closed, same heading and examples, empty composer; first-use history appears only when drawer opens.  
**State framing:** no sample answer/report is added to make emptiness more impressive. No generated imagery.

## 8. SCR-03 — Active conversation

### 8.1 Purpose and bindings

Read a persisted conversation, ask typed/recorded follow-ups, distinguish valid answers from limitations/failures, and open attached report snapshots.

**Requirements:** FR-02–04, FR-06–22, FR-25, FR-27–28; all data rules in SYS §5; relevant NFR-01–06.  
**Acceptance:** AC-02–12, AC-14–17, AC-20–22.  
**Components:** CMP-01–10, CMP-12/13.  
**Backend:** B-01–09.

### 8.2 Entry, exit and hierarchy

Entry: selecting an owned saved chat, first successful submission from SCR-02, returning from report/profile, or refreshing an authorized chat route. Restore stable message sequence and known request state before inventing any new pending work.

Exit: attachment → SCR-04; New chat → SCR-02; another history row → that chat's SCR-03; Profile → SCR-05; Log out/expiry → SCR-01. Failures are local to their originating turn or resource rather than replacing the entire usable workspace.

Priority: current chat identity → ordered question/reply groups → optional report attachment → next question. Do not split scalar answers into dashboard cards. A technical request error is attached to the submitted question, not disguised as an assistant-authored zero.

### 8.3 Region layout and primary representative content

Header/sidebar/mode follow §3. Chat title is the plain-text saved title, up to two visible lines in an 80px region. Below is a scrollable message list, max 800px in the full-width conversation. The bottom composer follows CMP-05, independent of the message scroller.

**Primary report-conversation fixture:** C-A01, original question **Show the report of bids created in the past seven days.** (12:00 UTC), followed by ANS-05 rendered as Markdown (12:00 UTC), actual `ART-A01` three-row preview and **Open report →**. Composer empty. Report canvas is closed in this screen.

**Scalar fixture:** C-A02 with ANS-02 and ANS-03. Display Casey's created and won answers as separate Markdown groups, not a combined 25-bid headline. A long history starts from its stored reading position; new completed answers do not pull the reader away from older content.

**Message metadata:** short visible time **12:00 UTC**; full ISO timestamp may be available to assistive text/title, not as noisy inline diagnostic data. Below each data answer, **Answer details** opens a PAT-006 disclosure with resolved period, filters, queried-at and data-updated-through. Primary ANS-05 already states its essential dates/scope; hidden details are not the only location for material constraints.

### 8.4 Answer and lifecycle state records

| State ID | Exact representative content / distinction | Actions and result |
| --- | --- | --- |
| `SCR-03.history-loading` | **Loading conversation…**; no fabricated previous answers. | Shell remains. Composer unavailable until ownership/history context is established. |
| `SCR-03.history-failed` | **This conversation could not be loaded. Try again.** | **Retry** fetches this conversation; New chat/other authorized chats remain usable. |
| `SCR-03.resource-unavailable` | **This conversation is unavailable.** | **Go to new chat**; no foreign title/owner/row count. Same safe surface for unauthorized/missing IDs. |
| `SCR-03.processing` | One submitted user message; **Working on your question…** or a backend-reported stage. | Draft next question; same-chat Send disabled with reason. Other chats usable. No AI Stop control. |
| `SCR-03.scalar-ready` | ANS-01 or ANS-02 rendered; attachment list empty. | Continue, inspect Answer details, navigate normally. No empty attachment placeholder. |
| `SCR-03.follow-up-ready` | ANS-03 after Casey context, or ANS-06 after August context. | New answer states changed/retained period explicitly; no cross-chat reuse. |
| `SCR-03.grouped-ready` | ANS-04, two separate created counts. | Simple rendered list, not a chart or giant table attachment. |
| `SCR-03.report-ready` | ANS-05 plus ART-A01 preview, count 64 / 10 columns. | Preview or Open report → SCR-04.report-ready, same snapshot. |
| `SCR-03.clarification-person` | ANS-07; two Alex Morgan identities described by fixture department/region. | Reply in composer; no speculative count query until resolved. |
| `SCR-03.clarification-basis` | ANS-08; **created** versus **won**, 7–13 Sep UTC. | Reply in composer; no guessed report. |
| `SCR-03.clarification-context` | ANS-12 in a fresh chat or genuinely unavailable earlier context. | Ask for person/period rather than inventing retained state. |
| `SCR-03.unsupported` | ANS-11 for dashboard/export; undefined metric variant says **That metric is not defined for this prototype.** | Offer only supported next question types as prose; no disabled fake dashboard/export button. |
| `SCR-03.zero-count` | **0 bids** with exact period/scope and valid-query explanation; no attachment for count-only question. | Normal follow-up. Never use this state for query failure. |
| `SCR-03.empty-report` | ANS-09 plus ART-ZERO, zero rows/ten columns. | Open report reaches valid-empty canvas with context/schema, not an error. |
| `SCR-03.partial-coverage` | ANS-10; 44 is explicitly a covered-date subtotal, not the 9–15 Sep total. | User may ask for a covered period. No complete-looking 64/44 report for missing days. |
| `SCR-03.freshness-unknown` | Valid result; Answer details says **Data updated through: Not supplied by the data source**. | Query timestamp still distinct. Unknown freshness alone is not a zero/error. |
| `SCR-03.access-limited` | ANS-13 for a permitted chat asking outside scope. | No restricted count/attachment. Other authorized questions remain available. |
| `SCR-03.data-query-failed` | App error **The data query could not be completed. No result was returned.** | Eligible **Retry answer** on original turn; never “0 bids.” |
| `SCR-03.ai-failed` | App error **The answer service could not complete this reply.** | Eligible Retry answer. No fabricated Markdown success or ungrounded summary. |
| `SCR-03.answer-timeout` | **This answer took too long. You can retry this question.** only after retry eligibility is known. | Retry original turn under request/attempt controls; late old attempt suppressed. |
| `SCR-03.refresh-recovering` | **Checking the status of your question…** next to the persisted original user message. | Recover queued/running/completed/failed state; do not resubmit automatically. |
| `SCR-03.interrupted` | **This request was interrupted. Check its status or retry when available.** | Only server-safe status/retry action; one user turn retained. |
| `SCR-03.reply-contract-failed` | **The answer could not be displayed. Retry this question.** | Malformed/empty Markdown is not completed success; safe retry only. |
| `SCR-03.report-save-failed` | ANS-14; valid count, explicit missing report, no attachment. | New question can request report again. No Retry/regeneration on this successful scalar reply. |
| `SCR-03.attachment-unavailable` | Saved Markdown remains readable if permitted; attachment panel **Report unavailable**. | No working-looking Open action; recoverable load failures may expose Retry, missing/revoked assets do not. |
| `SCR-03.background-complete` | Inactive chat receives its own saved answer, recency update and optional **New reply** marker. | No answer added to current chat; no forced route/canvas change or focus jump. |
| `SCR-03.expiry` | No protected workspace remains visible. | Immediate transition to SCR-01.expired; invalidate late requests and clear cached data/audio. |

### 8.5 Recorded-input state records

These also apply to `SCR-02.voice-*`; only the owning context changes. Fixture text for review is **How many bids did Casey Patel create in the past seven days?** A recognition-error test first returns **How many bids did Casey Patel create in the past seventy days?**; the user edits **seventy** to **seven**, and only the edited final text is submitted/persisted.

| State ID | Exact visible content | Recovery / action |
| --- | --- | --- |
| `SCR-03.voice-permission` | Browser permission prompt is native, not a fake app modal. App status **Waiting for microphone permission…** | Cancel/denial retains typing. No permission request before Record. |
| `SCR-03.voice-recording` | **Recording · 00:12 / 02:00**; Stop recording; Cancel. In a simulated demo prepend **Simulated recording**. | Stop releases mic and transcribes; Cancel releases mic and returns original typed draft. |
| `SCR-03.voice-limit` | **Recording limit reached. Preparing your transcript.** at 02:00. | Stop automatically, release device, transcribe bounded audio; do not silently keep recording. |
| `SCR-03.voice-transcribing` | **Transcribing…** / **Cancel transcription**. | Keep typing possible; no message yet. Completion appends to the current draft for review. |
| `SCR-03.voice-review` | Editable transcript; **Transcript added. Review it before sending.** / **Discard transcript**. | Explicit Send only; final edited text becomes normal user message with Voice input label. |
| `SCR-03.voice-permission-denied` | **Microphone access is blocked. Allow it in your browser or type your question.** | Typing works; Record can request only when browser permits. No claim that app can change OS permissions. |
| `SCR-03.voice-no-device` | **No microphone is available. Connect one or type your question.** | Preserve draft. Retry recording after an actual device change. |
| `SCR-03.voice-unsupported` | **Recording is not supported in this browser. You can still type your question.** | Record unavailable with visible reason; composer still works. |
| `SCR-03.voice-empty` | **No clear speech was detected. Try recording again or type your question.** | No message created; discard temporary audio; Record can restart. |
| `SCR-03.voice-transcription-failed` | **The recording could not be transcribed. Record again or type your question.** | Clean temporary audio; no Retry on deleted audio, no fabricated transcript. |
| `SCR-03.voice-timeout` | **Transcription took too long. Record again or type your question.** | At configured 30s timeout abort/discard; late result ignored. |
| `SCR-03.voice-canceled` | **Recording canceled.** or **Transcription canceled. Your typed question was kept.** | Return to idle/draft. No new user message or history item. |
| `SCR-03.voice-leave-confirmation` | CMP-09 exact copy and nondestructive default focus. | Only confirmed discard/cancel changes context; never move audio to a new chat. |
| `SCR-03.voice-discard-review` | Edited-review confirmation from CMP-06. | Restore pre-append draft only after explicit confirmation when edits would be lost. |

### 8.6 Interactions, phone layout and asset application

The composer, history, report opening, retries and disclosures use §3–4 without local variations. Answer details does not offer raw query editing. Literal user text is not interpreted as UI instructions. Requests for a different report/filter occur through new questions, not a report-builder toolbar.

On phone, the message column uses the full width minus 32px; the attachment shows two preview columns and reports eight additional columns. The keyboard does not cover Send. Long answer content, code and links reflow or scroll locally. Opening report replaces the conversation main region and hides the composer; Back to conversation restores draft/position. A long conversation remains scrollable independently of the shell.

Assets: actual logo, initials, newly authored functional icons; no photographs, generated illustrations or avatars. KIT EXP-002/003/004; DES-001–009; PAT-004/006 apply. PAT-002's image-card hover is intentionally not used for informational messages. `CFI Working Desk` is a task extension, not an observed CFI application.

### 8.7 Concrete acceptance checks

Render every completed assistant body as Markdown and retain exact dates/numbers across summary, preview and details. Test at least one heading/list/link/inline-code/fenced-code fixture as well as the standard answers; no raw/HTML alternative appears. Zero, empty, partial, access denial, query failure and AI failure must be visibly different. No recording is auto-sent; edits and pre-existing typing are preserved. Retry/refresh keeps one chat, one user turn and at most one terminal success; same-chat concurrency is bounded while other chats remain usable. Ownership, metric semantics, audio cleanup and persistence require backend/integration evidence, not visual inspection alone.

### 8.8 Resolved render briefs

**Primary:** `SCR-03__report-ready__1440x900__v1.0.0`. Sidebar C-A01 selected; user question plus ANS-05 rendered in the wide, max-800px white message column; ART-A01 exact three-row/four-column preview; empty composer; no canvas. Keep date/synthetic disclosure visible. Do not add extra KPI cards, controls or invented data.

**Voice review:** `SCR-03__voice-review__390x844__v1.0.0`. C-A02, recent Casey-created answer visible above; composer contains the corrected seven-days question and review message; Record has resolved, no live recording timer. Show **Send** and **Discard transcript**, not playback. A local simulated context must visibly say voice is simulated. Prior text/history uses the same shared fixtures.

**Clarification:** `SCR-03__clarification-person__1440x900__v1.0.0`. User's Alex question followed by ANS-07; no count or attachment; composer ready for reply. It is a distinct render state, not a popup over a successful report.

Error/processing renders select one named state from §8.4–5, preserve the same shell and exact local copy, and replace only the affected turn/component. Do not combine every failure into one screenshot.

## 9. SCR-04 — Conversation with report canvas

### 9.1 Purpose and bindings

Inspect a larger, read-only, authorized table snapshot without substituting the table for the Markdown answer or losing the conversation. On wide screens chat and canvas coexist; narrow screens prioritize the report until the user returns.

**Requirements:** FR-02–04, FR-07/09, FR-17/20–28; SYS §§5.2–5.4, 7.2, 9; NFR-01–06.  
**Acceptance:** AC-02/04/12–17/19–22.  
**Defaults:** D-06–10, D-13.  
**Components:** CMP-01–03, CMP-07–13; composer remains present at wide widths.  
**Backend:** B-01–06, B-08–10.

### 9.2 Entry, exit and hierarchy

Entry: click a permitted preview/Open report action, reopen a saved attachment, or use an authorized deep link. The artifact belongs to its parent chat and assistant reply. One attachment per answer is the baseline; multiple historical replies may each have their own attachment.

Exit: Close report / Back to conversation → same SCR-03 and reading position; selecting another attachment replaces this canvas; selecting another chat closes it and switches context; Profile temporarily replaces the main view and stores return context; logout/expiry clears it and goes to SCR-01. Closing/opening/paging is reading activity and must not reorder chats or refresh the warehouse query.

Hierarchy: report title → date basis/period/filters → row/snapshot truthfulness → full column schema and paged rows → pagination. Source timing is readable secondary information. Report controls do not become an analysis toolbar.

### 9.3 Primary content and spatial record

**State:** `report-ready`, C-A01 / ART-A01 / SNAP-A01 / FX-REPORT-64 / page 1 / scroll x=0.  
**Title:** **Bids created: 9–15 September 2026**.  
**Context lines:** **Created 9–15 September 2026 · UTC**; **All statuses · Your authorized demo scope**.  
**Count line:** **64 rows in this snapshot · 64 matching bids**.  
**Source marker:** the shell's synthetic strip remains visible; expanded Report details explicitly says **Synthetic fixtures**.  
**Table caption:** **Bids created in the reporting period — 10 columns**.  
**Scroll instruction:** **Scroll horizontally to see all 10 columns.**  
**Null legend:** **— means no value supplied, not zero.**  
**Footer:** **Rows 1–50 of 64 · Page 1 of 2**; Previous page disabled; Next page enabled.

At 1440×900: x=0–248 sidebar; x=248–664 conversation; x=664–1440 canvas. Canvas has a left #D9D9D9 divider, pale context region and white table. Use approximately 188px context/header, 544px table region including caption/horizontal-scroll affordance, and 64px footer. The report has 24px side insets on desktop, 16px on phone; cells have their own 8–12px padding. Header growth takes space from the scrollable table rather than clipping text.

The report table's chosen full intrinsic width is **1,528px**. A visible 728px inner viewport at this desktop width therefore shows the leading columns and a deliberate edge of the next column, plus a horizontal scrollbar. Do not pretend all ten fit. The first column is sticky; all headers and values are reachable by horizontal scroll and keyboard-accessible scrolling. Row values come from §15, not newly written lorem ipsum.

| Order | Key / visible label | Fixture type / display | Chosen minimum width [X] |
| --- | --- | --- | --- |
| 1 | `bidId` / **Bid ID** | Identifier string; preserve six digits, e.g. **000064**. | 96px; sticky first column |
| 2 | `title` / **Bid title** | Text, e.g. **Demo Alder Court — siding**; wrap, do not substitute a real project name. | 240px |
| 3 | `createdAt` / **Created at** | Timestamp; e.g. **2026-09-15** / **16:30:00 UTC**, two lines. | 156px |
| 4 | `createdBy` / **Created by** | Resolved display name; disambiguating department/region subline for Alex Morgan. | 176px |
| 5 | `owner` / **Bid owner** | Separate resolved person; never substitute creator. | 176px |
| 6 | `status` / **Status** | Plain labeled value: In review, Submitted, Draft, Declined or Won. No status-only colored dot. | 112px |
| 7 | `wonAt` / **Won at** | Timestamp or **—**; same UTC formatting. | 156px |
| 8 | `wonBy` / **Won by** | Win-credit person or **—**; separate from owner. | 176px |
| 9 | `amount` / **Bid amount** | Decimal, two supplied places for this fixture; right aligned. **—** for null. | 144px |
| 10 | `currency` / **Currency** | **USD** or **CAD**, separate code; do not silently convert. | 96px |

These are a **fictional demonstration schema and role-based widths**, not an approved Gold-layer schema. A real returned schema drives labels/order/types. The generic table must also handle integer, date, boolean or other declared types from an approved contract without requiring new hardcoded business columns. Never guess a missing column or relabel unknown data as a familiar field.

**Report details — exact expanded primary fixture:**

| Field | Value |
| --- | --- |
| Data mode | Synthetic fixtures — not live business data |
| Reporting timezone | UTC |
| Date basis | Bid creation timestamp |
| Period start | 2026-09-09 00:00:00 UTC |
| Period end (exclusive) | 2026-09-16 00:00:00 UTC |
| Applied filters | All statuses; no person filter; your authorized demo scope |
| Queried at | 2026-09-16 12:00:04 UTC |
| Data updated through | 2026-09-15 23:59:59 UTC — fixture watermark |
| Snapshot rows | 64 |
| Total matching rows | 64 |
| Ordering | Created at descending; Bid ID descending |

In the primary render Report details is collapsed. Essential dates, scope and counts remain outside it. Expanding grows the header within sensible bounds; at short heights its metadata can scroll within the main report region, but must not eliminate the table or trap the close control.

### 9.4 Canvas state records

| State ID | Exact visible content / required distinction | Actions and retained context |
| --- | --- | --- |
| `SCR-04.loading` | **Loading report…**; known permitted title only, neutral table skeleton; no sample rows substituted. | Close/back works; conversation stays usable. Opening another artifact invalidates stale fetch completion. |
| `SCR-04.report-ready` | Primary content §9.3; first 50 snapshot rows; page 1/2. | Horizontal/vertical scrolling; Next page; Report details; close. |
| `SCR-04.page-2` | **Rows 51–64 of 64 · Page 2 of 2**; exact final 14 rows from §15. | Previous enabled, Next disabled; preserve horizontal position; no new warehouse query. |
| `SCR-04.page-loading` | **Loading page 2…**; page navigation temporarily unavailable. | Do not label page-1 rows as page 2. Keep last successful page state separately until new page succeeds. |
| `SCR-04.page-failed` | **Page 2 could not be loaded. Try again or return to page 1.** | **Retry page**; **Return to page 1**; Close. Conversation/answer unchanged. Do not show empty report. |
| `SCR-04.load-failed` | **This report could not be loaded. Try again.** | **Retry report** for recoverable errors and Close; no fabricated rows. |
| `SCR-04.valid-empty` | ART-ZERO; **No matching bids** / **No bids matched 1–7 June 2026 in your authorized demo scope.** Snapshot 0/matching 0; declared ten-column headers remain available. | No page 1 of 0. Footer **0 rows · No pages**; paging controls omitted or disabled with reason. Close/details work. |
| `SCR-04.unavailable` | **This saved report is no longer available. The conversation is still available.** | Close/back; no Retry for a known missing snapshot. User can ask a new question to request a fresh report. |
| `SCR-04.unauthorized` | Generic title **Report unavailable**; **You no longer have access to this report.** | Clear affected cached rows, preview, sensitive metadata and counts. No Retry unless backend later confirms permission change; Close and authorized conversation work remain. |
| `SCR-04.cap-known` | **5,000 saved rows of 5,237 matching bids**; **This snapshot is limited to 5,000 rows. Ask a narrower question to see a smaller report.** | Footer **Rows 1–50 of 5,000 saved rows · Page 1 of 100**. Scalar summary says 5,237. Cap warning never hidden in details. |
| `SCR-04.cap-unknown` | **5,000 saved rows · More matches exist; exact total unavailable**; same narrow-question guidance. | Footer pages the 5,000 stored rows, not an invented full total. Summary does not assert a matching count. |
| `SCR-04.freshness-unknown` | Valid report; **Data updated through: Not supplied by the data source**. | Queried at remains actual supplied value. Do not infer freshness from a request timestamp. |
| `SCR-04.replace-attachment` | Another historical attachment selected; its own title/context/count/loading state replaces ART-A01. | One visible canvas; retain artifact-specific page positions; stale ART-A01 responses cannot overwrite replacement. |
| `SCR-04.returned-snapshot` | Reopened ART-A01 remains SNAP-A01 with 64 rows even after source fixture changes. | No automatic Refresh data button; a new question creates a new artifact/snapshot. |
| `SCR-04.session-expired` | Protected table/preview cleared immediately. | SCR-01.expired; no late page response repopulates UI. |

**Exact capped-summary variants (rendered Markdown):**

Known total: **5,237 bids** match the requested demo period and scope. **The attached snapshot contains the first 5,000 rows; 237 matching rows are not stored in it.** Ask a narrower question for a smaller report. Synthetic demo data; UTC.

Unknown total: **The attached snapshot contains 5,000 rows. More matching bids exist, but the exact total is unavailable.** Ask a narrower question for a smaller report. Synthetic demo data; UTC.

In each variant the actual requested period and filters must also be stated explicitly, using the fixture's resolved values; for the standard cap test use **1–31 August 2026**, created-date basis, all statuses and authorized demo scope. Do not reuse the primary 64-row answer with a capped attachment.

### 9.5 Reopening and another attachment

For the attachment-replacement test, extend C-A01 with a **separate** subsequent question at 12:05 UTC: **Show the report of bids created last month.** Reply Markdown: **42 bids were created from 1–31 August 2026. The attached report contains all 42 matching bids in your authorized demo scope. Synthetic demo data; UTC.** Attach `ART-A02` / `SNAP-A02`, title **Bids created: 1–31 August 2026**, ten columns, 42 rows, not truncated; the archive seed in §5.4 supplies rows. Query time 12:05:04 UTC and persisted answer 12:05:06 UTC are fixture values. This is a variant of C-A01, not an extra attachment on ANS-05 or an unexplained change to the primary 12:00 screenshot.

Open ART-A01 → page 2 → close → open ART-A02 → close → reopen ART-A01. Each title, source context, schema and page must remain associated with its own snapshot. During the same session, ART-A01 can resume page 2; after a fresh login its first open may start at page 1 unless its authorized route explicitly includes a valid page. Snapshot contents, not ephemeral UI scroll coordinates, must persist across logout.

### 9.6 Interactions and responsive transformation

At ≥1280 the conversation remains usable with its composer and pending state; the canvas is a sibling region, not a focus-trapping overlay. Close is an explicit icon/text control with accessible name **Close report** in the top right. At 768–1279 it becomes the main-region report with **Back to conversation**. On phone that same labeled back action appears above the title; do not also add an unexplained second close action.

Phone title/context stack; count/truncation guidance wraps; Report details expands full width. Footer becomes two lines: counts then Previous/Next, each ≥44px. The table keeps all columns with local horizontal scroll and sticky header/ID. No hidden phone-only export or summary-card replacement. Composer is not visible while this full-width report is foreground. Back restores exact chat draft, selected message anchor and focus on Open report.

A table load/page error is local. The permitted existing conversation never disappears merely because the table failed. For access revocation, follow the server's permitted data response: purge affected report caches/previews and any historical answer content explicitly marked no longer permitted. Do not infer that ownership of the chat overrides data permissions. Historical narrative retention/redaction policy beyond required authorization is an external data-policy input, not a client-side guess (U-03).

### 9.7 Assets, brand and acceptance

Use the supplied logo and generic table/chevron/close icons only. No image asset or visualization is required. KIT EXP-002/003; DES-001–004/006–009; PAT-004/006 govern the task adaptation. The heavy media-card shadow and marketing proof panel are intentionally absent.

Check exact preview-to-canvas agreement; ten reachable columns; 50/14 paging; leading-zero IDs, nulls and currencies; both cap disclosures; empty versus failed versus denied states; correct query/freshness distinctions; report-local recovery; close/focus/reading-position restoration; snapshot stability after source change; and denied cache access after revocation. Reopening cannot secretly query live data. No editing, sort/filter, export/download, page-size selector, charts or separate report-library action appears.

### 9.8 Resolved render brief — recommended first screen

**Render ID:** `SCR-04__report-ready__1440x900__v1.0.0`.  
**Direction:** CFI Working Desk, shared tokens and exact actual logo.  
**Frame:** desktop application viewport, no browser chrome, no device mockup, no multi-screen collage. Header 72px plus mode strip 32px. Body split **248px sidebar / 416px conversation / 776px right report**. These are design targets, not a claim about eventual generated-image pixel dimensions.

**Left:** New chat; Today; C-A01 active at 12:00, C-A02 11:40, C-A03 10:20. No search or extra navigation.  
**Center:** C-A01 title in the 80px chat header. The message scroller is positioned with **Data Insights** and ANS-05 near its top, followed by the complete ART-A01 compact preview and Open report link; the earlier user message remains just above in the scrollable history rather than being crammed in at tiny type. The conversation title supplies the question context. Empty anchored composer with Your question, Record and Send.  
**Right:** exact title/context/count in §9.3; Report details collapsed. Page 1, no selection, scroll x=0. Leading columns begin with rows **000064, 000063, 000062**; more rows continue naturally. All ten exist, but the intrinsic 1,528px table intentionally overflows its 728px window. Include the scrollbar/scroll instruction; do not compress every column into view. Footer **Rows 1–50 of 64 · Page 1 of 2**; Previous disabled, Next enabled.  
**Identity/provenance:** JE account trigger; actual CFI logo; persistent Synthetic demo strip. No live-data badge, unsupported results or brand-photo filler.  
**Asset fallback:** plain CFI Group text only if the renderer cannot use the real supplied file; disclose it and do not invent an original ring mark.

**Phone companion:** `SCR-04__report-ready__390x844__v1.0.0`. Drawer closed; shared 64px header/56px strip; full-width report; visible Back to conversation; no visible composer/sidebar. Same ART-A01, page 1, scroll x=0 and all ten columns reachable. Title/context and footer wrap; the table alone scrolls horizontally. No card-based substitute.

**Validation companion:** `SCR-04__page-2__1440x900__v1.0.0`, same shell but exact rows 51–64 and page-2 footer. Render only when this state is specifically requested; it does not replace the recommended first state.

## 10. SCR-05 — Basic profile

### 10.1 Purpose and bindings

Review the signed-in user's identity without an account-editing or settings workflow.

**Requirements:** FR-02–05, FR-28; NFR-01/04; AC-01/17/18/21.  
**Defaults:** D-01–02.  
**Components:** CMP-01–04, CMP-09/13.  
**Backend:** B-01/02; authorized GET `/api/me`.

### 10.2 Entry, exit and hierarchy

Entry: account menu → Profile; authorized `/app/profile`. Keep the same header and sidebar; the main region becomes profile content. If entered from a report, retain the return chat/artifact/page/scroll context but do not fetch unrelated report rows just to draw Profile.

Exit: **Back to conversation** restores the authorized prior workspace view; if no prior conversation exists, it reads **Back to workspace** and opens SCR-02. Selecting a sidebar chat goes directly there. Account Log out remains available. Session expiry clears identity and opens SCR-01.

Hierarchy: Profile heading → identity summary → read-only fields → return action. Do not style values as editable text inputs or add Save, Edit, Change password, Settings, billing or permissions.

### 10.3 Exact primary content and layout

Main heading **Profile**. Supporting text **Your account details are read-only in this prototype.**

Identity summary: 64×64 square initials tile **JE**, display name **Jordan Ellis**, small **Synthetic demo profile**. This is an application initials treatment, not an imitation of the CFI ring.

| Visible label | Exact primary fixture value |
| --- | --- |
| Display name | Jordan Ellis |
| First name | Jordan |
| Last name | Ellis |
| Email address | jordan.ellis@cfi-demo.example |
| Designation | Business Development Manager |
| Department | Estimating |

The avatar/initials summary satisfies the avatar field separately from the six labeled text values. Use semantic description groups, not disabled form fields. Desktop content max 720px with 40px top margin and 32px side inset in the main region. Summary spans full width; First/Last and Designation/Department may form two aligned columns. Email and Display name span full width. Light dividers group identity and work details; no card-grid dashboard.

Primary return action below: **Back to conversation**, secondary outlined style. Source system role/data permissions are not added as editable or user-selectable profile fields.

### 10.4 State records

| State ID | Exact content / behavior | Actions / result |
| --- | --- | --- |
| `SCR-05.ready` | Jordan Ellis values above; JE fallback; Synthetic demo profile. | Back; sidebar navigation; account Log out. No Save/Edit. |
| `SCR-05.missing-optional` | Riley Chen / Riley / Chen / riley.chen@cfi-demo.example / designation **Not provided** / department **Not provided** / RC initials. | Do not infer job title or department from another user. |
| `SCR-05.avatar-failed` | Same permitted user details with initials replacing unavailable authorized avatar. | No broken-image icon or made-up portrait. |
| `SCR-05.loading` | **Loading profile…**; neutral field placeholders. | Shell remains; do not show another cached user's name as placeholder data. |
| `SCR-05.load-failed` | **Your profile could not be loaded. Try again.** | **Retry** and Back; do not equate a failed fetch with known missing optional fields. |
| `SCR-05.expired` | Protected identity cleared. | SCR-01.expired; no cached profile visible. |

### 10.5 Interactions and responsive transformation

Phone main region is one column with 16px inset. All fields stack in label/value order; email wraps safely. The header drawer/account controls remain accessible. Back returns to the previous canvas on phone when Profile was entered from that report; otherwise returns to the chat/empty workspace. Focus returns to the relevant account trigger or current workspace heading without resetting the conversation position.

Profile is not a form submission. No fake disabled Save button is used to communicate read-only status; the explanatory copy and plain values do that. A missing optional value is deliberately different from profile-load failure.

### 10.6 Assets and brand

AS-APP-001 intact logo; AS-APP-002 fallback font; initials for the primary fixture. KIT EXP-001/003, DES-001–004/006/007/009 apply. Do not add staff photography or promotional biography.

### 10.7 Concrete acceptance checks

All requested identity values and avatar fallback are represented. Initials are derived from the current permitted profile, not from a previous session. Missing designation/department read Not provided. No editing/settings controls. Shell navigation and return state work at 1440 and 390 widths. Server permits only the current user's profile; logout/expiry clears it.

### 10.8 Resolved render brief

**ID:** `SCR-05__ready__1440x900__v1.0.0`. Shared charcoal CFI header, synthetic strip and pale sidebar. Main white region: Profile, read-only explanation, JE/Jordan Ellis summary, exact six labeled fields in the specified two-column grouping, Back to conversation. No canvas, form inputs or Save.  
**Phone:** `SCR-05__missing-optional__390x844__v1.0.0`; RC/Riley Chen, all fields stacked; two Not provided values; drawer closed; no extra account tools.  
**Assets:** actual logo and initials only. All people are visibly fictional demo profiles.

## 11. Requirements-to-screen coverage and scope disposition

### 11.1 Functional coverage — all FR requirements

**Status for every included row:** specified; implementation and verification pending. “B-xx” means a mandatory backend/test obligation, not a hidden screen or a claim that a static render satisfies it. Shared behavior applies in every listed screen, including corresponding mobile states.

| Requirement | Entire behavior covered | Screen/state or shared owner | Contract / verification references |
| --- | --- | --- | --- |
| FR-01 | Login and safe unsuccessful-login feedback | SCR-01.idle / validation / submitting / credentials-rejected / service-failed | §6; B-01; AC-01 |
| FR-02 | Authentication, ownership and data-scope enforcement on every operation and altered identifier | SCR-01 protected redirect; SCR-03.resource-unavailable / access-limited; SCR-04.unauthorized; SCR-05 | §3.1, §8.4, §9.4; B-01/08; AC-01/02/20 |
| FR-03 | Logout/expiry, sensitive-state clearing, late-response suppression, history retained | SCR-01.expired / signed-out / signout-unconfirmed; shared account menu; all protected states | §3.4/3.6, §6.4; B-02/04; AC-17 |
| FR-04 | Top header, user identity, sidebar/New chat, central conversation and persistent shell | SCR-02–05; CMP-01–03 | §3; AC-18/21 |
| FR-05 | Avatar/display/first/last/email/designation/department, initials, empty optional fields, read-only | SCR-05.ready / missing-optional / avatar-failed | §10; B-01; AC-18 |
| FR-06 | Independent chats, first-submit persistence, no blank history accumulation or context inheritance | SCR-02 first-use / new-with-history / first-submit-pending; SCR-03.clarification-context | §3.2/3.6, §7; B-03/04/05; AC-03/06 |
| FR-07 | Persisted-message recency only; deterministic ties; viewing/report open does not reorder | CMP-02; SCR-03.background-complete; SCR-04 | §3.3, §5.3; B-03; AC-03/14 |
| FR-08 | Plain first-question auto-title, ~60 characters, pending New chat, sanitized markup, no rename | CMP-02; SCR-02.first-submit-pending | §3.3; B-03/08; AC-03 |
| FR-09 | Durable ordered histories and attachment references, restore after refresh/logout | SCR-03.history-loading / refresh-recovering; SCR-04.returned-snapshot | §3.6; B-03/06; AC-04/16 |
| FR-10 | Multiline Send, whitespace/length validation, Enter/Shift+Enter and IME | SCR-02.draft-ready / input-invalid; SCR-03 composer | CMP-05; AC-05 |
| FR-11 | Immediate submitted turn, pending state, one request/chat, no duplicates, draft next, origin-safe background results | SCR-02.first-submit-pending; SCR-03.processing / background-complete / interrupted | CMP-05/08; B-04; AC-05/16 |
| FR-12 | Same-chat context retained only when unambiguous; clarify if unavailable | SCR-03.follow-up-ready / clarification-context / clarification-person | ANS-02/03/06/12; B-05; AC-06/10 |
| FR-13 | Permission-on-demand, timer/start/stop/cancel, 120s bound, release device, navigation ownership | SCR-02.voice-*; SCR-03.voice-permission / recording / limit / leave-confirmation | CMP-06/09; B-07; AC-07/08 |
| FR-14 | Stop→transcribe→editable review→explicit Send; append to existing draft; persist final text | SCR-03.voice-transcribing / review / discard-review; SCR-02 equivalents | CMP-06; B-07/03; AC-07/08 |
| FR-15 | Permission/device/support/no-speech/transcription/timeout failures; typing and late-result safety | SCR-03.voice-permission-denied / no-device / unsupported / empty / transcription-failed / timeout / canceled | §8.5; B-07; AC-08 |
| FR-16 | Temporary audio only; cleanup after completion/cancel/failure; provider policy separate; no playback | SCR-03.voice-* and inherited new-chat states | CMP-06; B-07; U-05; AC-07/08 |
| FR-17 | Nonempty always-rendered Markdown, supported formatting, all completed reply categories; no raw/HTML mode | All completed SCR-03 answers; SCR-04 retains Markdown conversation | CMP-07; B-04/08; AC-05/20 |
| FR-18 | Agreed supported KPI questions through authorized Gold-layer read-only adapter; no invented numbers | SCR-03.scalar-ready / grouped-ready / follow-up-ready / report-ready | §5, B-05; live U-01–04; AC-09/10/22 |
| FR-19 | Clarify ambiguous people/metrics/date basis/definitions; decline unsupported capabilities | SCR-03.clarification-person / basis / context / unsupported | ANS-07/08/11/12; B-05; AC-06/11 |
| FR-20 | Zero vs empty vs partial vs denied vs query/AI failure; exact period/filters/freshness | SCR-03.zero-count / empty-report / partial-coverage / freshness-unknown / access-limited / data-query-failed / ai-failed | §5.5/8.4/9.4; B-05; AC-09/12/22 |
| FR-21 | Markdown summary plus one structured table; scalar answer may have none | SCR-03.report-ready / scalar-ready; SCR-04 | CMP-07/10; B-04/06; AC-13 |
| FR-22 | Compact title/type/count/truncation/actual preview; ≤3 rows/4 columns; more columns; Open report | SCR-03.report-ready / empty-report; SCR-04 cap variants | CMP-10; §9.4; B-06; AC-13/15 |
| FR-23 | Open/replace/close associated canvas; title/context/timing; reading-position preservation | SCR-04 loading / report-ready / replace-attachment; SCR-03 return | §3.6/9; B-06; AC-13/14 |
| FR-24 | All typed columns, snapshot/page counts, accessible scroll/headers/paging, null/ID/currency precision, read-only | SCR-04.report-ready / page-2 / valid-empty / cap-known / cap-unknown | CMP-11; §9.3; B-06/08; AC-13/15/21 |
| FR-25 | Same stored snapshot in preview/canvas; consistent semantics/auth/context; full vs cap/page counts; fresh request=new result | SCR-04.returned-snapshot / cap-known / cap-unknown / replace-attachment | §5/9.4–5; B-03/05/06; AC-04/14/15 |
| FR-26 | Loading/empty/unavailable/unauthorized/failure; local recovery; access recheck despite old ownership | SCR-04.loading / valid-empty / unavailable / unauthorized / load-failed / page-failed | §9.4/9.6; B-01/06; AC-02/12/17/19 |
| FR-27 | Request tracking, safe retry/refresh, original turn, attempt suppression, no writes | SCR-02.create-submit-interrupted; SCR-03.refresh-recovering / interrupted / timeout / failure | CMP-08; B-04/05; AC-16 |
| FR-28 | Idle/recording/transcribing/ready/pending/completed/empty/failed, operable controls and accessible announcements | All screen states; CMP-01–13 | §3–10; B-10; AC-05/08/19/21 |

### 11.2 Nonfunctional requirements

| Requirement | Required scope | Design/backend owner | Acceptance boundary |
| --- | --- | --- | --- |
| NFR-01 | Input/audio bounds, server secrets and sessions, cross-site protection, abuse controls; safe Markdown/cells/links/images | SCR-01 validation/rate-limited; CMP-05/06/07/11; B-01/07/08 | AC-01/02/20; provider byte limits and service policy U-05. Not satisfied by a visual render. |
| NFR-02 | Durable store, coherent reply/artifact persistence, uniqueness, request-state retention and revoked-cache enforcement | SCR-03 refresh/retry; SCR-04 saved snapshots; B-03/04/06 | AC-04/15/16/17. Browser-only memory is not integrated persistence. |
| NFR-03 | Prompt local pending target 300ms; bounded pages; stored 50-row/10-column canvas target 1s in declared setup | CMP-08/11; SCR-04 page states; B-10 | AC-21, performance capture. Targets unmeasured; external-service latency recorded separately. |
| NFR-04 | Keyboard, labels, visible focus, header/cell associations, non-color status; validate 1440/390 and record actual browsers | All screens and §3–4; B-10 | AC-21. No browser/contrast conformance claimed in this document. |
| NFR-05 | Request/stage/duration/error observability without credentials/audio/full rows/unrestricted transcripts | Safe UI references only; B-09 | Backend log inspection and controlled failure tests; no debug/admin UI added. |
| NFR-06 | Replaceable deterministic adapters, separate integration tests and no scope expansion | §5 fixtures; B-11; §11.6 exclusions | All acceptance rows by declared mode; no chart/dashboard/admin prerequisite. |

### 11.3 Business rules and non-numbered requirements in SYS §§5–10

These rows supplement the numbered FR/NFR map so semantic/backend obligations do not disappear merely because they are not visual controls.

| Source / local trace ID | Required behavior | Coverage / disposition |
| --- | --- | --- |
| SYS §5.1 · BIZ-01 | Monthly distinct created count; person/grouped created count; won count; detailed created report; prior-month follow-up. | ANS-01–06; SCR-03 and SCR-04; FX-MONTH-42 / PERSON / REPORT-64 / PREV-MONTH-28; B-05. Live definitions U-02. |
| SYS §5.1 · BIZ-02 | “Last week” report with unknown event basis must clarify. | ANS-08 / SCR-03.clarification-basis; no query until resolved. |
| SYS §5.2 · BIZ-03 | Approved dataset/grain/ID/definitions/date/person/status/exclusions/null/scope; do not invent live meanings. | §5.1 fixture contract only; U-01–03; B-05. Missing live inputs explicitly unresolved. |
| SYS §5.2 · BIZ-04 | Distinct bids despite repeated rows; won date and win-credit not creator/owner; missing mapping makes scenario unsupported. | §5.4 duplicates/archive wins; ANS-02/03; B-05; AC-09/10. |
| SYS §5.2 · BIZ-05 | Separate created/won counts, no naive summed unique total; no mixed-currency aggregation. | ANS-03; report Currency column; B-05/06; AC-10/15. |
| SYS §5.2 / §7.2 · BIZ-06 | Ten columns are illustrative, real schema data-driven; typed values, nulls and IDs preserved. | §9.3/15 and B-06. Do not claim fixture columns exist in Gold. |
| SYS §5.3 · BIZ-07 | Configured reporting timezone, resolve period once at acceptance, inclusive-start/exclusive-end, explicit dates override defaults. | §5/15.3; B-04/05; U-04; AC-09/22. |
| SYS §5.3 · BIZ-08 | Previous complete month; previous Monday–Sunday week; seven complete reporting dates excluding today. | Fixture August / 7–13 Sep / 9–15 Sep; ANS-01/05/08. Calendar defaults retained. |
| SYS §5.4 · BIZ-09 | Queried-at differs from data-updated-through; unknown freshness explicit; store filters/period; persist synthetic labeling. | CMP-01/12; ANS library; SCR-04 details; AC-22. |
| SYS §5.4 · BIZ-10 | Scalar counts use full authorized result, not preview/page/cap; disclose exact/unknown cap totals. | §9.4 capped states; FX-CAP variants; B-05/06; AC-15. |
| SYS §6.1 · ARCH-01 | Client, backend, persistent store, AI/analytics/transcription adapters; no required separate services/framework/vendor. | §12 logical owners; technology choices not selected or inferred from user preferences. |
| SYS §6.2 · EXEC-01 | Authenticate→persist question/request→resolve context→clarify or query→generate grounded Markdown→persist coherent reply/artifact→complete→page authorized snapshot. | B-01/03/04/05/06; CMP-08; SCR-03/04 lifecycle states. |
| SYS §6.2 · EXEC-02 | No fabricated result on failed data; no working-looking attachment when snapshot cannot persist; scalar limitation allowed honestly. | SCR-03.data-query-failed / report-save-failed; ANS-14; B-04/06. |
| SYS §6.3 · GUARD-01 | Allowlisted read-only metrics/parameters; no arbitrary model/user SQL; server credentials; untrusted warehouse/model text. | B-05/08; AC-20. No query editor, prompts or connection strings in UI. |
| SYS §7.1 · DATA-01 | Stable entity IDs/timestamps, ownership relationships, request attempts/idempotency/status, voice final text, Markdown-only assistant body. | §12.2 minimum entities; B-03/04/07; AC-04/07/16. |
| SYS §7.2 · DATA-02 | Snapshot/matching/truncated counts distinct; stable page schema/order; preview subset; snapshot retained with chat. | CMP-10/11; §9/12.2; B-06; AC-13–15. |
| SYS §7.3 · DATA-03 | Structured response with request/chat IDs, nonempty Markdown message, zero/one attachments; technical failure is request error. | B-04/06/08; SCR-03.reply-contract-failed. Source example values are not forced into our separate 64-row fixture. |
| SYS §8 · API-01 | All logical endpoints and per-resource authorization; first-create/send retry safety; complete final responses; safe errors/retry eligibility. | §12.3 complete interface map; B-01/04; no claim of current API availability. |
| SYS §9 · STATE-01 | All listed empty/pending/no-match/ambiguous/denied/service/page/session/refresh/recording-navigation/cancel states. | §6–10 state records; §11.1 mappings. None omitted as “happy-path only.” |
| SYS §10 · QUALITY-01 | All six nonfunctional requirements. | §11.2; backend and browser evidence pending. |

### 11.4 Source defaults retained — D-01 through D-13

| Default | Adopted screen/contract realization | Change from SYS |
| --- | --- | --- |
| D-01 | Pre-provisioned email/password; one authenticated business-user role; SCR-01. | None. Provider/users remain U-05/U-06; fixtures not real accounts. |
| D-02 | Read-only SCR-05; initials and Not provided. | None. |
| D-03 | CMP-06 transcription review with explicit Send. | None; draft-append/discard details resolved as X. |
| D-04 | Plain first-question title; persisted-activity recency in sidebar. | None; tie-break/title counting convention specified. |
| D-05 | Complete final Markdown response; one active request per chat. | None; other chats still operate independently. |
| D-06 | One table per answer; right canvas wide, main-area report narrow. | None; exact breakpoint/geometry specified. |
| D-07 | Up to 3×4 preview, fixed 50-row pages. | None; phone preview uses 2 of the allowed ≤4 columns. |
| D-08 | 5,000-row snapshot cap with known/unknown-total disclosures. | None. |
| D-09 | Past seven days excludes today; last week prior Monday–Sunday. | None. |
| D-10 | UTC/fixed clock only in synthetic fixture mode. | None. Live timezone unresolved. |
| D-11 | 4,000 submitted text characters; 120-second recording maximum. | None; code-point convention is an explicit implementation refinement; byte limits provider-dependent. |
| D-12 | 30-second transcription timeout; 90-second overall answer timeout. | None; retry waits for authoritative request/attempt state. |
| D-13 | Chats/snapshots retained until operator dataset reset; no user deletion UI. | None; production retention remains U-08. |

### 11.5 Primary journey coverage

| Journey | Exact screen/state chain | Verification |
| --- | --- | --- |
| J-01 KPI | SCR-01 → SCR-02 → SCR-03.processing → SCR-03.scalar-ready | AC-01/03/05/09 |
| J-02 recorded question | SCR-02 or SCR-03 → voice-recording → voice-transcribing → voice-review → explicit Send → processing → Markdown answer | AC-07/08; actual capture/provider needed to claim actual voice completion |
| J-03 report | SCR-03.report-ready → SCR-04.loading → report-ready → page-2 → close → same SCR-03 | AC-13/14/19 |
| J-04 resume | Return/sign in → sidebar select → persisted SCR-03 → stored SCR-04 snapshot | AC-04/15/16 |
| J-05 identity/leave | Shared account menu → SCR-05 → Back or Log out → SCR-01.signed-out | AC-17/18/21 |

### 11.6 Explicit out-of-scope inventory

No entry in this table becomes a decorative or disabled placeholder control. Omit it; explain scope only when the user asks through chat or in project documentation.

| Source exclusion group | Explicitly not implemented in this screen baseline | Disposition |
| --- | --- | --- |
| Identity / administration | Public registration; password reset screens; account administration; multiple permission-management roles; enterprise identity rollout. | Out of scope. Basic login/profile/logout and server access enforcement remain in scope. |
| Chat management / collaboration | Shared/team chats; administrative browsing; chat search; manual renaming; deleting; message editing; regeneration of successful answers. | Out of scope. Safe retry of failed/interrupted turns remains in scope. |
| Input / voice expansion | File/image uploads; voice playback; spoken AI responses; live voice calls. | Out of scope. Temporary microphone audio for transcription remains in scope. |
| Analytics product expansion | Charts; dashboards; report editing; spreadsheet formulas; report export/download; configurable columns; interactive filtering/sorting; scheduled reports; separate report library. | Out of scope. Fixed paging/scrolling and a new chat question for a different report remain in scope. |
| Data platform work | Warehouse construction; ingestion/medallion pipelines; organizational reporting-policy definition; unrestricted SQL; write-back. | Out of scope. Approved read-only Gold-layer adapter and explicit live semantic dependencies remain in scope. |
| Production-only commitments | Enterprise hardening; disaster-recovery certification; high availability commitments. | Out of scope. Baseline security, durable prototype persistence and failure handling remain required. |
| Unrequested brand/web features | Marketing navigation/contact form/consent text; testimonials; portfolio; generated property photography; dark-mode toggle; general app settings. | Not part of the system task; no corresponding screens or controls added. |

### 11.7 Application of all 22 kit rules

| Kit rules | Disposition in this task |
| --- | --- |
| EXP-001 / EXP-002 / EXP-003 / EXP-004 | Applied: practical task orientation, current object/state/evidence, literal honest copy, property/bid vocabulary with fictional-data separation. |
| DES-001 / DES-002 / DES-003 / DES-004 | Applied: red/neutral signature, aligned regions, sans-serif/square geometry and one action system. App scale is a recorded extension. |
| DES-005 | Applied selectively: button-hover endpoint and account disclosure. Media-card shadow is not generalized to data panels. |
| DES-006 / DES-007 | Applied: explicit responsive transforms and system-governed navigation, not an invented marketing app. |
| DES-008 / DES-009 | Applied: actual identity provenance, no screenshot extraction, restrained useful feedback, focus/reduced motion and honest simulation labels. |
| PAT-001 | Not used as a marketing header/hero. Only relevant interaction expression is adapted through DES-005. No photo entrance or website menu. |
| PAT-002 | Not used: no service/project media browsing. Compact report preview is a task-specific component, not a fake service card. |
| PAT-003 | Not used: report filters/sorting are explicitly excluded. Sidebar selection is not a property-scope filter. |
| PAT-004 | Applied to login/composer with literal actions and complete validation/pending/error behavior. |
| PAT-005 | Not used as testimonial/social proof. Data provenance is factual application metadata, not a charcoal promotional proof band. |
| PAT-006 | Applied to Answer details / Report details, with essential constraints kept visible. |
| IMG-001 / IMG-002 / IMG-003 | Intentionally omitted: property/interior photos and environmental linework are unnecessary for these operational screens. No missing-image box is inserted. |

## 12. Backend and integration contracts that the screens must not conceal

### 12.1 Mandatory non-visual owners

These contracts preserve SYS §§2.3 and 6–10. They are not an instruction to build additional services, a prescribed technology stack, or a claim that integration has been completed. A single application, durable store and replaceable adapters are sufficient.

| Owner | Mandatory behavior | Visible evidence / forbidden shortcut |
| --- | --- | --- |
| **B-01 — Authentication, ownership and scope** | Establish authenticated identity server-side; validate it for every chat/message/request/artifact/profile operation; derive data scope server-side; check artifact→message→chat ownership links; deny altered IDs safely. Common scope requires explicit authorization for every provisioned user. | SCR-01 protected entry; SCR-03/04 safe denial. Hiding sidebar rows or trusting a browser user ID is not authorization. A common warehouse credential is not row-level permission. |
| **B-02 — Session termination and expiry** | Invalidate session on logout; expire access; clear protected client data/audio/drafts; invalidate session-generation/request subscriptions; suppress late answers/pages/transcripts. Retain saved server history. | SCR-01 expired/signed-out; signout-unconfirmed if network confirmation fails. Do not call local hiding a confirmed server logout. |
| **B-03 — Durable application state** | Persist identity references, owned chats, ordered messages, activity timestamps, requests, artifact descriptors and snapshots. Stable sequence/IDs survive refresh and logout. Sort only by persisted message activity. | SCR-03 restoration; SCR-04 original snapshots. Browser localStorage/in-memory state alone cannot satisfy the integrated/synthetic application baseline. |
| **B-04 — Request lifecycle and publication** | Retry-safe first create/send; one active request per chat; logical idempotency key plus current attempt; persisted user message; recoverable status; one terminal successful Markdown reply. Resolve ranges once. Validate reply contracts and persist complete message/attachment references coherently before complete status. Superseded attempts cannot publish. | Processing/interrupted/retry/contract-failure states. No duplicate new chat or successful answer after lost transport. A frontend timeout does not prove the server stopped. |
| **B-05 — Approved analytics and AI orchestration** | Allowlisted metric/report intents and validated parameters over authorized read-only Gold data; clarify missing definitions/people/date basis before querying; use source result for values and provenance; preserve role/date/count/currency semantics; no arbitrary SQL or write-back. | Exact Markdown answers, explicit conditions and details. Never use model general knowledge for warehouse numbers; never replace a live failure with fictional success. |
| **B-06 — Table artifact and snapshot service** | Construct typed schema/counts/preview from real result; bounded persisted snapshot; deterministic paging; metadata and rows reauthorized on every request; same preview and canvas snapshot; full matching count separate from cap/page. Reopen never reruns source query. | SCR-04 50/14 pages, capped/unknown counts, revoked/empty/error states. A language model cannot mint a plausible working artifact ID or invented row count. |
| **B-07 — Audio/transcription lifecycle** | Actual capture when integrated; enforce duration and provider-specific payload limits on client/server; scoped cancel tokens; delete application-held temporary audio on completion/cancel/failure; expire abandoned uploads; return actionable errors. Provider retention documented independently. | Record→stop→review→send and failure fixtures. No raw-audio history or playback. A canned transcript is a simulation, not a passed actual-voice test. |
| **B-08 — Content/session security and abuse controls** | Secure cookies/session handling; protect state-changing actions against unauthorized cross-site requests; validate inputs; prevent credential leakage; disable active/raw-HTML Markdown; reject unsafe URLs; block unsolicited remote-image loads; render cells as inert data; bound login/AI/transcription abuse. | Safe rendered text and clear classified failure. No scripts, prompt injection, restricted scopes, arbitrary query execution or external-image request caused by untrusted content. |
| **B-09 — Observable but private operation** | Correlate request/attempt/stage/duration and safe failure category. Avoid default logging of credentials, raw audio, full report rows or unrestricted conversations. Diagnose only authorized records. | Optional safe request reference on a failed turn. No admin/log screen is introduced. Logging policy is tested, not implied by UI polish. |
| **B-10 — Bounded rendering and accessible behavior** | Page rows; show local pending promptly; measure stored-page responsiveness separately from service latency; semantic keyboard/focus/live regions; required viewport tests and actual browser records. | 300ms local-pending and 1s stored 50-row-page targets require recorded environment/measurement; no performance claim here. |
| **B-11 — Fixture and delivery discipline** | Replaceable AI/analytics/transcription adapters; deterministic fixtures, two users, boundaries, failures and snapshot variants; separate visual, frontend, server and live-integration evidence. | Persistent mode labels and honest test results. No charts/admin/report builder added as a prerequisite. |

### 12.2 Data contract preservation

The following source entities remain the minimum logical contract, not a physical database schema. Internal IDs/security references are not automatically added as UI fields.

| Entity | Required logical fields / invariant | Screen use |
| --- | --- | --- |
| User / identity | Stable ID; provider reference if applicable; first/last/display name; email; optional avatar/designation/department; server-resolved scope reference. | Authenticated shell and all SCR-05 fields; scope is not a user-editable preference. |
| Chat | ID; owner; title; created timestamp; last activity timestamp. | CMP-02 recency/title, route ownership. |
| Message | ID; chat; stable sequence; role; body format/content; timestamp; request ID; user input mode. | Ordered user text / rendered assistant Markdown; persisted final edited transcript. |
| Request | ID; chat; user-message ID; idempotency key; active attempt; queued/running/completed/failed/interrupted status; result-message ID; safe error; start/end times; resolved context. | Pending/recovery/error control, not a frontend-only spinner. |
| Table artifact | ID; owner/chat/assistant-message links; title/type; typed columns; snapshot reference; snapshot row count; optional matching total; truncation; filters/provenance/order; permission-scope reference. | Preview, context, count truthfulness and snapshot paging. |

Every timestamp has an unambiguous offset/timezone. Typed decimal data must retain precision through transport/formatting; do not round an arbitrary money value by converting it to an imprecise display approximation. Identifiers stay strings. A missing value remains null, never silently zero or an empty identifier.

`assistantMessage.bodyFormat` is always `markdown`; `bodyMarkdown` is nonempty for completed assistant replies. `attachments` is an empty list or one table descriptor. The list structure does not authorize multiple current artifact types or a report library. A technical failure has a request-error state, not a fake success with empty Markdown. The source's illustrative two-row JSON response is a shape example, not a constraint that overrides this document's explicitly separate 64-row fixture.

`totalMatchingRowCount=null` means unknown, not zero. `snapshotRowCount` refers to retained rows, not the current page. `isTruncated=true` requires a visible warning and either an exact matching total or explicit unknown-total wording. A preview is an actual subset; a page response carries the same schema, stable ordering, snapshot count and next-page information. If a source could return duplicate rows per bid, distinct counting and the approved report grain must be resolved in the analytics contract, not guessed by a table component.

### 12.3 Complete logical interface-to-screen map

These interfaces are from SYS §8; equivalent routes may be implemented without changing responsibilities. Each operation uses B-01 authorization and safe classified errors. No endpoint is being claimed as currently available.

| Interface | Initiator / visible transition | Critical condition |
| --- | --- | --- |
| POST `/api/auth/login` | SCR-01 Sign in → submitting → SCR-02 or safe error | Provisioned account; no account-existence disclosure; secure session. |
| POST `/api/auth/logout` | Shared Log out → protected-state clearing → SCR-01 | Server invalidation must be confirmed; late payloads discarded. |
| GET `/api/me` | Shell/profile load → authorized identity / load failure | Current user only; optional nulls distinct from failure. |
| GET `/api/chats` | Sidebar → loading/list/empty/failure | Owned chats only; persisted activity and deterministic tie-break. |
| POST `/api/chats` | First valid submission from SCR-02 | Share submission identifier or atomic create/send equivalent to prevent duplicate chats. |
| GET `/api/chats/{id}/messages` | SCR-03 entry/refresh | Ordered messages, attachment descriptors and active-request status; do not trust route ID. |
| POST `/api/chats/{id}/messages` | Send → optimistic submitted/pending | Text, input mode and idempotency key; server validates one active request per chat. |
| GET `/api/requests/{id}` | Poll/notification recovery after submit or refresh | Authoritative queued/running/terminal state; ownership; no blind resubmit. |
| POST `/api/requests/{id}/retry` | Eligible Retry answer/question | Same logical turn, controlled new attempt, no duplicate terminal reply or warehouse write. |
| POST `/api/transcriptions` | Stop recording → transcribing → review/error | Bounded temporary audio; origin/cancel token; actual provider only in declared integrated mode. |
| GET `/api/artifacts/{id}` | Preview/report metadata → loading/ready/denied | Authorized title/schema/preview/counts/context from persisted snapshot, not a rerun. |
| GET `/api/artifacts/{id}/rows` | Open/paginate report → page state | Authorized bounded page of the same snapshot, deterministic order and schema; revoked cache access denied. |

The default delivery is one complete final answer. Polling or equivalent notification transport may update request status; it must not imply partial Markdown streaming or expose unvalidated content before persistence. No user-facing AI request cancellation is added. Timeouts and safe recovery remain required.

## 13. Verification matrix, unresolved inputs and delivery readiness

### 13.1 Acceptance coverage — every source criterion

**Current result for AC-01–AC-22: NOT RUN.** The expected behavior is specified; this artifact contains no browser session, implemented backend, actual microphone/provider run or live warehouse test. Fixture arithmetic checks performed while writing this document are not substitutes for these acceptance tests.

Record a result, delivery mode, fixture/reference dataset version, environment/browser version, steps and evidence for each applicable criterion during implementation.

| Criterion | Source test | Screen / contract coverage | Expected evidence | Verification layer |
| --- | --- | --- | --- | --- |
| AC-01 | Protected entry | SCR-01 validation/success; SCR-02; B-01 | Unauthenticated page/API returns no protected content; valid login opens empty workspace; invalid login safe. | Frontend + server auth |
| AC-02 | Two-user isolation | SCR-03.resource-unavailable; SCR-04.unauthorized; B-01 | U-A/U-B altered chat/message/request/artifact IDs denied; scopes enforced; no leaked title/count. | Server authorization; client cache inspection |
| AC-03 | Multiple chats and recency | SCR-02 / CMP-02; C-A01–03 | Three chats; persist new turn in older chat→top; open/read/report→no reorder; blank drafts do not accumulate. | State + durable store |
| AC-04 | Persistence | SCR-03 restore; SCR-04.returned-snapshot | Refresh then log out/in; same ordered messages, references and snapshot data remain. | Durable synthetic app; repeat integrated |
| AC-05 | Typed submission and Markdown | CMP-05/07/08; SCR-03 | One user turn/pending/Markdown answer; headings/emphasis/lists/links/code; whitespace/length/IME/keyboard valid. | Frontend + response contract |
| AC-06 | Context boundaries | ANS-02/03/12; SCR-02/03 | Casey follow-up preserves person/period in same chat; new chat asks rather than inherits. | Orchestration + fixtures |
| AC-07 | Actual recorded journey | SCR-03.voice-recording/transcribing/review | Real capture→stop→edit seventy→seven→Send; only edited text saved; device released; no auto-send. | Actual device + transcription; simulation insufficient |
| AC-08 | Voice failures/cancel | All SCR-03.voice failure states; CMP-09 | Denied/no device/empty/failure/120s limit/30s timeout/cancel; no late draft contamination; temporary audio cleanup. | Device + server/transcription failure injection |
| AC-09 | Monthly created semantics | ANS-01; FX-MONTH-42 / FX-BOUNDARIES | Distinct 42 despite duplicate source row; proper timezone/start/end; live count compared to approved reference. | Fixture analytics then approved live query |
| AC-10 | Person / won-date semantics | ANS-02/03/04; P-01 and archived wins | Casey created 18 versus won 7; two wins created before period; creator/owner/win credit separate; no naive total of 25. | Fixture semantics then approved mappings |
| AC-11 | Ambiguity / unsupported | ANS-07/08/11; SCR-03 clarification/unsupported | Duplicate Alex, undefined KPI, ambiguous report basis clarified; no guessed query or nonfunctional feature. | Orchestration + UI |
| AC-12 | Zero versus failure | SCR-03 zero/partial/denied/query-failed; SCR-04.valid-empty | Only valid empty result is zero; missing coverage/denial/warehouse failure are different states. | Analytics failures + UI |
| AC-13 | Preview and full canvas | SCR-03.report-ready; SCR-04.report-ready/page-2 | Actual 3×4 preview; 64 rows/10 columns; open; all columns reachable; 50/14 pages; phone two-column preview disclosed. | Frontend + snapshot API |
| AC-14 | Close/reopen/selection | SCR-04→SCR-03; ART-A01/A02 | Scroll/page; close; preserved reading position; no recency change from reading; selected artifact correct. | Frontend navigation + state |
| AC-15 | Snapshot/count truthfulness | Returned snapshot; cap known/unknown; §15 | Mutate source; old report remains 64; test 5,237/5,000 and unknown totals; zero/null/IDs/currency; no page-based KPI. | Store + analytics + paging tests |
| AC-16 | Retry/refresh integrity | SCR-02 create-submit-interrupted; SCR-03 refresh/interrupted | Lose first create/send, running work and completed response delivery; recover without duplicates or unexplained spinner. | Transport/attempt/store fault injection |
| AC-17 | Logout / revoked access | SCR-01 expired/signed-out; SCR-04.unauthorized | Logout while pending; no late payload; revoke scope and verify cached rows are not served; history retained. | Session/server cache + UI |
| AC-18 | Profile completeness | SCR-05.ready/missing-optional/avatar-failed | All fields, JE/RC initials, Not provided only for known nulls; no edit/save workflow. | Profile API + UI |
| AC-19 | Canvas-local failure | SCR-04.page-failed/load-failed/valid-empty | Injected page failure leaves chat usable; retry correct snapshot/page; empty is not load failure. | API failure injection + UI |
| AC-20 | Safe rendering/tool boundaries | CMP-07/11; B-01/05/08 | Malicious Markdown/cells/unsafe links/remote images/instructions cannot execute, load unsolicited content, change scope or write data. | Security/adapter contract + network inspection |
| AC-21 | Keyboard / narrow / responsiveness | All screens at 1440 and 390; §3–4 | Complete login/chat/profile/report/page journey by keyboard; record browsers and 300ms/1s target results. | Actual browser + accessibility/performance evidence |
| AC-22 | Mode/provenance honesty | CMP-01/12; SCR-03/04 | Synthetic marker always visible; integrated actual timezone/query/freshness; no silent fixture substitution on live failure. | UI + integration configuration + failures |

### 13.2 Unresolved external inputs

These are dependencies, not questions requiring an approval round to finish this specification. The chosen fixtures and visual defaults allow screen work to proceed; corresponding live claims remain blocked.

| ID | Missing or unverified input | Resolved design fallback / limitation | Required owner / affected acceptance |
| --- | --- | --- | --- |
| U-01 | Approved Gold-layer view, read-only connectivity and available reporting columns | Deterministic synthetic analytics; no “Connected to CFI” or live-data claim. Real schema drives table. | Data/integration owner; AC-09/10/13/22 |
| U-02 | Real metric grain/ID/date/person/status/exclusion/reversal/null definitions | Explicit fixture-only contract in §5; ambiguous live scenarios must clarify or be unsupported. | Business/report owner; AC-09–12 |
| U-03 | Actual user data scope and historical-data access/redaction policy | Disjoint fixture scopes; server enforcement and revocation tests. Never expose real data without approved scope. On denial purge affected cached rows/previews and follow server-authorized narrative visibility. | Data/security owner; AC-02/17/20 |
| U-04 | Live reporting timezone and available source freshness metadata | UTC/fixed clock is synthetic only; freshness may say Not supplied. Query time is never relabeled as freshness. | Business/data owner; AC-09/22 |
| U-05 | AI/transcription services, credentials, provider payload limits, permission behavior and data-handling/retention terms | Replaceable declared fixture adapters. Real microphone/transcription acceptance remains unverified; application temporary cleanup still specified. | Technical owner; AC-07/08/20/22 |
| U-06 | Provisioned real accounts/profile values and actual identity integration | Fictional Jordan/Riley profiles; proposed email/password flow, no embedded production credentials. | Application/identity owner; AC-01/02/18 |
| U-07 | Hosting, durable-store choice, network environment and exact supported/tested browsers | Logical contracts and target viewports only; no stack, deployment-readiness or browser-compatibility claim. | Technical/test owner; NFR-02–04; AC-04/16/21 |
| U-08 | Final prototype/production retention and operating reset policy | Source D-13 retained: operator reset governs synthetic data; no user deletion/settings screen. Real retention needs owner terms. | Application/security/data owner; B-03/07 |
| U-09 | Official logo clear space/minimum size, broader rights, actual typeface and other original artwork | Supplied logo used intact for this task at chosen modest size; local font fallback; photography/linework omitted. No screenshot extraction. | Brand/asset owner; affects fidelity/permission claims, not core workflow coverage |

The brand-kit dependency listed in SYS §12 is satisfied for **working prototype expression**, not for client-confirmed brand approval. The supplied logo resolves the **file-availability** gap, not every identity-rights or production-governance question.

### 13.3 Delivery modes must remain distinct

| Mode | What may legitimately be demonstrated | Required visible statement / completion boundary |
| --- | --- | --- |
| **Current specification / future static screen render** | Intended content, layout and states. | Fictional data/synthetic marker; no claim that controls, authentication, microphone, storage or queries work. |
| **Optional future standalone local HTML experience demo** | In-memory navigation, deterministic answers, table pages, keyboard behaviors and explicit voice/login simulation, if implemented. No network/server/CDN dependencies under KIT. | **Local interaction demo · Simulated sign-in, answers and voice · Resets on reload.** Keep fictional-data/UTC label too. This is a scoped experience review, **not** completion of durable/authenticated/actual-voice requirements. Reset demo, if implemented, is a clearly local development action, not a production account feature. |
| **Synthetic application prototype** | All screens and request/persistence behavior against deterministic fixture adapters, with genuine durable store and authenticated owned accounts where those criteria are claimed. | **Synthetic demo · Fictional data · Reporting timezone: UTC**. Explicitly identify any simulated transcription/AI behavior. Fixture data alone does not waive server isolation or storage tests. |
| **Integrated prototype** | Real authentication, actual microphone/transcription, AI service and approved read-only Gold data with verified reference queries. | Actual configured reporting timezone/provenance, no synthetic marker if no fixtures are used, and no silent demo fallback. Every relevant acceptance criterion requires evidence. |

A failed live integration must fail honestly, not silently switch to a fixture. A future one-file HTML deliverable must include a separate limitation record showing which baseline requirements remain simulated/unmet; it must not claim this screen specification changed the system's persistence/authentication contract.

### 13.4 Handoff completion criteria

For design handoff, this file supplies a stable source/version record, full screen/state inventory, shared direction/components, exact fictional content, responsive decisions, assets, resolved briefs and traceability. It does not deliver the source system's build package.

The later **build handoff** still requires working application code, durable persistence, logical adapters/interfaces, environment/setup instructions, deterministic fixture dataset and demo accounts, a log of changed defaults, configuration/secrets outside client code, reference-query results, two-user tests, boundary/cap/missing-value/failure cases and automated ownership/semantic/uniqueness/snapshot tests. These SYS §14.2 obligations map to B-01–11 and AC-01–22; they are not extra screens or silently deferred prototype functionality.

The later **definition of done** remains mode-specific end-to-end journeys, recorded acceptance evidence, coherent answer/report data, functioning required controls and explicit live limitations. A polished static image or local simulation alone cannot satisfy it. No production-only exclusion becomes a prerequisite for this bounded prototype.

## 14. Rendering and revision contract

### 14.1 Resolved screen register

| Screen | Primary state / target | Companion states already specified | Governing brief |
| --- | --- | --- | --- |
| SCR-01 Login | idle / 1440×900 | expired; credentials-rejected; phone idle | §6.8 |
| SCR-02 Empty workspace | new-with-history / 1440×900 | first-use /390×844; draft; first-submit interruption | §7.8 |
| SCR-03 Active conversation | report-ready, canvas closed /1440×900 | scalar; clarification-person; voice-review /390×844; local errors | §8.8 |
| **SCR-04 Report canvas — first render** | **report-ready, ART-A01, page 1, scroll x=0 /1440×900** | phone full-width; page 2; empty; cap; denied; page failure | **§9.8** |
| SCR-05 Basic profile | ready /1440×900 | missing-optional /390×844; loading/failure | §10.8 |

A render is identified by **screen ID + state + viewport + specification revision**, plus selected fixture/artifact/page where applicable. Do not call an unspecified blend of states “the dashboard.” There is no dashboard.

### 14.2 Instructions for the next rendering session

Use this specification and the same working CFI kit, supplied logo and six references. Apply the defined direction; do not repeat brand discovery or generate a competing layout. Render one named screen/state, not a contact sheet. Reuse exact fixture names, dates, counts, field labels, report ordering and mode marker. Tables must retain legibility through intentional scrolling; do not redraw ten tiny columns merely to fit an image.

For **image generation**, use the actual image-generation capability when asked. Target the specified viewport composition; do not claim exact returned pixels until measured. The logo supplied here is the identity reference; if exact reproduction is not possible, identify a concept-level approximation or use the declared text fallback, never claim a newly drawn mark is the original. No separate reusable photography asset is required or already generated.

For **HTML**, follow KIT's offline/self-contained requirements when that format is requested. Embed only permitted actual assets; no reference screenshots, extracted photographs, external fonts, CDN, fetch credentials or remote tracking. Use semantic controls and explicitly simulated state transitions as appropriate to that delivery mode. An in-memory demonstration is not a durable integrated prototype. Do not imply that source inspection equals browser testing.

Make a deliberate change in this specification before reflecting it in a subsequent render. Update revision and affected screen/fixture/acceptance references. A generated detail cannot silently become brand authority. Keep successful creative app decisions in this task specification unless separately adopted into the canonical brand kit.

### 14.3 Exact first-render request

> Render **SCR-04 / report-ready / desktop / 1440×900 / CFI-DIC-SCREENS v1.0.0** using SCREEN_SPECIFICATIONS.md §9.8, the working CFI kit and supplied CFI_logo.svg. Use C-A01, ART-A01/SNAP-A01 and FX-REPORT-64, page 1 with horizontal scroll at the first column. Preserve the 248/416/776 layout, rendered Markdown answer, actual three-row preview, visible synthetic-data label, read-only report and deliberate table overflow. Do not add charts, filters, export, photography or new application navigation. Produce only the requested rendering format.

This is a future instruction, not an image or HTML deliverable in the current task.

## 15. Canonical fixture appendix

### 15.1 Exact primary preview

This is a display subset of the first three `FX-REPORT-64` rows, not a second independently invented data source. All are fictional. Desktop preview shows four columns; phone shows only the first two and the corresponding additional-column disclosure.

| Bid ID | Status | Bid amount | Currency |
| --- | --- | --- | --- |
| 000064 | In review | 124,500.00 | USD |
| 000063 | Submitted | 86,750.00 | USD |
| 000062 | Won | 54,000.50 | CAD |

### 15.2 Full 64-row deterministic report fixture

This is a **specification fixture**, not a spreadsheet attachment or a claim that a report has been implemented. Store/serve it as typed structured data later. IDs remain strings; amounts below are decimal strings; `null` is a null value, not the literal word to show in the rendered table. Render null as **—** with the legend. Person codes resolve through §5.2; the UI shows names (and the Alex disambiguating labels), not opaque P-codes. Display created/won timestamps with explicit UTC.

**Page 1 = ordinal 1–50. Page 2 = ordinal 51–64.** Each page's table contains only the ten report columns; the ordinal used to organize this appendix is not an eleventh product column. Titles, rows, source watermark, snapshot counts and answer statements must remain synchronized.

#### Snapshot page 1 — ordinals 1–50

| Bid ID | Bid title | Created at | Created by | Bid owner | Status | Won at | Won by | Bid amount | Currency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 000064 | Demo Alder Court — siding | 2026-09-15T16:30:00Z | P-01 | P-04 | In review | null | null | 124500.00 | USD |
| 000063 | Demo Maple Court — interior painting | 2026-09-15T15:53:00Z | P-01 | P-05 | Submitted | null | null | 86750.00 | USD |
| 000062 | Demo Juniper House — windows and doors | 2026-09-15T15:16:00Z | P-01 | P-02 | Won | 2026-09-15T19:15:00Z | P-01 | 54000.50 | CAD |
| 000061 | Demo Willow Court — roofing | 2026-09-15T14:39:00Z | P-01 | P-01 | Declined | null | null | 23500.28 | USD |
| 000060 | Demo Cedar House — carpentry | 2026-09-15T14:02:00Z | P-01 | P-04 | Submitted | null | null | 24875.35 | USD |
| 000059 | Demo Birch Court — caulking and waterproofing | 2026-09-15T13:25:00Z | P-01 | P-05 | Won | 2026-09-15T18:30:00Z | P-01 | 26250.42 | CAD |
| 000058 | Demo Aspen House — tenant improvements | 2026-09-15T12:48:00Z | P-01 | P-02 | Draft | null | null | 27625.49 | USD |
| 000057 | Demo Elm Court — renovation | 2026-09-15T12:11:00Z | P-01 | P-01 | Declined | null | null | null | USD |
| 000056 | Demo Alder Court — siding | 2026-09-15T11:34:00Z | P-01 | P-04 | Won | 2026-09-15T19:45:00Z | P-01 | 30375.63 | CAD |
| 000055 | Demo Maple Court — interior painting | 2026-09-15T10:57:00Z | P-01 | P-05 | In review | null | null | 31750.70 | USD |
| 000054 | Demo Juniper House — windows and doors | 2026-09-14T16:30:00Z | P-01 | P-02 | Draft | null | null | 0.00 | USD |
| 000053 | Demo Willow Court — roofing | 2026-09-14T15:53:00Z | P-01 | P-01 | Won | 2026-09-15T18:00:00Z | P-01 | 34500.84 | CAD |
| 000052 | Demo Cedar House — carpentry | 2026-09-14T15:16:00Z | P-01 | P-04 | Submitted | null | null | 35875.91 | USD |
| 000051 | Demo Birch Court — caulking and waterproofing | 2026-09-14T14:39:00Z | P-01 | P-05 | In review | null | null | 37250.98 | USD |
| 000050 | Demo Aspen House — tenant improvements | 2026-09-14T14:02:00Z | P-01 | P-02 | Won | 2026-09-15T19:15:00Z | P-01 | 38625.05 | CAD |
| 000049 | Demo Elm Court — renovation | 2026-09-14T13:25:00Z | P-01 | P-01 | Declined | null | null | 40000.12 | USD |
| 000048 | Demo Alder Court — siding | 2026-09-14T12:48:00Z | P-01 | P-04 | Submitted | null | null | 41375.19 | USD |
| 000047 | Demo Maple Court — interior painting | 2026-09-14T12:11:00Z | P-01 | P-05 | In review | null | null | 42750.26 | CAD |
| 000046 | Demo Juniper House — windows and doors | 2026-09-14T11:34:00Z | P-02 | P-02 | Draft | null | null | 44125.33 | USD |
| 000045 | Demo Willow Court — roofing | 2026-09-14T10:57:00Z | P-02 | P-01 | Declined | null | null | 45500.40 | USD |
| 000044 | Demo Cedar House — carpentry | 2026-09-13T16:30:00Z | P-02 | P-04 | Submitted | null | null | 46875.47 | CAD |
| 000043 | Demo Birch Court — caulking and waterproofing | 2026-09-13T15:53:00Z | P-02 | P-05 | In review | null | null | 48250.54 | USD |
| 000042 | Demo Aspen House — tenant improvements | 2026-09-13T15:16:00Z | P-02 | P-02 | Draft | null | null | 49625.61 | USD |
| 000041 | Demo Elm Court — renovation | 2026-09-13T14:39:00Z | P-02 | P-01 | Declined | null | null | 51000.68 | CAD |
| 000040 | Demo Alder Court — siding | 2026-09-13T14:02:00Z | P-02 | P-04 | Submitted | null | null | 52375.75 | USD |
| 000039 | Demo Maple Court — interior painting | 2026-09-13T13:25:00Z | P-02 | P-05 | In review | null | null | 53750.82 | USD |
| 000038 | Demo Juniper House — windows and doors | 2026-09-13T12:48:00Z | P-02 | P-02 | Draft | null | null | 55125.89 | CAD |
| 000037 | Demo Willow Court — roofing | 2026-09-13T12:11:00Z | P-02 | P-01 | Declined | null | null | 56500.96 | USD |
| 000036 | Demo Cedar House — carpentry | 2026-09-13T11:34:00Z | P-02 | P-04 | Submitted | null | null | 57875.03 | USD |
| 000035 | Demo Birch Court — caulking and waterproofing | 2026-09-13T10:57:00Z | P-02 | P-05 | In review | null | null | 59250.10 | CAD |
| 000034 | Demo Aspen House — tenant improvements | 2026-09-12T16:30:00Z | P-02 | P-02 | Draft | null | null | 60625.17 | USD |
| 000033 | Demo Elm Court — renovation | 2026-09-12T15:53:00Z | P-02 | P-01 | Declined | null | null | 62000.24 | USD |
| 000032 | Demo Alder Court — siding | 2026-09-12T15:16:00Z | P-02 | P-04 | Submitted | null | null | 63375.31 | CAD |
| 000031 | Demo Maple Court — interior painting | 2026-09-12T14:39:00Z | P-02 | P-05 | In review | null | null | 64750.38 | USD |
| 000030 | Demo Juniper House — windows and doors | 2026-09-12T14:02:00Z | P-03 | P-02 | Draft | null | null | 66125.45 | USD |
| 000029 | Demo Willow Court — roofing | 2026-09-12T13:25:00Z | P-03 | P-01 | Declined | null | null | 67500.52 | CAD |
| 000028 | Demo Cedar House — carpentry | 2026-09-12T12:48:00Z | P-03 | P-04 | Submitted | null | null | 68875.59 | USD |
| 000027 | Demo Birch Court — caulking and waterproofing | 2026-09-12T12:11:00Z | P-03 | P-05 | In review | null | null | 70250.66 | USD |
| 000026 | Demo Aspen House — tenant improvements | 2026-09-12T11:34:00Z | P-03 | P-02 | Draft | null | null | 71625.73 | CAD |
| 000025 | Demo Elm Court — renovation | 2026-09-12T10:57:00Z | P-03 | P-01 | Declined | null | null | 73000.80 | USD |
| 000024 | Demo Alder Court — siding | 2026-09-11T16:30:00Z | P-03 | P-04 | Submitted | null | null | 74375.87 | USD |
| 000023 | Demo Maple Court — interior painting | 2026-09-11T15:53:00Z | P-03 | P-05 | In review | null | null | 75750.94 | CAD |
| 000022 | Demo Juniper House — windows and doors | 2026-09-11T15:16:00Z | P-03 | P-02 | Draft | null | null | 77125.01 | USD |
| 000021 | Demo Willow Court — roofing | 2026-09-11T14:39:00Z | P-03 | P-01 | Declined | null | null | 78500.08 | USD |
| 000020 | Demo Cedar House — carpentry | 2026-09-11T14:02:00Z | P-03 | P-04 | Submitted | null | null | 79875.15 | CAD |
| 000019 | Demo Birch Court — caulking and waterproofing | 2026-09-11T13:25:00Z | P-03 | P-05 | In review | null | null | 81250.22 | USD |
| 000018 | Demo Aspen House — tenant improvements | 2026-09-11T12:48:00Z | P-04 | P-02 | Draft | null | null | 82625.29 | USD |
| 000017 | Demo Elm Court — renovation | 2026-09-11T12:11:00Z | P-04 | P-01 | Declined | null | null | 84000.36 | CAD |
| 000016 | Demo Alder Court — siding | 2026-09-11T11:34:00Z | P-04 | P-04 | Submitted | null | null | 85375.43 | USD |
| 000015 | Demo Maple Court — interior painting | 2026-09-11T10:57:00Z | P-04 | P-05 | In review | null | null | 86750.50 | USD |

#### Snapshot page 2 — ordinals 51–64

| Bid ID | Bid title | Created at | Created by | Bid owner | Status | Won at | Won by | Bid amount | Currency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 000014 | Demo Juniper House — windows and doors | 2026-09-10T16:30:00Z | P-04 | P-02 | Draft | null | null | 88125.57 | CAD |
| 000013 | Demo Willow Court — roofing | 2026-09-10T15:53:00Z | P-04 | P-01 | Declined | null | null | 89500.64 | USD |
| 000012 | Demo Cedar House — carpentry | 2026-09-10T15:16:00Z | P-04 | P-04 | Submitted | null | null | 90875.71 | USD |
| 000011 | Demo Birch Court — caulking and waterproofing | 2026-09-10T14:39:00Z | P-04 | P-05 | In review | null | null | 92250.78 | CAD |
| 000010 | Demo Aspen House — tenant improvements | 2026-09-10T14:02:00Z | P-04 | P-02 | Draft | null | null | 93625.85 | USD |
| 000009 | Demo Elm Court — renovation | 2026-09-10T13:25:00Z | P-04 | P-01 | Declined | null | null | 95000.92 | USD |
| 000008 | Demo Alder Court — siding | 2026-09-10T12:48:00Z | P-05 | P-04 | Submitted | null | null | 96375.99 | CAD |
| 000007 | Demo Maple Court — interior painting | 2026-09-10T12:11:00Z | P-05 | P-05 | In review | null | null | 97750.06 | USD |
| 000006 | Demo Juniper House — windows and doors | 2026-09-10T11:34:00Z | P-05 | P-02 | Draft | null | null | 99125.13 | USD |
| 000005 | Demo Willow Court — roofing | 2026-09-10T10:57:00Z | P-05 | P-01 | Declined | null | null | 100500.20 | CAD |
| 000004 | Demo Cedar House — carpentry | 2026-09-09T16:30:00Z | P-05 | P-04 | Submitted | null | null | 101875.27 | USD |
| 000003 | Demo Birch Court — caulking and waterproofing | 2026-09-09T15:53:00Z | P-05 | P-05 | In review | null | null | 103250.34 | USD |
| 000002 | Demo Aspen House — tenant improvements | 2026-09-09T15:16:00Z | P-05 | P-02 | Draft | null | null | 104625.41 | CAD |
| 000001 | Demo Elm Court — renovation | 2026-09-09T00:00:00Z | P-05 | P-01 | Declined | null | null | 106000.48 | USD |

The null amount belongs to **000057**; the genuine **0.00** amount belongs to **000054**. They must not become the same display value. Multiple currencies remain separate; this fixture does not authorize a combined monetary KPI. Casey's five in-period-created wins and two older-created wins are explicitly defined in §5.4.

### 15.3 Additional test-fixture definitions

**Boundary packs are isolated**, not silently appended to the 64-row canonical report:

| Pack / record | Timestamp | Expected boundary result |
| --- | --- | --- |
| Monthly M-01 | 2026-07-31T23:59:59Z | Excluded from August |
| Monthly M-02 | 2026-08-01T00:00:00Z | Included in August |
| Monthly M-03 | 2026-08-31T23:59:59Z | Included in August |
| Monthly M-04 | 2026-09-01T00:00:00Z | Excluded from August |
| Seven-day W-01 | 2026-09-08T23:59:59Z | Excluded from 9–15 September |
| Seven-day W-02 | 2026-09-09T00:00:00Z | Included |
| Seven-day W-03 | 2026-09-15T23:59:59Z | Included |
| Seven-day W-04 | 2026-09-16T00:00:00Z | Excluded |

Each isolated pack returns **2 distinct bids** for its stated period. Duplicating M-02 as an additional joined source row still returns 2. Timezone conversion occurs using the configured reporting timezone; the UTC fixtures do not justify substituting the user's device zone. Keep accepted ranges immutable through retries across a date boundary.

**Cap packs:** deterministic report IDs `CAP-000001`–`CAP-005237`, all unique, all in the cap pack's August created-date range; ten typed columns; order Created at descending then Bid ID descending. Generate Created at for ascending source index j as `2026-08-01T00:00:00Z + (j−1) minutes`; this keeps all rows within August. Use title `Demo capped bid {ID}`, P-02 creator/P-04 owner, Submitted, null won fields, decimal `100.00`, USD. Sort then retain the first 5,000. The known-total variant returns 5,237; the unknown-total variant deliberately withholds that total while reporting more matches exist. The UI must not infer an exact count from knowledge of the test generator. Scalar known-total count remains 5,237 even though the snapshot is capped.

**Snapshot mutation:** after saving SNAP-A01, add one new authorized source bid with a new ID in its original reporting period. The next fresh question returns a new 65-row report; reopening ART-A01 remains 64. Do not mutate the persisted original snapshot. Label the new fixture report separately so screenshots do not contradict the 64-row baseline.

**No-data and failure packs:** FX-ZERO has a successful authorized query with no matches. FX-PARTIAL has a declared missing coverage window; it must not be represented as a complete successful 44-row whole-period report. Analytics unavailable, AI failure, report persistence failure and row-fetch failure are different injected causes and must reach their separately specified UI states. None may be substituted with synthetic success in an integrated run.

**Markdown rendering/security pack:** include headings, a paragraph, emphasis, a list, inline code, a fenced display-only code block and a valid link to a scoped in-message heading. Separately inject raw HTML/script-like content, an unsafe-link scheme, an unsolicited remote-image reference and a table cell containing instructions to change permissions. Expected result: no active execution, no unsolicited image request, no data/tool authorization change. An implementation may preserve safe visible literal text or sanitize unsafe nodes according to its documented renderer; there is no raw/HTML response mode. Never put real secrets into a malicious-content test.

### 15.4 Specification checks performed during preparation

The attached files' existence and hashes, six reference pixel dimensions, and the logo's outer geometry/embedded-raster structure were inspected. The primary fixture was checked programmatically for 64 unique IDs, stable descending order, ten declared fields, 50/14 page lengths, dates inside its period, Casey created 18, Morgan created 10, five in-period-created Casey wins plus two documented archived wins, and first-three-row preview agreement. The requirement registers were checked for complete FR-01–28, NFR-01–06, AC-01–22 and D-01–13 coverage.

These are document/source/fixture consistency checks only. They do **not** establish rendered appearance, actual screen dimensions, control behavior, browser accessibility, performance, server security, legal clearance, microphone behavior or live integration. All application acceptance criteria remain not run.

---

**End of CFI-DIC-SCREENS v1.0.0.** The working kit remains unchanged. The deliverable is `SCREEN_SPECIFICATIONS.md`; the recommended first render remains **SCR-04 / report-ready / 1440×900**.
