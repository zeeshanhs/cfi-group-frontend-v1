---
name: brand-experience
description: Apply this repository's /brand-kit/ to visual design, screen specifications, images, photography, icons, frontend implementation, responsive UI, visible copy, styling and design reviews, including fixes that affect user experience. Use for existing-brand production work even when the user does not say on-brand. Not for backend-only work, general research or reconstructing a brand kit from scratch.
---

# Brand experience — repository consumption skill

**Purpose:** Make the existing brand kit operational for ordinary design and development tasks. One skill, focused profiles, one agent. Do not replace the user's task workflow with a new pipeline.

## First actions

1. Resolve the repository root; read applicable repository/task instructions and identify the requested phase (plan, specify, produce, edit or review). Paths beginning `/` below are repository-root-relative. Do not depend on the session starting at root.
2. Read `/.agent/skills/brand-experience/references/shared-contract.md`. Read the actual `/brand-kit/kit.yaml`, not a summary remembered from another session. Check the brand, file locations, coverage, recognition IDs, constraints and known gaps.
3. Choose the needed profiles below. Read each selected file **before the corresponding work**. A profile is a local instruction document, not a tool call or subagent. If a prior profile was already read and remains in context, reuse it; after compaction or material source changes, reopen the relevant files.
4. Read the selected brand rules in full, follow dependencies and inspect actual reference/asset files as required by the shared contract. Only then make visual choices, generate images or implement user-facing changes.

## Profile selection

| Requested work | Read | Scope control |
|---|---|---|
| Direction, layout, page/screen plan, interface wording, new multi-screen flow | `references/design.md` | New decisions need specification; a small fix does not need a whole-system document. |
| Select, brief, generate, edit or adapt photography, illustrations, icons, diagrams, covers or hero imagery | `references/imagery.md` | Includes reuse/omit decisions and actual file/permission checks. |
| Build, restyle, fix or review code affecting UI appearance, behavior, responsiveness or accessibility | `references/web-development.md` | Read design profile only to resolve new design decisions, not to redesign approved screens. |
| Assess existing visuals, screenshot differences, regressions or implementation fidelity | `references/review.md` | Review-only means findings, not unsolicited edits. Add web profile for code assessment. |
| Explicitly establish, refresh or export the reusable kit itself | `references/kit-lifecycle.md` | Hand off to the existing authoring framework when present; this production skill does not invent a new schema. |

Read paths relative to this skill's **canonical repository location**, not the discovery adapter. For a full webpage with new imagery: design → imagery → web implementation → task-sized review. For a button fix: shared contract → web → relevant review checks. For a photograph: shared contract → imagery. A general inquiry about backend logic needs none of these.

## Execution contract

Use the requested technology and actual repository conventions. In an existing Next.js project, read `references/nextjs.md` during web work. Do not introduce Next.js or Shadcn merely because a profile mentions them. Brand design and product functionality have different owners; resolve their application in the existing task artifacts.

Use existing `implementation_plan.md` or the existing screen-specification document. Recognize both `SCREEN_SPECIFICATIONS.md` and `screen-specifications.md`; do not create a duplicate because the spelling differs. A short task may record its brand basis in the working plan and final handoff with no new file. Templates in `templates/` are optional structures for genuinely needed outputs, not mandatory paperwork.

Expose a compact, factual brand basis: the kit identity, rule IDs or exact sections read, important visual anchors, adaptations and verification scope. This is an explanation of source application, not private chain of thought or a self-certified proof of compliance. Reuse any existing task provenance record rather than adding a parallel ledger.

Image generation and browser execution depend on tools actually present. The skill does not install them or authorize external service use. Follow the host's real tool contracts, including any restrictions on messages after image generation. If tools are missing, deliver the supported portion and accurately label what was not generated or inspected.

## Completion

Check the requested scope; relevant recognition and required rules; image provenance and identity; repeated content and component consistency; responsive/interactive behavior when applicable; and output existence. Record checks actually run. Do not claim a visual pass from a lint pass. Stop after a bounded correction loop appropriate to the task; do not introduce an approval ceremony or silently ignore unresolved defects.
