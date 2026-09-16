# Review profile

Use for design critique, visual QA, code-review brand checks, screenshot comparisons and regression investigation. Read the shared contract. For code-level review, also use the web-development profile. Review-only tasks must not change code or rewrite the kit without authorization.

Establish the review target, task intent, screen/state/viewport, relevant kit rules and evidence, and available inspection level. Compare the target to its own intended context. A project dashboard is not required to look pixel-identical to the source marketing homepage. A screenshot can show a state but not establish how a control behaves.

Check these dimensions separately:

| Dimension | What to inspect |
|---|---|
| Brand fidelity | Recognition, composition, hierarchy, density, typography roles, surface/action emphasis, imagery and voice. |
| Task fitness | Main user outcome, scope, navigation and content order; purposeful adaptation rather than copied marketing structure. |
| Asset truth | Actual logo/mark variants, provenance and use scope; no invented client claims, improper reference reuse or false originals. |
| Functional/accessible behavior | Actual actions/states, keyboard/focus, responsive transformations, contrast and motion when inspectable. |
| Source/implementation integrity | Theme source not forked, no silent kit changes, no guidance/captures leaked in public assets, coherent repeated data/components. |
| Verification honesty | Actual inspected files, rendered states, tools, commands and limits. |

For every material issue, give a concrete location/state, actual or expected behavior, applicable rule ID/section, user impact and a proportionate proposed correction. Identify subjective task-local suggestions as suggestions; do not present them as mandatory client rules. Prioritize blockers and recognition/user-flow failures over decorative preferences. A score or “looks on-brand” sentence is not evidence.

If requested to fix, apply the appropriate profile, rerun affected checks and record the results. If only static inspection was possible, list rendered/interactive checks not performed. Keep findings in the existing review/PR handoff; no additional approval stage or mandatory new review file.
