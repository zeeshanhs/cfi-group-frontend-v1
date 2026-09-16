# CFI Group — Reusable pattern recipes

Working kit derived from supplied screenshots and indexed public-site text; no confirmed CFI brand manual was supplied. Evidence IDs resolve in evidence/index.yaml. Exact reusable values live in theme.css.

## PAT-001 | Marketing header and photographic introduction

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: pattern
contexts: [web-marketing]
evidence: [EV-001, EV-002, EV-003, EV-004]
depends_on: [DES-002, DES-005, DES-006, IMG-001, IMG-002]
assets: []
```

**Use:** A marketing entrance or service/portfolio introduction, not a mandatory app shell.
**Anatomy / order:** Dark image field; identity region and concise navigation; topic heading, short supporting text, primary invitation. Homepage copy is left aligned; service/portfolio copy is centered. Use one version for the page’s purpose.
**Behavior:** Preserve the supplied open-navigation appearance. Prototype extension: disclosure can open by click and keyboard, closes with Escape or outside interaction, and exposes expanded state; destination labels follow the requirements. Do not invent working links.
**Responsive:** Collapse or reflow navigation when content requires it; put readable copy ahead of decorative imagery. No source mobile behavior is asserted.
**Assets / adaptation:** Cleared identity and photo only; otherwise use disclosed text identity and an intentional plain dark field. Titles remain live text, not a flattened screenshot.

## PAT-002 | Service and project media cards

```yaml cek-rule
origin: observed
authority: working
strength: default
area: pattern
contexts: [all-web]
evidence: [EV-001, EV-003, EV-006]
depends_on: [DES-003, DES-005, DES-006, DES-008]
assets: []
```

**Use:** Browsing services or image-led project references, when images are relevant and permitted.
**Anatomy / order:** Service variant: heading → red underlined action with arrow → photo. Project variant: photo → name → location → red project action. Keep each row’s image crop coherent; do not silently interchange the two information orders.
**Behavior:** Service-card hover adds the observed soft shadow. Prototype extension: one unambiguous link target and visible keyboard focus; no hover-only essential text. Noninteractive cards do not imply activation.
**Responsive:** Reduce the column count without shrinking labels below readable sizes. A carousel may become a static list; autoplay is not established.
**Assets / adaptation:** Photos need separate clearance. Without them, use a clearly labeled placeholder or a text-led variant; never substitute a screenshot as the production image.

## PAT-003 | Scope-filtered project browsing

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: pattern
contexts: [all-web]
evidence: [EV-003, EV-009]
depends_on: [PAT-002, EXP-004, DES-006]
assets: []
```

**Use:** A requirements-backed collection with meaningful work-scope categories.
**Anatomy / order:** Section heading → text filters with an All/reset option → aligned image-led results. Red distinguishes the selected filter without changing the entire surface.
**Behavior:** The screenshot establishes layout, not implementation. Select a simple single active filter for the prototype unless requirements say otherwise; show a result count and explicit no-results message only when supported by the demonstration data. Keyboard activation and a visible selected state are extensions. Do not invent project totals.
**Responsive:** Wrap filters or use an explicitly labeled disclosure when necessary; keep the current selection visible. Results reflow to fewer columns.
**Assets / adaptation:** Apply the project-card order; a text/list variant is appropriate for nonvisual objects. Scope names come from requirements or supplied sources, not speculation.

## PAT-004 | Task-sized forms and clear actions

```yaml cek-rule
origin: extended
authority: working
strength: default
area: pattern
contexts: [all-web]
evidence: [EV-001, EV-003, EV-005]
depends_on: [EXP-003, DES-004, DES-005, DES-006, DES-009]
assets: []
```

**Use:** A contact or task form required by the future system, with only necessary inputs.
**Anatomy / order:** Purpose and brief guidance → visible field labels and logically grouped inputs → primary action → local feedback. Marketing may place a white form on a dark closing band beside a property image. Operational forms need not use that composition.
**Behavior:** Preserve the primary-button hover appearance; add chosen focus, disabled, pending and success/error states. A local demo validates its fields and explicitly reports a simulated result; no email, consent collection or backend save is implied.
**Responsive:** Stack paired fields and optional image regions while preserving order.
**Adaptation:** Normalize the source form’s blue action to theme red. Do not copy its legal text or every source field into an unrelated application. Missing images may simply be omitted.

## PAT-005 | Evidence panels without manufactured social proof

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: pattern
contexts: [web-marketing]
evidence: [EV-001, EV-002, EV-003]
depends_on: [EXP-002, EXP-003, DES-002, DES-008]
assets: []
```

**Use:** Real, relevant supporting evidence on a marketing page; not mandatory decoration.
**Anatomy / order:** Concise section heading → a bounded charcoal evidence panel or real project reference → attribution/context → next action where appropriate. Photography may sit behind the band with restrained contrast.
**Behavior / states:** Source arrows suggest browsing controls, but their behavior was not inspected. Use a static panel by default; a prototype carousel must support explicit controls and coherent state. Never manufacture a testimonial to complete the layout.
**Responsive:** Stack evidence items and prioritize readable text over the backdrop.
**Assets / adaptation:** Reuse only supplied, cleared content. Omit unsupported quotes, stars and logos. The service screenshot’s repeated blocks are not instructions to duplicate content.

## PAT-006 | Compact disclosure for secondary information

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: pattern
contexts: [all-web]
evidence: [EV-002]
depends_on: [DES-003, DES-006, DES-009]
assets: []
```

**Use:** Secondary explanations or frequently asked questions, when actual content warrants disclosure.
**Anatomy / order:** Clear section heading; stacked pale/white rows; question or label; red disclosure indicator; answer in the expanded region. Keep the label visible in both states.
**Behavior:** The service reference includes expanded/collapsed appearances. Prototype extension: semantic button, click/keyboard activation, expanded-state announcement and stable focus; choose one-at-a-time expansion only when the content benefits. No live source behavior is claimed.
**Responsive:** Full-width stacked rows with readable answers. Do not shrink long labels into a navigation-sized line.
**Adaptation:** This is not a requirement to add FAQs or hide primary task information. Use no imagery unless the answer genuinely depends on it.
