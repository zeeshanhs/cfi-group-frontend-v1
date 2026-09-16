# Web-development profile

Use for user-facing implementation and fixes: layouts, components, CSS/theme binding, navigation, visible state, responsive behavior, accessibility, animations and rendered content. Read the shared contract first. Backend-only work does not require a branding pass unless it affects the user-visible experience.

## Inspect before editing

Read the task's current requirements, implementation plan and any screen specification. Inspect the actual app architecture, package manager/lockfile, framework versions, existing components, font loading, theme entry point and test scripts. Inspect applicable repository instructions for touched paths. Read kit rules for the changed surface, relevant patterns and theme variables, asset records and actual visual references. Discover commands from the repository; do not assume `npm run lint` or any particular build script exists.

Reuse the planned direction and existing brand-conforming primitives. For significant new layout/content decisions, read the design profile and resolve them before implementation. Do not turn a styling correction into a full redesign. New images use the imagery profile; asset replacement alone still requires original/permission/variant checks.

## Bind the theme, do not fork it

`brand-kit/theme.css` owns exact reusable values. Import it through the project's supported CSS pipeline and map its semantic variables into the application/component system through a thin binding layer. Read actual token names; do not assume a Shadcn variable or a particular color-space representation. A CSS color value must not be blindly wrapped in `hsl(...)`. Preserve declared scope, cascade and supported theme selectors. Check all intended theme modes rather than assume the root declaration applies equally.

When tooling genuinely requires generated local values, document the generator/source and keep them derived, not hand-maintained. New screen-specific layout choices stay local. A screenshot color estimate, component-library default or stale task export must not replace the canonical token. Do not mutate kit CSS just to make an application test pass.

Font declaration does not guarantee font loading. Use the repository's authorized font mechanism where already available; do not introduce remote font/network dependencies without the task's permission. Do not package or share font binaries as task deliverables. Use a disclosed fallback when the required font cannot be used.

## Implement the actual experience

Preserve purposeful hierarchy, content density, imagery treatment, interaction expression and actual terminology—not just logo and accent color. Reuse components for consistency, but do not let a component library impose its aesthetic. Use semantic controls, visible focus, adequate contrast, keyboard interaction, meaningful feedback, deliberate loading/empty/error/success states, reduced-motion behavior and appropriate touch targets. Verify functionality rather than infer it from appearance.

Responsive transformations should follow the specification/kit and the task's information priority. Do not simply scale desktop pixels down. Inspect text wrapping, navigation, overflow, image crops, grids and tables at relevant target widths. Keep example entities, statuses, values, dates and navigation destinations consistent. Use synthetic data for demos and label simulated capabilities. Do not add fake live integrations, testimonials or client outcomes.

Use permitted original identity assets with suitable variants. Selectively place required assets in application delivery paths; do not expose the whole kit, evidence captures, internal guidance or source documents under `public/`. Inspect SVG/script and remote-dependency risks before embedding. Keep production forms, trackers, credentials and unrelated systems disconnected in a demo.

## Platform-specific execution

For an existing Next.js project, read `references/nextjs.md`. Otherwise follow the actual framework. Do not force a new technology or replace the project's build system merely to use the kit.

For an explicitly requested standalone HTML demo, prefer one offline-capable HTML file with inline CSS, synthetic data, small local JavaScript and permitted embedded assets; no build/server requirement, external scripts, runtime fetch or production form submission. This delivery choice does not replace a repository's normal Next.js implementation when that is the actual request. If a local asset bundle is necessary, provide it and clear opening instructions instead of calling an incomplete file self-contained.

## Verify with available tools

Run relevant existing tests/type checks/build checks. Render and inspect an early representative changed screen where browser tools are available, before repeating the pattern across a new multi-screen implementation. Compare hierarchy, spacing relationships, density, type, imagery, action emphasis and state to the selected brand rules/references—not marketing-page pixel similarity for a different task.

Test the main interaction and relevant keyboard/responsive states. Save concise visual evidence in the current task evidence directory when meaningful. Use the review profile for a broader review; small patches use its relevant checks without generating another report. At most a task-appropriate bounded repair loop; report unresolved issues honestly.

Do not call a build pass a visual pass or a screenshot a keyboard test. When browser execution is absent, say visual/interactive behavior remains unverified and provide a concrete check list. Final handoff covers changed outputs, brand basis/adaptations and checks performed versus unavailable.
