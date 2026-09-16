<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CFI Group frontend repository guide

## Project purpose

This repository is the frontend for a CFI Group web experience. It is currently a small scaffold, so implement the requested product deliberately rather than treating the starter page or starter README as an established architecture.

The visual and editorial source of truth is the working kit in `brand-kit/`:

- `brand-kit/experience.md`: audience, voice, terminology, and truthfulness rules.
- `brand-kit/design.md`: visual system, responsive guidance, imagery, and interaction rules.
- `brand-kit/patterns.md`: reusable page and component patterns.
- `brand-kit/theme.css`: approved working design tokens.
- `brand-kit/assets/index.yaml`: asset provenance and reuse restrictions.
- `brand-kit/evidence/`: reference material only; never ship screenshots as production assets.

The kit is derived guidance, not a confirmed corporate brand manual. Preserve its distinctions between observed, inferred, and extended decisions. Do not present an approximation as official CFI identity.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4 through `@tailwindcss/postcss`
- ESLint 9 with Next.js Core Web Vitals and TypeScript rules
- npm with the committed `package-lock.json`

Use npm unless the user explicitly requests another package manager. Do not replace or regenerate the lockfile unnecessarily.

## Working rules

1. Inspect the relevant implementation, brand-kit files, and local Next.js documentation before editing.
2. Keep changes scoped to the request. Do not introduce a component library, state library, CMS, test runner, or other dependency without a concrete need.
3. Preserve unrelated user changes in the working tree.
4. Prefer the smallest coherent implementation that leaves the affected area complete, responsive, and accessible.
5. Do not invent integrations, customer records, testimonials, project metrics, legal copy, or real operational behavior. Clearly label demo data and simulated submissions.

## Local reporting data

- The repository-local SQLite snapshot is `_PROJECT/data/reporting/cfi_reporting.sqlite`; start with `_PROJECT/data/reporting/README.md` for build, test, refresh, and query instructions.
- Consult `_PROJECT/data/reporting/semantic_layer.yaml` before choosing tables, date fields, relationships, or measures for SQL and report tasks.
- The loader is `_PROJECT/scripts/build_reporting_database.py`, its focused tests are in `_PROJECT/tests/test_reporting_database.py`, and the supplied source extracts are under `_PROJECT/tasks/BOOT-000/input/`.
- This data is a limited static extract. Downstream reports must disclose applicable date coverage and semantic limitations rather than presenting it as live or exhaustive.

## Next.js and React conventions

- Use the App Router under `app/`; do not add a Pages Router alongside it.
- Server Components are the default. Add `"use client"` only at the narrowest interactive boundary that needs browser APIs, event handlers, or client state.
- Keep page and layout files focused on composition. Extract a component when it is reused or when doing so makes a substantial section easier to understand.
- Colocate route-specific components and data with their route. Put genuinely shared UI in `components/` and shared non-React utilities in `lib/` when those directories become necessary.
- Use `next/link` for internal navigation, `next/image` for suitable images, and the Next.js Metadata API for page metadata.
- Keep server-only data and secrets out of Client Components. Validate untrusted input at server boundaries.
- Follow the `@/*` import alias for cross-directory imports; use relative imports for nearby colocated modules.
- Before using or changing a Next.js API, read its current guide in `node_modules/next/dist/docs/`. Do not rely on behavior remembered from older Next.js versions.

## TypeScript and code style

- Keep strict typing. Avoid `any`; use explicit domain types and narrow `unknown` values.
- Prefer readable, named components and functions over large anonymous render blocks.
- Keep data transformations outside JSX when they obscure the rendered structure.
- Do not add memoization, effects, or client state unless the behavior requires them.
- Follow the existing formatting: double quotes, semicolons, and trailing commas where supported.
- Resolve lint and type errors properly; do not suppress rules or use unsafe assertions to make checks pass.

## Brand and UI implementation

- Read the applicable rules in `brand-kit/` before any visible UI change.
- Build recognition from the kit's restrained red, white/pale-gray, charcoal, sans-serif hierarchy, straightforward geometry, and practical property-focused voice.
- Reuse the semantic roles in `brand-kit/theme.css`. If tokens need to be exposed through Tailwind or `app/globals.css`, preserve their names and meaning instead of scattering one-off color values.
- Treat dark bands as local inverse surfaces, not proof of a site-wide dark theme.
- Use red for primary actions, selected navigation, and restrained accents—not as decoration or as an unlabeled error/status color.
- Prefer square or near-square controls and cards. Avoid generic rounded, glassy, gradient-heavy, or luxury styling that conflicts with the kit.
- Use the matching recipe from `brand-kit/patterns.md` when implementing headers, cards, project filters, forms, evidence panels, or disclosures.
- Keep marketing content direct and concrete: property need, relevant scope, evidence, and next action. Use literal action labels in operational UI.

### Assets and imagery

- Check `brand-kit/assets/index.yaml` before reusing any identity, image, icon, or graphic.
- The screenshots in `brand-kit/evidence/captures/` are inspection references only. Do not crop, trace, extract, or publish their logos, photographs, icons, or decorative graphics.
- Until an authorized logo is supplied, use a disclosed plain-text `CFI Group` fallback; do not recreate the ring mark.
- Use only cleared originals or clearly labeled placeholders/illustrations. Generated imagery must not be described as a completed CFI project.
- Keep headings and calls to action as live text, never flattened into images.

## Accessibility and responsive behavior

- Use semantic HTML first. Interactive elements must work with keyboard and touch, expose their state, and have visible focus styles.
- Every form control needs a visible label; validation, pending, success, and error states need meaningful text.
- Provide useful alternative text for informative images and empty alternative text for decorative images.
- Do not depend on hover, color, animation, or imagery alone to communicate meaning.
- Respect `prefers-reduced-motion` and avoid autoplay, parallax, or decorative motion without a functional reason.
- Design from content rather than screenshot pixel dimensions. Verify narrow mobile, tablet, and desktop layouts; preserve reading order and avoid horizontal overflow.
- Aim for at least the kit's 44px control height and maintain readable contrast on both light and inverse surfaces.

## Styling

- Keep the Tailwind 4 import in `app/globals.css` unless the styling strategy is intentionally changed.
- Prefer utility classes for component layout and state styling; use global CSS for tokens, resets, base elements, and truly shared patterns.
- Do not add a Tailwind v3 configuration pattern to this Tailwind 4 project without verifying it against the installed documentation.
- Keep CSS values tied to brand tokens where a semantic role exists. Add a new token only when the value is repeated or represents a stable design decision.

## Validation

Run the checks appropriate to the change before handing it off:

```bash
npm run lint
npm run build
```

There is currently no automated test script. Do not claim tests passed when none exist. For behavior with meaningful logic, add focused tests only after selecting and documenting an appropriate test setup.

For visible changes, also inspect the rendered page at representative mobile and desktop widths and exercise hover, focus, keyboard, loading, empty, success, and error states that the change introduces. A production build is required for changes involving routes, metadata, Server/Client Component boundaries, or data fetching.

## Completion standard

A change is complete when it satisfies the request, follows the relevant brand-kit rules, contains no known accessibility or responsive regressions, and passes the available checks. In the handoff, summarize what changed, identify validation performed, and call out any remaining dependency on missing copy, assets, credentials, or backend services.

<!-- BRAND-KIT-INTEGRATION:START -->

## Brand-kit routing

This repository represents one brand. `/brand-kit/` means the `brand-kit` directory at the repository root, not an operating-system path. It is the reusable source for brand intent, visual design, imagery, patterns, theme values and asset use. Do not substitute a chat export, another brand, a template library or remembered preferences for this kit.

**Before any user-facing design, imagery, page/screen, frontend, visible-copy, styling, responsive, motion, accessibility or visual-review work:** read and apply `/.agents/skills/brand-experience/SKILL.md`. Do this even when the request does not mention the brand and even when implicit skill selection did not trigger. Resolve paths from the repository root, not the current subdirectory. For purely internal backend/tooling work with no effect on user-facing experience, skip this route.

Use its shared contract and only the applicable profiles. Design/specification → `references/design.md`; photography/illustration/icons/image generation or editing → `references/imagery.md`; implementation or UI behavior changes → `references/web-development.md`; assessment → `references/review.md`. A task can use several profiles, sequentially in the same session. These are instructions, not additional agents.

Read the current `brand-kit/kit.yaml`; select the relevant guidance and complete applicable required/recognition rules with their dependencies. Use `experience.md` for intent and language, `design.md` for visual expression and image families, `patterns.md` for contextual recipes, `theme.css` for exact values, and the two indexes for actual assets and evidence. Inspect relevant visual references when available; a filename is not visual inspection. Do not start a substitute brand discovery for an ordinary implementation task.

Keep `/brand-kit/` unchanged unless the task explicitly requests a kit change. Keep contextual adaptations in the existing task plan or screen specification, not another canonical kit. Preserve the repository's task stages, approval boundaries, safety rules and test conventions; this integration grants no additional execution or publication permission. Routine assumptions should be reversible. Missing mandatory identity, rights or design evidence must be disclosed; proceed only with supported work or a clearly labeled fallback.

Before claiming completion, identify the actual kit rules/references used, significant adaptations, and visual/functional checks performed or not performed in the existing task handoff. Do not invent tool access, generated images, browser checks or client approval. Code review of user-facing changes must check brand application as well as correctness.

Canonical skill instructions live at `s/skills/brand-experience/`. `.agents/skills/brand-experience` is only the Codex discovery link or forwarding adapter; never maintain another copy of the skill body there. A discovered `$brand-experience` invocation follows the same contract.

<!-- BRAND-KIT-INTEGRATION:END -->
