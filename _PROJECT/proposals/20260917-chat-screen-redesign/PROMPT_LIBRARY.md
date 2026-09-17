# Prompt browser — supporting specification

**Status:** Future-ready interaction specification  
**Relationship:** Supporting artifact for `SCREEN_SPECIFICATIONS.md` revision 2.0

## Purpose

Let users discover a useful question without turning the new-chat screen into a long catalog. The browser must work with a handful of prompts now and remain usable with hundreds later.

This is an interface and content-model proposal. It does not claim the current prototype supports every example category or prompt.

## Entry points

- New chat: visible `Browse prompts` control inside the centered composer.
- Ongoing chat: optional icon-only prompt-library control inside the floating pill.
- Both entry points open the same prompt data and preserve any existing draft until a prompt is selected.

## Desktop presentation

- Anchored, nonmodal popover below the new-chat composer or above the ongoing bottom composer, depending on available space.
- Width: up to 680 px.
- Height: content-driven to 440 px; results scroll after that.
- Opaque white surface, border, restrained shadow, 0–4 px corner radius. The browser itself follows the brand’s straighter geometry even though its trigger sits inside a rounded composer.
- Does not obscure the composer’s textarea or Send control.

## Mobile presentation

- Modal bottom sheet, maximum 85dvh.
- Fixed heading, Close, Search, and category row.
- Independently scrolling result list.
- Sheet stays above the software keyboard when Search is focused.

## Anatomy

1. Header: `Browse prompts` and Close.
2. Search input: label and placeholder `Search prompts`.
3. Horizontally scrollable single-select categories.
4. Results summary: `12 prompts` or `No prompts found`.
5. Result list.
6. Empty-state recovery action `Clear filters`.

## Category taxonomy

Initial proposed categories:

- All
- Bids
- Account managers
- Jobs
- Monthly reports
- Weekly reports

Categories are metadata, not hard-coded navigation. A prompt may have one primary category and optional searchable tags. Keep category labels plural and user-facing. Do not create a category until at least one vetted prompt belongs to it.

## Prompt record

Each prompt record should support:

| Field | Purpose |
|---|---|
| `id` | Stable internal identifier. |
| `title` | Short result label, ideally under 60 characters. |
| `promptText` | Exact text inserted into the composer. |
| `description` | One-line explanation of the result or scope. |
| `category` | Primary category identifier. |
| `tags` | Search synonyms such as `weekly`, `owner`, or `created`. |
| `availability` | `supported`, `preview`, or `unavailable`. |
| `sortOrder` | Curated ordering within a category. |

The interface must not treat `preview` as executable. Recommended initial release: show only `supported` records.

## Search and filtering

- Search matches title, prompt text, description, category label, and tags.
- Search is case-insensitive and trims whitespace.
- Category and text query combine with AND semantics.
- `All` clears only the category, not the search query.
- `Clear filters` clears both query and category.
- Update locally for the initial small dataset. If the library later becomes remotely paginated, preserve the same visible behavior and expose loading/error states.
- Debounce result-count announcements, not necessarily the visual filtering.

## Result design

Each result is one full-width button:

- Title on the first line.
- Description on the second line when present.
- Category as small muted metadata.
- Optional `Preview` label only when preview records are intentionally exposed.

Use red only for selected category and focus/action accents. Avoid turning every prompt into a red card.

## Selection behavior

Selecting a supported result:

1. Replaces the current composer text only after explicit activation.
2. Closes the browser.
3. Focuses the textarea with the caret at the end.
4. Does not send automatically.
5. Preserves the source prompt ID in transient UI state only if useful for analytics later; no analytics behavior is implied by this proposal.

If a non-empty draft would be replaced, ask for confirmation unless the selected prompt text exactly matches the draft.

## States

- Loading: skeleton rows only if prompts are fetched; not needed for bundled data.
- Results: matching prompts and count.
- Empty search: `No prompts match “{query}”. Try another search or clear filters.`
- Empty category: `No prompts are available in this category yet.`
- Error: `Prompts could not be loaded.` with `Try again` when applicable.

## Accessibility acceptance

- Popover/sheet has heading, labelled search, labelled category group, labelled results, and Close.
- Opening focuses Search; closing restores the opener.
- Tab order follows visual order.
- Category selection is announced.
- Result count updates are polite and debounced.
- Every result exposes the full prompt title and description to assistive technology.
- At 200% zoom, Search, categories, and at least one result remain reachable without two-dimensional page scrolling.
