import { describe, expect, it } from "vitest";

import {
  canonicalReportRows,
  cappedReportRows,
  FIXTURE_QUERY_TIME,
  monthlyFixtureCounts,
} from "./fixtures";
import { resolveSimulation } from "./resolver";

describe("deterministic Data Insights simulation", () => {
  it("returns exact monthly and prior-month counts", () => {
    const august = resolveSimulation("How many bids were created last month?");
    expect(august.bodyMarkdown).toContain("**42 bids**");
    const july = resolveSimulation(
      "And what about the previous month?",
      august.context,
    );
    expect(july.bodyMarkdown).toContain("**28 bids**");
    expect(monthlyFixtureCounts()).toEqual({
      augustDistinct: 42,
      augustRaw: 43,
      julyDistinct: 28,
    });
  });

  it("keeps Casey created and won semantics separate", () => {
    const created = resolveSimulation(
      "How many bids did Casey Patel create in the past seven days?",
    );
    expect(created.bodyMarkdown).toContain("created 18 bids");
    const won = resolveSimulation(
      "And how many did that person win?",
      created.context,
    );
    expect(won.bodyMarkdown).toContain("won 7 bids");
    expect(won.bodyMarkdown).toContain("Two of these bids were created before");
    expect(resolveSimulation("And how many did that person win?").bodyMarkdown).toContain(
      "This new chat does not have",
    );
  });

  it("clarifies duplicate names before resolving the East fixture", () => {
    const clarification = resolveSimulation(
      "How many bids did Alex Morgan create in the past seven days?",
    );
    expect(clarification.bodyMarkdown).toContain("two people named");
    const answer = resolveSimulation(
      "Alex Morgan in Estimating, East.",
      clarification.context,
    );
    expect(answer.bodyMarkdown).toContain("created 16 bids");
  });

  it("builds the exact canonical report shape and preview", () => {
    const plan = resolveSimulation(
      "Show the report of bids created in the past seven days.",
    );
    expect(plan.artifact?.columns).toHaveLength(10);
    expect(plan.artifact?.rows).toHaveLength(64);
    expect(plan.artifact?.rows.slice(0, 3).map((row) => row.bidId)).toEqual([
      "000064",
      "000063",
      "000062",
    ]);
    expect(plan.artifact?.rows.slice(0, 50)).toHaveLength(50);
    expect(plan.artifact?.rows.slice(50)).toHaveLength(14);
    expect(plan.artifact?.rows.find((row) => row.bidId === "000057")?.bidAmount).toBeNull();
    expect(plan.artifact?.rows.find((row) => row.bidId === "000054")?.bidAmount).toBe("0.00");
    expect(
      plan.artifact?.rows.filter((row) => row.createdBy === "Casey Patel"),
    ).toHaveLength(18);
  });

  it("keeps cap totals distinct from snapshots", () => {
    const rows = cappedReportRows();
    expect(rows).toHaveLength(5_000);
    expect(rows[0].bidId).toBe("CAP-005237");
  });

  it("distinguishes valid empty, unsupported, and technical failure", () => {
    const empty = resolveSimulation("Show bids created from 1 to 7 June 2026.");
    expect(empty.artifact?.rows).toHaveLength(0);
    expect(empty.bodyMarkdown).toContain("valid empty result");
    expect(
      resolveSimulation("Create a dashboard and export this report.").bodyMarkdown,
    ).toContain("not available");
    expect(
      resolveSimulation("question", {}, "data_query_failed").failure?.code,
    ).toBe("data_query_failed");
  });

  it("keeps partial, denial, save failure, cap, and freshness states distinct", () => {
    expect(
      resolveSimulation("question", {}, null, "partial_coverage").bodyMarkdown,
    ).toContain("44 is a partial count");
    expect(
      resolveSimulation("question", {}, null, "access_denied").bodyMarkdown,
    ).toContain("outside your permitted data scope");
    const saveFailure = resolveSimulation(
      "question",
      {},
      null,
      "report_save_failed",
    );
    expect(saveFailure.bodyMarkdown).toContain("could not be saved");
    expect(saveFailure.artifact).toBeUndefined();

    const known = resolveSimulation("question", {}, null, "cap_known");
    expect(known.artifact?.snapshotRowCount).toBe(5_000);
    expect(known.artifact?.totalMatchingRowCount).toBe(5_237);
    expect(known.artifact?.isTruncated).toBe(true);

    const unknown = resolveSimulation("question", {}, null, "cap_unknown");
    expect(unknown.artifact?.snapshotRowCount).toBe(5_000);
    expect(unknown.artifact?.totalMatchingRowCount).toBeNull();

    const unknownFreshness = resolveSimulation(
      "question",
      {},
      null,
      "freshness_unknown",
    );
    expect(unknownFreshness.artifact?.dataUpdatedThrough).toBeNull();
    expect(unknownFreshness.artifact?.queriedAt).toBe(FIXTURE_QUERY_TIME);
  });

  it("does not regenerate an existing snapshot when a new source row appears", () => {
    const stored = canonicalReportRows();
    const laterSource = [...canonicalReportRows(), { ...stored[0], bidId: "000065" }];
    expect(stored).toHaveLength(64);
    expect(laterSource).toHaveLength(65);
    expect(stored.map((row) => row.bidId)).not.toContain("000065");
  });
});
