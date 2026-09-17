# CFIF-006 — Implementation plan

## Outcome

Finish the redesigned chat experience by proving strict conversation-pane containment and full-height canvas behavior, then complete a final integrated accessibility/responsive/regression pass.

## Phase 0 — Establish the integrated baseline

1. Read all authority sources and inspect both prerequisite implementations, task files, and stored evidence/check notes.
2. Inspect the current wide/narrow report layout, composer containing block, overlay measurement, prompt-browser positioning, and focus-restoration code.
3. Run tests, lint, and build before edits; record pre-existing failures.
4. Capture one 1440 × 900 report-open baseline to make overlay/canvas defects concrete.

## Phase 1 — Separate chat and canvas vertical systems

1. Ensure the main workspace grid gives chat and canvas independent full-height cells.
2. Keep the canvas grid rows owned solely by canvas header, scroll body, and footer.
3. Remove any composer-derived padding, row, inset, or CSS variable from the canvas column.
4. Make the conversation pane the positioning and clipping context for all chat overlays.
5. Preserve the existing report route/query/page state and server/API flow.

**Exit:** opening the report changes horizontal composition but not canvas vertical extent.

## Phase 2 — Implement constrained composer behavior

1. Use the shared composer’s constrained variant rather than duplicating markup/state.
2. Apply container-aware rules based on the chat pane, not the viewport.
3. Keep the visible label and Record target; collapse Send to icon-only only when required.
4. Verify six-line growth and transcript bottom clearance inside the constrained pane.
5. Keep the new-answer control above the local fade.

**Exit:** the 416 px chat rail remains usable without reducing canvas height.

## Phase 3 — Enforce containment for every overlay

1. Test pill, fade, status, shadow, tooltips, focus rings, prompt browser, and new-answer control separately.
2. Use safe inline insets so focus outlines are visible before clipping.
3. Anchor the prompt browser above the constrained composer and cap its width to the chat pane.
4. Close/reposition overlays safely during report open/close and breakpoint transitions.
5. Confirm canvas pointer, wheel, keyboard, and table interactions are not intercepted by transparent chat overlay regions.

**Exit:** visual and hit-testing containment hold across ready, focused, expanded, prompt-open, and error states.

## Phase 4 — Verify narrow report replacement and restoration

1. At tablet/mobile widths, confirm the conversation and composer are not merely visually hidden but removed from focus and hit testing.
2. Preserve sidebar/drawer behavior and Back to conversation.
3. Verify closing/back restores draft, scroll anchor, report opener focus, and remembered page.
4. Check mobile visual viewport and orientation changes.

**Exit:** report-only layouts expose no background composer and restore state predictably.

## Phase 5 — Integrated correction pass

Run the proposal acceptance matrix across:

- new chat, starter prompts, and first send;
- prompt API success/failure, desktop popover, mobile sheet, filters, selection, confirmation, and focus restoration;
- composer one-line/six-line/overflow, processing, voice, review, error, and new-answer;
- canvas loading/ready/empty/error/page states; and
- desktop/tablet/mobile navigation, account menu, drawer, and report return.

Correct only reproducible in-scope defects. Do not use this phase for unrelated refactors or product additions.

## Phase 6 — Final verification and evidence

1. Run focused tests plus the full existing suite.
2. Run `npm run lint` and `npm run build`.
3. Inspect at minimum 390 × 844, 768 × 1024, 1280 × 720, and 1440 × 900; include 320/375 px overflow checks.
4. Exercise keyboard-only flows, visible focus, Escape, modal/drawer traps, result announcements, timer announcements, reduced motion, and report focus restoration.
5. Save final screenshots and concise check notes under `_PROJECT/tasks/CFIF-006/evidence/`.
6. Record checks actually performed and distinguish automated, rendered, and interaction verification.

## Planned file-area ownership

Expected primary ownership:

- chat/report layout and responsive CSS;
- minimal conversation/report component coordination needed for containment/restoration;
- focused regression tests for any changed pure behavior;
- correction of in-scope defects in CFIF-004/005 surfaces; and
- `_PROJECT/tasks/CFIF-006/evidence/`.

Do not change API/domain/database contracts without a demonstrated redesign regression that cannot be solved in the UI layer.

## Copy-ready Codex session request

Implement CFIF-006 completely after CFIF-004 and CFIF-005. Read `_PROJECT/tasks/CFIF-006/task_request.md`, `implementation_plan.md`, the revision 2.0 proposal, both prerequisite handoffs, CFIF-003’s report/canvas contracts, repository instructions, brand-kit rules, and installed Next.js documentation. Make the canvas full-height and strictly contain every chat overlay inside the conversation pane, preserve narrow report replacement and state restoration, then run the complete integrated accessibility/responsive/regression pass. Do not add new prompt capabilities, report features, dependencies, or backend changes unless required to fix a proven in-scope regression. Report automated, rendered, and interaction checks separately and save only actual evidence.
