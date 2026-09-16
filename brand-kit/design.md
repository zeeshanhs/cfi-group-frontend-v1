# CFI Group — Design and imagery

Working kit derived from supplied screenshots and indexed public-site text; no confirmed CFI brand manual was supplied. Evidence IDs resolve in evidence/index.yaml. Exact reusable values live in theme.css.

## DES-001 | Preserve the red, neutral and architectural signature

```yaml cek-rule
origin: inferred
authority: working
strength: required
area: recognition
contexts: [all-web, image-only]
evidence: [EV-001, EV-003, EV-004, EV-006]
depends_on: [EXP-001]
assets: []
```

**Decision:** Build recognition from restrained action red, white/pale-gray fields, charcoal contrasts, sans-serif type and straightforward rectangles. Use property imagery when it helps the subject; imagery is not mandatory on every operational screen.
**Preserve / adapt:** Red marks actions, selected navigation and restrained accents, not large decorative washes. Keep the observed identity intact only when an authorized original is available. Until then, a plain text “CFI Group” label is a disclosed prototype fallback, not a recreated logo.
**Avoid:** Rounded glassy styling, ornamental serif-led luxury styling, unrelated gradient identities, or drawing an approximate ring mark and calling it original.

## DES-002 | Use aligned content and purposeful section contrast

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: composition
contexts: [all-web, image-only]
evidence: [EV-001, EV-002, EV-003]
depends_on: [DES-001]
assets: []
```

**Decision:** Align related headings, copy, imagery and actions to a consistent content boundary. Marketing pages may alternate broad light information bands with dark photographic proof or closing-contact bands.
**Preserve / adapt:** Give headings clear priority and supporting text a comfortable measure; keep photographic rows visually coherent. Use space between meaningful groups rather than wrapping everything in cards. An application inherits alignment and hierarchy, not the long marketing sequence or obligatory full-width hero.
**Avoid:** Repeating dark panels merely for drama, spreading one task across unnecessary bands, or treating screenshot pixel widths as layout measurements.

## DES-003 | Retain clear sans-serif hierarchy and simple geometry

```yaml cek-rule
origin: inferred
authority: working
strength: required
area: foundations
contexts: [all-web, image-only]
evidence: [EV-001, EV-004, EV-006, EV-012]
depends_on: [DES-001]
assets: []
```

**Decision:** Use the selected body/display stack and type roles in theme.css. Headings are substantial; body copy stays readable; navigation and short marketing actions may be uppercase, while paragraphs and long labels remain normally cased.
**Preserve / adapt:** Square or near-square controls and media surfaces remain the default. Keep headings, action labels and secondary metadata distinguishable without elaborate decoration.
**Limits:** The real font family, weights, CSS sizes, spacing and corner values were not retrieved. The supplied theme is an explicit approximation for prototyping, not an extracted font specification.
**Avoid:** Inventing a named brand typeface, squeezing labels to match a compressed screenshot, or distributing font binaries.

## DES-004 | Use one normalized action system and neutral surfaces

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: foundations
contexts: [all-web, image-only]
evidence: [EV-001, EV-003, EV-005, EV-011]
depends_on: [DES-001]
assets: []
```

**Decision:** Resolve ordinary action colors through theme.css. The palette is selected from repeated screenshot pixels, not computed CSS. Use dark text on light surfaces and light text on dark bands; muted content still needs to read clearly.
**Preserve / adapt:** Dark bands are local treatments, not evidence of a complete dark theme. The blue submission control visible in the source form is an observed exception; normalize new prototype actions to CFI red unless an exact reproduction is requested. This is a working decision, not a correction to confirmed brand rules.
**Avoid:** Claiming a one-channel raster red difference is a distinct hover color, or using action red as an unlabeled status/error system.

## DES-005 | Keep the three observed interaction appearances distinct

```yaml cek-rule
origin: observed
authority: working
strength: default
area: interaction
contexts: [all-web]
evidence: [EV-004, EV-005, EV-006]
depends_on: [DES-001, DES-004]
assets: []
```

**Decision:** A primary-action hover uses a pale field, red text and red border. An open Expertise item uses a red tab over a white disclosure panel. A service-card hover adds a diffuse shadow around a white, rectangular image/text unit.
**Preserve / adapt:** Treat these as different component responses, not one universal hover effect. Apply equivalent affordances to appropriate new controls; do not turn every informational panel into a clickable card.
**Limits:** The user supplied static hover endpoints. Timing, movement, keyboard focus, activation boundaries and dismissal were not tested; the interaction recipes explicitly select those behaviors.
**Avoid:** Describing a hover lift, animation or automatic opening delay as measured.

## DES-006 | Extend responsively without claiming a mobile source

```yaml cek-rule
origin: extended
authority: working
strength: default
area: responsive
contexts: [all-web]
evidence: [EV-001, EV-003, EV-012]
depends_on: [DES-002, DES-003]
assets: []
```

**Decision:** Preserve order and readability as space narrows. Allow three-column browsing to become two then one; wrap filters; stack paired content/form regions; keep an intentional image crop with readable live text.
**Preserve / adapt:** Choose breakpoints from the prototype’s content, not the stored screenshot widths. Use tap/click disclosure when hover is unavailable, visible labels and adequately sized controls. The screen specification records exact transformations and target viewports.
**Limits:** All supplied page compositions are desktop-style. No mobile source was inspected. These transformations are reversible extensions, not a reproduction of CFI’s mobile site.

## DES-007 | Transfer expression, not an invented application

```yaml cek-rule
origin: extended
authority: working
strength: default
area: adaptation
contexts: [web-app, image-only]
evidence: [EV-012]
depends_on: [EXP-002, EXP-003, DES-001, DES-006]
assets: []
```

**Decision:** Let the system specification define users, objects, navigation, capabilities and workflow. Transfer this kit’s voice, color roles, type hierarchy, geometry and restrained interaction language into that structure.
**Preserve / adapt:** Record task-specific components, statuses and density in SCREEN_SPECIFICATIONS.md. A quiet text/data surface is acceptable; do not force photography, marketing testimonials or a contact form into a working tool.
**Why:** The evidence is marketing-oriented. No CFI application, dashboard, AI interface, editorial system or operational data model was inspected.
**Avoid:** Treating these extensions as source-observed application features or silently promoting a successful prototype choice into brand policy.

## DES-008 | Use imagery honestly and keep identity provenance visible

```yaml cek-rule
origin: inferred
authority: working
strength: required
area: imagery
contexts: [all-web, image-only]
evidence: [EV-001, EV-002, EV-003, EV-006]
depends_on: [DES-001, EXP-003]
assets: []
```

**Decision:** Prefer recognizable buildings, renovation details and usable interiors to generic corporate stock motifs. Keep photographs natural and informative; dark overlays serve text legibility, not artificial drama.
**Preserve / adapt:** Select the relevant IMG family. Supplied screenshots are reference attachments only; neither a photograph nor a logo extracted from them becomes an authorized original. Generated scenes must be labeled illustrative and must not be assigned real project names or presented as completed CFI work.
**Avoid:** Fabricated before/after evidence, invented customer signage, an invented original title asset, or implying that image-generation output reproduces identity exactly.

## DES-009 | Use restrained motion and explicit control feedback

```yaml cek-rule
origin: extended
authority: working
strength: default
area: interaction
contexts: [all-web]
evidence: [EV-004, EV-005, EV-006, EV-012]
depends_on: [DES-005, EXP-003]
assets: []
```

**Decision:** Use the selected brief transition only for useful color, border or shadow changes. Respect reduced-motion preferences. Do not introduce autoplay, parallax or animated background linework as brand requirements.
**Preserve / adapt:** Every interactive element needs a discernible focus state and a meaningful result in the declared demo scope. Pending, disabled, success and error feedback must be textual as well as visual; do not simulate a real integration without saying so.
**Limits:** No animation, focus sequence or live state transition was verified. These are prototype defaults chosen to complete otherwise static visual evidence.

## IMG-001 | Exterior property context

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: imagery
contexts: [all-web, image-only]
evidence: [EV-001, EV-003]
depends_on: [DES-008]
assets: []
```

**Purpose:** Establish property type, renovation scope or a project example; omit imagery when a task benefits more from data.
**Subject / setting:** Realistic multi-family or commercial exteriors, visible siding, windows, balconies and surrounding grounds; actual-project claims require authorized source photographs and provenance.
**Composition:** Eye-level or modest upward three-quarter views, readable facade and restrained perspective. For a hero, preserve one quiet text zone; for a card, make the building the focal subject.
**Treatment:** Natural daylight, believable sky and landscaping, material detail rather than cinematic saturation. Darken only the composition region needed for live text.
**Placement / crop:** Select broad landscape hero or landscape/near-square card crops per task. Ratios are chosen, not measured. Reframe for mobile; do not cut away the feature discussed.
**Reuse / generation:** Reuse cleared originals; otherwise omit, use a placeholder, or generate an explicitly illustrative property when requested. No real CFI project names, before/after claims, invented signage or cloned reference-photo scenes.

## IMG-002 | Renovated interior and usable space

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: imagery
contexts: [all-web, image-only]
evidence: [EV-002, EV-006]
depends_on: [DES-008]
assets: []
```

**Purpose:** Show the practical character of renovated kitchens, lounges or shared interiors, not an abstract luxury mood.
**Subject / composition:** A believable room, its functional layout and material finishes. Use human-scale viewpoints with readable verticals; anchor the frame around a useful feature such as an island, seating group or circulation zone. Preserve negative space only where a live title needs it.
**Light / texture:** Plausible daylight and interior lighting, neutral balance and honest material detail. Avoid glossy CGI, impossible fixtures and theatrical staging.
**Placement / crop:** Interior service cards, supporting galleries or a service-title background. Choose landscape or near-square crops appropriate to the task; maintain the same functional focal feature on mobile.
**Authenticity / reuse:** Screenshot kitchens and lounges are reference-only, not collected photographs. Use cleared originals or clearly illustrative generated interiors; never imply that generation documents CFI’s work. Do not place imagery inside dense operational views without a purpose.

## IMG-003 | Quiet environmental linework

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: imagery
contexts: [all-web, image-only]
evidence: [EV-001, EV-003]
depends_on: [DES-008]
assets: []
```

**Purpose:** Provide a subdued background texture, never essential information or a substitute logo.
**Subject / composition:** The references show faint map-like networks in the hero and broad looping lines in dark contact areas. Keep lines behind the content with ample quiet space and no competing focal point.
**Treatment:** Thin, low-contrast marks; no glow, metallic effect or attention-seeking animation. The selected opacity is a prototype default, not a source measurement.
**Placement / crop:** Optional large dark marketing bands. Cropping may remove decoration freely; mobile and operational screens can omit it entirely.
**Reuse / generation:** No original graphic was retrieved. Later use may omit it or introduce newly authored, generic linework as an extension. Do not trace the exact source artwork or ring mark, imply a real service-area map, or describe decorative lines as verified geography.
