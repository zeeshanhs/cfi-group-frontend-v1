import { afterEach, describe, expect, it } from "vitest";

import { withDataInsightsDatabase } from "./database";
import {
  createFirstSubmission,
  createFollowUp,
  DataInsightsServiceError,
  getArtifactDetail,
  getArtifactRows,
  getChatDetail,
  getRequestStatus,
  listChats,
  retryRequest,
} from "./service";
import { temporaryReportingDatabase } from "./test-database";

let cleanup: (() => void) | undefined;

afterEach(() => {
  delete process.env.CFI_DATA_INSIGHTS_FAILURE_MODE;
  delete process.env.CFI_DATA_INSIGHTS_SCENARIO;
  delete process.env.CFI_DATA_INSIGHTS_ARTIFACT_PAGE_FAILURE;
  cleanup?.();
  cleanup = undefined;
});

function makeDatabase() {
  const temporary = temporaryReportingDatabase();
  cleanup = temporary.cleanup;
  withDataInsightsDatabase(() => undefined, temporary.databasePath);
  return temporary.databasePath;
}

function makeDue(databasePath: string, requestId: string) {
  withDataInsightsDatabase((database) => {
    database
      .prepare("UPDATE chat_requests SET ready_at = ? WHERE id = ?")
      .run("2000-01-01T00:00:00.000Z", requestId);
  }, databasePath);
}

function finish(databasePath: string, userId: string, requestId: string) {
  makeDue(databasePath, requestId);
  const running = getRequestStatus(userId, requestId, databasePath);
  expect(running.status).toBe("running");
  makeDue(databasePath, requestId);
  return getRequestStatus(userId, requestId, databasePath);
}

describe("Data Insights service", () => {
  it("creates the first turn atomically and deduplicates transport retries", () => {
    const databasePath = makeDatabase();
    const input = {
      content: "How many bids did Casey Patel create in the past seven days?",
      inputMode: "typed" as const,
      clientSubmissionId: "submission_atomic_001",
    };
    const first = createFirstSubmission("user_jordan", input, databasePath);
    const repeated = createFirstSubmission("user_jordan", input, databasePath);

    expect(repeated.chat.id).toBe(first.chat.id);
    expect(repeated.userMessage.id).toBe(first.userMessage.id);
    expect(repeated.request.id).toBe(first.request.id);
    withDataInsightsDatabase((database) => {
      expect(database.prepare("SELECT COUNT(*) AS count FROM chats").get()).toEqual(
        { count: 1 },
      );
      expect(
        database.prepare("SELECT COUNT(*) AS count FROM chat_messages").get(),
      ).toEqual({ count: 1 });
      expect(
        database.prepare("SELECT COUNT(*) AS count FROM chat_requests").get(),
      ).toEqual({ count: 1 });
    }, databasePath);
  });

  it("publishes Casey answers, recovers context, and isolates a new chat", () => {
    const databasePath = makeDatabase();
    const first = createFirstSubmission(
      "user_jordan",
      {
        content: "How many bids did Casey Patel create in the past seven days?",
        inputMode: "typed",
        clientSubmissionId: "submission_casey_001",
      },
      databasePath,
    );
    const completed = finish(databasePath, "user_jordan", first.request.id);
    expect(completed.status).toBe("completed");
    if (completed.status === "completed") {
      expect(completed.assistantMessage.bodyMarkdown).toContain(
        "Casey Patel created 18 bids",
      );
    }

    const followUp = createFollowUp(
      "user_jordan",
      first.chat.id,
      {
        content: "And how many did that person win?",
        inputMode: "typed",
        clientSubmissionId: "submission_casey_002",
      },
      databasePath,
    );
    const won = finish(databasePath, "user_jordan", followUp.request.id);
    expect(won.status).toBe("completed");
    if (won.status === "completed") {
      expect(won.assistantMessage.bodyMarkdown).toContain("won 7 bids");
    }

    const isolated = createFirstSubmission(
      "user_jordan",
      {
        content: "And how many did that person win?",
        inputMode: "typed",
        clientSubmissionId: "submission_isolated_001",
      },
      databasePath,
    );
    const isolatedAnswer = finish(
      databasePath,
      "user_jordan",
      isolated.request.id,
    );
    if (isolatedAnswer.status === "completed") {
      expect(isolatedAnswer.assistantMessage.bodyMarkdown).toContain(
        "Which person and reporting period",
      );
    }
  });

  it("stores one stable 64-row snapshot and pages it 50/14", () => {
    const databasePath = makeDatabase();
    const submission = createFirstSubmission(
      "user_jordan",
      {
        content: "Show the report of bids created in the past seven days.",
        inputMode: "typed",
        clientSubmissionId: "submission_report_001",
      },
      databasePath,
    );
    const completed = finish(
      databasePath,
      "user_jordan",
      submission.request.id,
    );
    expect(completed.status).toBe("completed");
    if (completed.status !== "completed") return;
    const artifact = completed.assistantMessage.attachments[0];
    expect(artifact.snapshotRowCount).toBe(64);

    const detail = getArtifactDetail(
      "user_jordan",
      artifact.id,
      databasePath,
    );
    const pageOne = getArtifactRows(
      "user_jordan",
      artifact.id,
      1,
      50,
      databasePath,
    );
    const pageTwo = getArtifactRows(
      "user_jordan",
      artifact.id,
      2,
      50,
      databasePath,
    );
    expect(detail.columns).toHaveLength(10);
    expect(detail.previewRows).toEqual(pageOne.rows.slice(0, 3));
    expect(pageOne.rows).toHaveLength(50);
    expect(pageOne.hasNextPage).toBe(true);
    expect(pageTwo.rows).toHaveLength(14);
    expect(pageTwo.hasNextPage).toBe(false);
    expect(pageOne.rows[0].bidId).toBe("000064");

    expect(() =>
      getArtifactDetail("user_riley", artifact.id, databasePath),
    ).toThrow("unavailable");
    expect(() =>
      getArtifactRows("user_riley", artifact.id, 1, 50, databasePath),
    ).toThrow("unavailable");

    expect(
      getArtifactRows("user_jordan", artifact.id, 1, 50, databasePath).rows,
    ).toEqual(pageOne.rows);

    process.env.CFI_DATA_INSIGHTS_ARTIFACT_PAGE_FAILURE = "2";
    expect(() =>
      getArtifactRows("user_jordan", artifact.id, 2, 50, databasePath),
    ).toThrow("Page 2 could not be loaded");
  });

  it("does not reorder chats on read and denies all altered cross-user IDs", () => {
    const databasePath = makeDatabase();
    const submission = createFirstSubmission(
      "user_jordan",
      {
        content: "How many bids were created last month?",
        inputMode: "typed",
        clientSubmissionId: "submission_owner_001",
      },
      databasePath,
    );
    finish(databasePath, "user_jordan", submission.request.id);
    const before = listChats("user_jordan", databasePath);
    getChatDetail("user_jordan", submission.chat.id, databasePath);
    expect(listChats("user_jordan", databasePath)).toEqual(before);

    expect(() =>
      getChatDetail("user_riley", submission.chat.id, databasePath),
    ).toThrow(DataInsightsServiceError);
    expect(() =>
      getRequestStatus("user_riley", submission.request.id, databasePath),
    ).toThrow("unavailable");
  });

  it("allows independent active work in separate chats and recovers pending state", () => {
    const databasePath = makeDatabase();
    const first = createFirstSubmission(
      "user_jordan",
      {
        content: "How many bids were created last month?",
        inputMode: "typed",
        clientSubmissionId: "submission_concurrent_001",
      },
      databasePath,
    );
    const second = createFirstSubmission(
      "user_jordan",
      {
        content: "How many bids did Casey Patel create in the past seven days?",
        inputMode: "typed",
        clientSubmissionId: "submission_concurrent_002",
      },
      databasePath,
    );
    expect(second.chat.id).not.toBe(first.chat.id);
    expect(getChatDetail("user_jordan", first.chat.id, databasePath).activeRequest?.id).toBe(
      first.request.id,
    );
    expect(getChatDetail("user_jordan", second.chat.id, databasePath).activeRequest?.id).toBe(
      second.request.id,
    );
  });

  it("permits one active request per chat and retries a controlled failure once", () => {
    const databasePath = makeDatabase();
    process.env.CFI_DATA_INSIGHTS_FAILURE_MODE = "answer_failed";
    const submission = createFirstSubmission(
      "user_jordan",
      {
        content: "How many bids were created last month?",
        inputMode: "typed",
        clientSubmissionId: "submission_failure_001",
      },
      databasePath,
    );
    expect(() =>
      createFollowUp(
        "user_jordan",
        submission.chat.id,
        {
          content: "And what about the previous month?",
          inputMode: "typed",
          clientSubmissionId: "submission_while_active_001",
        },
        databasePath,
      ),
    ).toThrow("Wait for the current answer");

    const failed = finish(
      databasePath,
      "user_jordan",
      submission.request.id,
    );
    expect(failed.status).toBe("failed");
    delete process.env.CFI_DATA_INSIGHTS_FAILURE_MODE;
    const queued = retryRequest(
      "user_jordan",
      submission.request.id,
      databasePath,
    );
    expect(queued.status).toBe("queued");
    const completed = finish(
      databasePath,
      "user_jordan",
      submission.request.id,
    );
    expect(completed.status).toBe("completed");
    withDataInsightsDatabase((database) => {
      expect(
        database
          .prepare(
            "SELECT attempt_number, status FROM chat_request_attempts WHERE request_id = ? ORDER BY attempt_number",
          )
          .all(submission.request.id),
      ).toEqual([
        { attempt_number: 1, status: "failed" },
        { attempt_number: 2, status: "completed" },
      ]);
    }, databasePath);
  });
});
