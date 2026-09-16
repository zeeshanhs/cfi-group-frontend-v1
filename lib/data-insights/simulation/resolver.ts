import type { TableCellValue } from "@/lib/data-insights/contracts";
import {
  canonicalReportRows,
  cappedReportRows,
  FIXTURE_QUERY_TIME,
  FIXTURE_WATERMARK,
  TABLE_COLUMNS,
} from "./fixtures";

export type SimulationContext = {
  period?: "seven" | "august" | "july" | "june";
  basis?: "created" | "won";
  people?: ("casey" | "morgan" | "alex-east" | "alex-west")[];
  awaiting?: "alex" | "basis";
};

export type SimulatedArtifact = {
  title: string;
  columns: typeof TABLE_COLUMNS;
  rows: Record<string, TableCellValue>[];
  snapshotRowCount: number;
  totalMatchingRowCount: number | null;
  isTruncated: boolean;
  filters: string[];
  queriedAt: string;
  dataUpdatedThrough: string | null;
};

export type SimulationPlan = {
  bodyMarkdown: string;
  context: SimulationContext;
  artifact?: SimulatedArtifact;
  failure?: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type SimulationFailureMode =
  | "data_query_failed"
  | "answer_failed"
  | "interrupted"
  | null;

export type SimulationScenario =
  | "partial_coverage"
  | "access_denied"
  | "report_save_failed"
  | "cap_known"
  | "cap_unknown"
  | "freshness_unknown"
  | null;

function normalizePrompt(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[?.!]+$/g, "")
    .replace(/\s+/g, " ");
}

function syntheticPlan(
  bodyMarkdown: string,
  context: SimulationContext,
  artifact?: SimulatedArtifact,
): SimulationPlan {
  return { bodyMarkdown, context, artifact };
}

export function resolveSimulation(
  prompt: string,
  previous: SimulationContext = {},
  failureMode: SimulationFailureMode = null,
  scenario: SimulationScenario = null,
): SimulationPlan {
  if (failureMode === "data_query_failed") {
    return {
      bodyMarkdown: "",
      context: previous,
      failure: {
        code: "data_query_failed",
        message: "The data query could not be completed. No result was returned.",
        retryable: true,
      },
    };
  }
  if (failureMode === "answer_failed") {
    return {
      bodyMarkdown: "",
      context: previous,
      failure: {
        code: "answer_failed",
        message: "The answer service could not complete this reply.",
        retryable: true,
      },
    };
  }
  if (failureMode === "interrupted") {
    return {
      bodyMarkdown: "",
      context: previous,
      failure: {
        code: "interrupted",
        message: "This request was interrupted. Check its status or retry when available.",
        retryable: true,
      },
    };
  }

  if (scenario === "partial_coverage") {
    return syntheticPlan(
      "I cannot give a complete total for **9–15 September 2026**.\n\nThe available demo data contains **44 bids created from 9–13 September**. Data for **14–15 September** is unavailable in this test scenario. **44 is a partial count, not the requested full-period total.**\n\nReporting timezone: **UTC**. Synthetic demo data.",
      { period: "seven", basis: "created", people: [] },
    );
  }

  if (scenario === "access_denied") {
    return syntheticPlan(
      "I cannot return that result because it is outside your permitted data scope.\n\nAsk about data you are authorized to view. No count or report has been returned.",
      previous,
    );
  }

  if (scenario === "report_save_failed") {
    return syntheticPlan(
      "**64 bids** were created from **9–15 September 2026** in your authorized demo scope.\n\n**The detailed report could not be saved, so no report attachment is available.** Ask for the report again to make a new request.\n\n*Synthetic demo data; reporting timezone: UTC.*",
      { period: "seven", basis: "created", people: [] },
    );
  }

  if (scenario === "cap_known" || scenario === "cap_unknown") {
    const rows = cappedReportRows();
    const known = scenario === "cap_known";
    return syntheticPlan(
      known
        ? "**5,237 bids** match **1–31 August 2026** in your authorized demo scope. **The attached snapshot contains the first 5,000 rows; 237 matching rows are not stored in it.** Ask a narrower question for a smaller report.\n\n*Synthetic demo data; UTC.*"
        : "For **1–31 August 2026**, **the attached snapshot contains 5,000 rows. More matching bids exist, but the exact total is unavailable.** Ask a narrower question for a smaller report.\n\n*Synthetic demo data; UTC.*",
      { period: "august", basis: "created", people: [] },
      {
        title: "Bids created: 1–31 August 2026",
        columns: TABLE_COLUMNS,
        rows,
        snapshotRowCount: rows.length,
        totalMatchingRowCount: known ? 5_237 : null,
        isTruncated: true,
        filters: [
          "Created 1–31 August 2026 · UTC",
          "All statuses",
          "Your authorized demo scope",
        ],
        queriedAt: FIXTURE_QUERY_TIME,
        dataUpdatedThrough: FIXTURE_WATERMARK,
      },
    );
  }

  if (scenario === "freshness_unknown") {
    const rows = canonicalReportRows();
    return syntheticPlan(
      "**64 bids** were created from **9–15 September 2026**. Source freshness was not supplied.\n\n*Synthetic demo data; reporting timezone: UTC.*",
      { period: "seven", basis: "created", people: [] },
      {
        title: "Bids created: 9–15 September 2026",
        columns: TABLE_COLUMNS,
        rows,
        snapshotRowCount: rows.length,
        totalMatchingRowCount: rows.length,
        isTruncated: false,
        filters: [
          "Created 9–15 September 2026 · UTC",
          "All statuses",
          "Your authorized demo scope",
        ],
        queriedAt: FIXTURE_QUERY_TIME,
        dataUpdatedThrough: null,
      },
    );
  }

  const normalized = normalizePrompt(prompt);

  if (normalized === "how many bids were created last month") {
    return syntheticPlan(
      "**42 bids** were created from **1–31 August 2026**.\n\nThis counts distinct bids by creation date within your authorized demo scope. Reporting timezone: **UTC**.\n\n*Synthetic demo data; not live business results.*",
      { period: "august", basis: "created", people: [] },
    );
  }

  if (normalized === "and what about the previous month") {
    if (previous.period === "august" && previous.basis === "created") {
      return syntheticPlan(
        "**28 bids** were created from **1–31 July 2026**, the month before the August period we just used.\n\nThe metric and authorized demo scope are unchanged. Reporting timezone: **UTC**.\n\n*Synthetic demo data; not live business results.*",
        { period: "july", basis: "created", people: previous.people ?? [] },
      );
    }
    return contextMissing(previous);
  }

  if (
    normalized ===
    "how many bids did casey patel create in the past seven days"
  ) {
    return syntheticPlan(
      "**Casey Patel created 18 bids** from **9–15 September 2026**.\n\nThis uses the Created by field and creation date, not bid ownership. Reporting timezone: **UTC**.\n\n*Synthetic demo data; not live business results.*",
      { period: "seven", basis: "created", people: ["casey"] },
    );
  }

  if (normalized === "and how many did that person win") {
    if (
      previous.period === "seven" &&
      previous.people?.length === 1 &&
      previous.people[0] === "casey"
    ) {
      return syntheticPlan(
        "**Casey Patel won 7 bids** from **9–15 September 2026**.\n\nThis uses win date and win credit. Two of these bids were created before the reporting period. The 7 won bids and 18 created bids are separate measures, not a combined unique-bids total.\n\n*Synthetic demo data; reporting timezone: UTC.*",
        { period: "seven", basis: "won", people: ["casey"] },
      );
    }
    return contextMissing(previous);
  }

  if (
    normalized ===
    "how many bids did casey patel and morgan reed create in the past seven days"
  ) {
    return syntheticPlan(
      "From **9–15 September 2026**:\n\n- **Casey Patel:** 18 bids created.\n- **Morgan Reed:** 10 bids created.\n\nCounts use each bid's Created by field. Reporting timezone: **UTC**.\n\n*Synthetic demo data; not live business results.*",
      { period: "seven", basis: "created", people: ["casey", "morgan"] },
    );
  }

  if (
    normalized ===
    "how many bids did alex morgan create in the past seven days"
  ) {
    return syntheticPlan(
      "I found two people named **Alex Morgan** in the demo data:\n\n- Alex Morgan — Estimating, East\n- Alex Morgan — Commercial Accounts, West\n\nWhich person should I use for **9–15 September 2026 (UTC)**?",
      {
        period: "seven",
        basis: "created",
        people: [],
        awaiting: "alex",
      },
    );
  }

  if (
    normalized === "alex morgan in estimating, east" ||
    normalized === "alex morgan in estimating east"
  ) {
    if (previous.awaiting === "alex") {
      return syntheticPlan(
        "**Alex Morgan — Estimating, East created 16 bids** from **9–15 September 2026**.\n\nThis uses the Created by field and creation date. Reporting timezone: **UTC**.\n\n*Synthetic demo data; not live business results.*",
        { period: "seven", basis: "created", people: ["alex-east"] },
      );
    }
    return contextMissing(previous);
  }

  if (normalized === "show the report of bids created in the past seven days") {
    const rows = canonicalReportRows();
    return syntheticPlan(
      "**64 bids** were created from **9–15 September 2026**.\n\nThe report includes all 64 matching bids in your authorized demo scope. Open it to inspect the 10 columns.\n\n*Synthetic demo data · UTC.*",
      { period: "seven", basis: "created", people: [] },
      {
        title: "Bids created: 9–15 September 2026",
        columns: TABLE_COLUMNS,
        rows,
        snapshotRowCount: rows.length,
        totalMatchingRowCount: rows.length,
        isTruncated: false,
        filters: [
          "Created 9–15 September 2026 · UTC",
          "All statuses",
          "Your authorized demo scope",
        ],
        queriedAt: FIXTURE_QUERY_TIME,
        dataUpdatedThrough: FIXTURE_WATERMARK,
      },
    );
  }

  if (normalized === "show bids created from 1 to 7 june 2026") {
    return syntheticPlan(
      "**No bids matched** the creation-date period **1–7 June 2026** in your authorized demo scope.\n\nThe attached report has **0 rows**. This is a valid empty result, not a failed query.\n\n*Synthetic demo data; reporting timezone: UTC.*",
      { period: "june", basis: "created", people: [] },
      {
        title: "Bids created: 1–7 June 2026",
        columns: TABLE_COLUMNS,
        rows: [],
        snapshotRowCount: 0,
        totalMatchingRowCount: 0,
        isTruncated: false,
        filters: [
          "Created 1–7 June 2026 · UTC",
          "All statuses",
          "Your authorized demo scope",
        ],
        queriedAt: FIXTURE_QUERY_TIME,
        dataUpdatedThrough: FIXTURE_WATERMARK,
      },
    );
  }

  if (normalized === "show the bids report for last week") {
    return syntheticPlan(
      "Should the report include bids **created** or bids **won** during **7–13 September 2026 (UTC)**?\n\nI need the date basis before I run the report.",
      { ...previous, awaiting: "basis" },
    );
  }

  if (
    normalized === "create a dashboard and export this report" ||
    /\b(dashboard|export|download)\b/.test(normalized)
  ) {
    return syntheticPlan(
      "This prototype can answer the configured bid questions and open read-only table reports. **Dashboards and report exports are not available.**\n\nYou can ask for a count or request a report for a different person or period.",
      previous,
    );
  }

  return syntheticPlan(
    "This local prototype uses a bounded set of fictional bid questions, not a general AI service.\n\nTry **“How many bids were created last month?”** or **“Show the report of bids created in the past seven days.”**",
    previous,
  );
}

function contextMissing(previous: SimulationContext): SimulationPlan {
  return syntheticPlan(
    "Which person and reporting period should I use for the won-bid count?\n\nThis new chat does not have a previously selected person or period.",
    previous,
  );
}
