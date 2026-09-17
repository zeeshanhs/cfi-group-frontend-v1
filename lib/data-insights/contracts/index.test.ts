import { describe, expect, it } from "vitest";

import {
  ContractValidationError,
  assertTableRowPageDto,
  parseArtifactPagination,
  parseCreateMessageRequest,
  parseLoginRequest,
  parseOpaqueId,
  parsePromptCatalogDto,
  parseTranscriptionRequest,
} from "./index";

describe("Data Insights contracts", () => {
  it("normalizes a valid demo login", () => {
    expect(
      parseLoginRequest({
        email: "  Jordan.Ellis@CFI-DEMO.EXAMPLE ",
        password: "CFI-Demo-2026!",
      }),
    ).toEqual({
      email: "jordan.ellis@cfi-demo.example",
      password: "CFI-Demo-2026!",
    });
  });

  it("rejects malformed login and identifiers", () => {
    expect(() => parseLoginRequest({ email: "nope", password: "x" })).toThrow(
      ContractValidationError,
    );
    expect(() => parseOpaqueId("../../chat", "chat identifier")).toThrow(
      ContractValidationError,
    );
  });

  it("validates message content, enum, idempotency, and Unicode length", () => {
    expect(
      parseCreateMessageRequest({
        content: "How many bids?",
        inputMode: "typed",
        clientSubmissionId: "submission_001",
      }),
    ).toEqual({
      content: "How many bids?",
      inputMode: "typed",
      clientSubmissionId: "submission_001",
    });
    expect(() =>
      parseCreateMessageRequest({
        content: "   ",
        inputMode: "typed",
        clientSubmissionId: "submission_001",
      }),
    ).toThrow("Enter a question");
    expect(() =>
      parseCreateMessageRequest({
        content: "a".repeat(4_001),
        inputMode: "typed",
        clientSubmissionId: "submission_001",
      }),
    ).toThrow("4,000");
    expect(() =>
      parseCreateMessageRequest({
        content: "Question",
        inputMode: "microphone",
        clientSubmissionId: "submission_001",
      }),
    ).toThrow("input mode");
  });

  it("rejects repeated, invalid, and over-limit pagination", () => {
    expect(parseArtifactPagination(new URLSearchParams())).toEqual({
      page: 1,
      pageSize: 50,
    });
    expect(() =>
      parseArtifactPagination(new URLSearchParams("page=1&page=2")),
    ).toThrow("Provide one page");
    expect(() =>
      parseArtifactPagination(new URLSearchParams("page=0")),
    ).toThrow("positive integer");
    expect(() =>
      parseArtifactPagination(new URLSearchParams("pageSize=51")),
    ).toThrow("supported range");
  });

  it("requires explicit simulated transcription mode", () => {
    expect(
      parseTranscriptionRequest({
        mode: "simulated",
        clientTranscriptionId: "transcription_001",
        scenario: "success",
      }),
    ).toEqual({
      mode: "simulated",
      clientTranscriptionId: "transcription_001",
      scenario: "success",
    });
    expect(() =>
      parseTranscriptionRequest({
        mode: "live",
        clientTranscriptionId: "transcription_001",
      }),
    ).toThrow("Only simulated transcription");
  });

  it("rejects unsafe adapter rows and invalid runtime schemas", () => {
    const page = {
      artifactId: "artifact_001",
      page: 1,
      pageSize: 50,
      columns: [{ key: "value", label: "Value", dataType: "decimal" as const }],
      rows: [{ value: Number.NaN }],
      snapshotRowCount: 1,
      totalMatchingRowCount: 1,
      isTruncated: false,
      hasNextPage: false,
    };
    expect(() => assertTableRowPageDto(page)).toThrow("non-finite");
    expect(() =>
      assertTableRowPageDto({
        ...page,
        columns: [
          { key: "value", label: "Value", dataType: "decimal" },
          { key: "value", label: "Duplicate", dataType: "text" },
        ],
        rows: [],
      }),
    ).toThrow("schema");
  });

  it("validates a supported-only prompt catalog at runtime", () => {
    const valid = {
      revision: "2026-09-17.1",
      categories: [{ id: "bids", label: "Bids", sortOrder: 10 }],
      prompts: [
        {
          id: "bids-last-month",
          title: "Bids last month",
          promptText: "How many bids were created last month?",
          description: "Count distinct bids for the previous month.",
          category: "bids",
          tags: ["monthly"],
          availability: "supported",
          sortOrder: 10,
        },
      ],
    };
    expect(parsePromptCatalogDto(valid)).toEqual(valid);
    expect(() =>
      parsePromptCatalogDto({
        ...valid,
        prompts: [{ ...valid.prompts[0], availability: "preview" }],
      }),
    ).toThrow("Only supported prompts");
    expect(() =>
      parsePromptCatalogDto({
        ...valid,
        categories: [
          ...valid.categories,
          { id: "jobs", label: "Jobs", sortOrder: 20 },
        ],
      }),
    ).toThrow("must contain a supported prompt");
  });
});
