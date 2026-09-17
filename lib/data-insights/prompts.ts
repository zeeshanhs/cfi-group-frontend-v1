import type {
  PromptCatalogDto,
  PromptSummaryDto,
} from "@/lib/data-insights/contracts";

export function normalizePromptSearch(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

export function orderedSupportedPrompts(
  prompts: PromptSummaryDto[],
): PromptSummaryDto[] {
  return [...prompts].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      left.title.localeCompare(right.title) ||
      left.id.localeCompare(right.id),
  );
}

export function filterPrompts(
  catalog: PromptCatalogDto,
  query: string,
  categoryId: string | null,
): PromptSummaryDto[] {
  const normalizedQuery = normalizePromptSearch(query);
  const categoryLabels = new Map(
    catalog.categories.map((category) => [category.id, category.label]),
  );

  return orderedSupportedPrompts(catalog.prompts).filter((prompt) => {
    if (categoryId !== null && prompt.category !== categoryId) return false;
    if (!normalizedQuery) return true;
    const searchable = normalizePromptSearch(
      [
        prompt.title,
        prompt.promptText,
        prompt.description,
        categoryLabels.get(prompt.category) ?? "",
        ...prompt.tags,
      ].join(" "),
    );
    return searchable.includes(normalizedQuery);
  });
}
