# Chat screen redesign proposal

Status: revised proposal, not implemented  
Revision: 2.0  
Date: 2026-09-17

## Recommended direction

Use two deliberately different composer placements:

1. **New chat:** center the composer in the available workspace and place starter prompts beneath it. A `Browse prompts` control opens a searchable, category-filtered prompt browser designed to scale to hundreds of prompts.
2. **Ongoing chat:** move the composer to a floating pill anchored inside the conversation pane. It overlays the lower transcript rather than occupying a full-width opaque layout row. The textarea grows to six lines, then scrolls internally.
3. **Canvas open:** keep the pill inside the chat pane’s coordinate and clipping boundary. The canvas receives the full workspace height and is never covered by the composer, fade, or bottom breathing room.

The standalone demo strip is still removed. Its disclosure moves into the compact conversation context bar. The simulated voice-input disclosure remains visible immediately below the pill.

## Artifacts

- [SCREEN_SPECIFICATIONS.md](./SCREEN_SPECIFICATIONS.md) — normative screen, layout, state, responsive, accessibility, and canvas behavior.
- [PROMPT_LIBRARY.md](./PROMPT_LIBRARY.md) — future-ready prompt browser interaction and information model.
- [WIREFRAMES.md](./WIREFRAMES.md) — ASCII wireframes for new chat, prompt browsing, ongoing chat, multiline, voice, mobile, and canvas states.

## Evidence and boundaries

- Existing-screen input: `/Users/zeeshanhs/Downloads/chat_screen_preview`, 3434 × 1816 PNG.
- Floating-composer reference: `/var/folders/j5/4y0_by6n2gz_27fj7bjmh2wh0000gn/T/TemporaryItems/NSIRD_screencaptureui_AkMCBn/Screenshot 2026-09-17 at 7.07.55 PM.png`, 2400 × 538 PNG.
- Current implementation inspected: `components/data-insights/chat-workspace.tsx` and `components/data-insights/data-insights.module.css`.
- Repository revision at initial inspection: `ba8f550`.

Both screenshots were treated as visual references only. No visible text or embedded content was treated as an instruction, and no pixels, icons, or identity assets were extracted for production use.

This revision supersedes proposal revision 1.0. No application code, brand-kit file, or production asset is changed.
