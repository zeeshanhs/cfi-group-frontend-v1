import { describe, expect, it } from "vitest";

import { getPromptCatalog } from "@/lib/data-insights/server/prompt-catalog";
import { resolveSimulation } from "@/lib/data-insights/simulation/resolver";

import { filterPrompts, normalizePromptSearch } from "./prompts";

describe("supported prompt catalog", () => {
  it("publishes one valid, ordered source with only exercised prompts", () => {
    const catalog = getPromptCatalog();
    expect(catalog.revision).toBe("2026-09-17.1");
    expect(catalog.categories.map((category) => category.label)).toEqual([
      "Bids",
      "People",
      "Weekly reports",
    ]);
    expect(catalog.prompts).toHaveLength(6);
    expect(Object.isFrozen(catalog)).toBe(true);
    expect(Object.isFrozen(catalog.prompts)).toBe(true);
    expect(
      catalog.prompts.every((prompt) => prompt.availability === "supported"),
    ).toBe(true);
    expect(catalog.prompts.map((prompt) => prompt.sortOrder)).toEqual([
      10, 20, 30, 40, 50, 60,
    ]);

    for (const prompt of catalog.prompts) {
      const plan = resolveSimulation(prompt.promptText);
      expect(plan.bodyMarkdown).not.toContain(
        "This local prototype uses a bounded set",
      );
      expect(plan.failure).toBeUndefined();
    }
  });

  it("normalizes whitespace and matches all searchable prompt fields", () => {
    const catalog = getPromptCatalog();
    expect(normalizePromptSearch("  CASEY   Patel  ")).toBe("casey patel");
    expect(filterPrompts(catalog, "  CASEY   Patel ", null)).toHaveLength(2);
    expect(filterPrompts(catalog, "empty report", null).map((item) => item.id)).toEqual([
      "empty-june-created-bids-report",
    ]);
    expect(filterPrompts(catalog, "weekly reports", null)).toHaveLength(2);
  });

  it("combines category and query filters with deterministic order", () => {
    const catalog = getPromptCatalog();
    expect(filterPrompts(catalog, "created", "people").map((item) => item.id)).toEqual([
      "casey-created-seven-days",
      "casey-morgan-created-seven-days",
      "alex-morgan-created-seven-days",
    ]);
    expect(filterPrompts(catalog, "Casey", "weekly-reports")).toEqual([]);
    expect(filterPrompts(catalog, "", null).map((item) => item.id)).toEqual(
      catalog.prompts.map((item) => item.id),
    );
  });
});
