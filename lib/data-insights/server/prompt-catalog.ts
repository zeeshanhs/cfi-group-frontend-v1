import type {
  PromptCatalogDto,
  PromptCategoryDto,
  PromptSummaryDto,
} from "@/lib/data-insights/contracts";
import { parsePromptCatalogDto } from "@/lib/data-insights/contracts";
import { orderedSupportedPrompts } from "@/lib/data-insights/prompts";

const CATALOG_REVISION = "2026-09-17.1";

const CATEGORY_DEFINITIONS = [
  { id: "bids", label: "Bids", sortOrder: 10 },
  { id: "people", label: "People", sortOrder: 20 },
  { id: "weekly-reports", label: "Weekly reports", sortOrder: 30 },
] as const satisfies readonly PromptCategoryDto[];

const SERVER_PROMPT_CATALOG = [
  {
    id: "bids-created-last-month",
    title: "Bids created last month",
    promptText: "How many bids were created last month?",
    description: "Count distinct bids created in the previous complete month.",
    category: "bids",
    tags: ["monthly", "count", "created", "August 2026"],
    availability: "supported",
    sortOrder: 10,
  },
  {
    id: "casey-created-seven-days",
    title: "Casey Patel’s bid activity",
    promptText: "How many bids did Casey Patel create in the past seven days?",
    description: "Count bids Casey Patel created in the past seven complete days.",
    category: "people",
    tags: ["Casey Patel", "created by", "seven days", "count"],
    availability: "supported",
    sortOrder: 20,
  },
  {
    id: "weekly-created-bids-report",
    title: "Weekly bid activity report",
    promptText: "Show the report of bids created in the past seven days.",
    description: "Create the supported seven-day table report of created bids.",
    category: "weekly-reports",
    tags: ["weekly", "report", "table", "created"],
    availability: "supported",
    sortOrder: 30,
  },
  {
    id: "casey-morgan-created-seven-days",
    title: "Compare Casey Patel and Morgan Reed",
    promptText:
      "How many bids did Casey Patel and Morgan Reed create in the past seven days?",
    description: "Compare created-bid counts for two people over seven days.",
    category: "people",
    tags: ["Casey Patel", "Morgan Reed", "compare", "created by"],
    availability: "supported",
    sortOrder: 40,
  },
  {
    id: "alex-morgan-created-seven-days",
    title: "Alex Morgan’s bid activity",
    promptText: "How many bids did Alex Morgan create in the past seven days?",
    description: "Ask for the right Alex Morgan before counting created bids.",
    category: "people",
    tags: ["Alex Morgan", "clarification", "created by", "seven days"],
    availability: "supported",
    sortOrder: 50,
  },
  {
    id: "empty-june-created-bids-report",
    title: "Created bids from 1–7 June 2026",
    promptText: "Show bids created from 1 to 7 June 2026.",
    description: "Open the supported valid-empty report for this fixed period.",
    category: "weekly-reports",
    tags: ["June 2026", "empty report", "zero rows", "historical"],
    availability: "supported",
    sortOrder: 60,
  },
] as const satisfies readonly PromptSummaryDto[];

function buildPromptCatalog(): PromptCatalogDto {
  const prompts = orderedSupportedPrompts([...SERVER_PROMPT_CATALOG]);
  const usedCategories = new Set(prompts.map((prompt) => prompt.category));
  const categories = CATEGORY_DEFINITIONS.filter((category) =>
    usedCategories.has(category.id),
  ).sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.label.localeCompare(right.label),
  );
  const catalog = parsePromptCatalogDto({
    revision: CATALOG_REVISION,
    categories,
    prompts,
  });
  catalog.categories.forEach(Object.freeze);
  catalog.prompts.forEach((prompt) => {
    Object.freeze(prompt.tags);
    Object.freeze(prompt);
  });
  Object.freeze(catalog.categories);
  Object.freeze(catalog.prompts);
  return Object.freeze(catalog);
}

export const promptCatalog = buildPromptCatalog();

export function getPromptCatalog(): PromptCatalogDto {
  return promptCatalog;
}
