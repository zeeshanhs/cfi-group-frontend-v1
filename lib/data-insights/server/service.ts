import { randomUUID } from "node:crypto";

import type Database from "better-sqlite3";

import {
  assertChatSummaryDto,
  assertMessageDto,
  assertRequestStatusDto,
  assertTableArtifactDetailDto,
  assertTableRowPageDto,
  type ChatDetailDto,
  type ChatListDto,
  type ChatSummaryDto,
  type CreateMessageRequestDto,
  type CreateMessageResponseDto,
  type MessageDto,
  type RequestStatusDto,
  type TableArtifactDetailDto,
  type TableArtifactSummaryDto,
  type TableCellValue,
  type TableColumnDto,
  type TableRowPageDto,
} from "@/lib/data-insights/contracts";
import { readScopeKey } from "@/lib/data-insights/server/auth";
import { withDataInsightsDatabase } from "@/lib/data-insights/server/database";
import {
  resolveSimulation,
  type SimulationContext,
  type SimulationFailureMode,
  type SimulationPlan,
  type SimulationScenario,
} from "@/lib/data-insights/simulation/resolver";

type ChatRow = {
  id: string;
  title: string;
  created_at: string;
  last_activity_at: string;
};

type MessageRow = {
  id: string;
  chat_id: string;
  sequence: number;
  role: "user" | "assistant";
  body_format: "plain" | "markdown";
  body_content: string;
  created_at: string;
  request_id: string | null;
  input_mode: "typed" | "voice" | null;
};

type RequestRow = {
  id: string;
  owner_user_id: string;
  chat_id: string;
  user_message_id: string;
  client_submission_id: string;
  status: "queued" | "running" | "completed" | "failed" | "interrupted";
  active_attempt: number;
  result_message_id: string | null;
  plan_json: string;
  resolved_context_json: string | null;
  submitted_at: string;
  ready_at: string;
  started_at: string | null;
  ended_at: string | null;
  failure_code: string | null;
  failure_message: string | null;
  retryable: 0 | 1;
};

type ArtifactRow = {
  id: string;
  title: string;
  columns_json: string;
  snapshot_row_count: number;
  total_matching_row_count: number | null;
  is_truncated: 0 | 1;
  filters_json: string;
  provenance_json: string;
};

export class DataInsightsServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "DataInsightsServiceError";
  }
}

function makeId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function chatSummary(row: ChatRow): ChatSummaryDto {
  return assertChatSummaryDto({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    lastActivityAt: row.last_activity_at,
  });
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function artifactSummary(row: ArtifactRow): TableArtifactSummaryDto {
  const columns = parseJson<TableColumnDto[]>(row.columns_json);
  return {
    id: row.id,
    type: "table",
    title: row.title,
    snapshotRowCount: row.snapshot_row_count,
    totalMatchingRowCount: row.total_matching_row_count,
    isTruncated: row.is_truncated === 1,
    columnCount: columns.length,
  };
}

function attachmentsForMessage(
  database: Database.Database,
  messageId: string,
): TableArtifactSummaryDto[] {
  const rows = database
    .prepare(
      "SELECT id, title, columns_json, snapshot_row_count, total_matching_row_count, is_truncated, filters_json, provenance_json FROM chat_artifacts WHERE assistant_message_id = ? ORDER BY created_at, id",
    )
    .all(messageId) as ArtifactRow[];
  return rows.map(artifactSummary);
}

function messageDto(
  database: Database.Database,
  row: MessageRow,
): MessageDto {
  return assertMessageDto({
    id: row.id,
    chatId: row.chat_id,
    sequence: row.sequence,
    role: row.role,
    content: row.role === "user" ? row.body_content : null,
    bodyFormat: row.body_format,
    bodyMarkdown: row.role === "assistant" ? row.body_content : null,
    createdAt: row.created_at,
    requestId: row.request_id,
    inputMode: row.input_mode,
    attachments: attachmentsForMessage(database, row.id),
  });
}

function requestStatusDto(
  database: Database.Database,
  row: RequestRow,
): RequestStatusDto {
  if (row.status === "queued" || row.status === "running") {
    return assertRequestStatusDto({
      id: row.id,
      chatId: row.chat_id,
      status: row.status,
      attempt: row.active_attempt,
      retryable: false,
      submittedAt: row.submitted_at,
      readyAt: row.ready_at,
    });
  }
  if (row.status === "completed") {
    const result = database
      .prepare("SELECT * FROM chat_messages WHERE id = ?")
      .get(row.result_message_id) as MessageRow | undefined;
    if (!result) {
      throw new DataInsightsServiceError(
        "reply_contract_failed",
        "The answer could not be displayed. Retry this question.",
        500,
        true,
      );
    }
    return assertRequestStatusDto({
      id: row.id,
      chatId: row.chat_id,
      status: "completed",
      attempt: row.active_attempt,
      retryable: false,
      submittedAt: row.submitted_at,
      completedAt: row.ended_at ?? result.created_at,
      assistantMessage: messageDto(database, result),
    });
  }
  return assertRequestStatusDto({
    id: row.id,
    chatId: row.chat_id,
    status: row.status,
    attempt: row.active_attempt,
    retryable: row.retryable === 1,
    submittedAt: row.submitted_at,
    completedAt: row.ended_at,
    error: {
      code: row.failure_code ?? "request_failed",
      message:
        row.failure_message ?? "This answer could not be completed. Try again.",
    },
  });
}

function assertOwnedChat(
  database: Database.Database,
  userId: string,
  chatId: string,
) {
  const row = database
    .prepare(
      "SELECT id, title, created_at, last_activity_at FROM chats WHERE id = ? AND owner_user_id = ?",
    )
    .get(chatId, userId) as ChatRow | undefined;
  if (!row) {
    throw new DataInsightsServiceError(
      "resource_unavailable",
      "This conversation is unavailable.",
      404,
    );
  }
  return row;
}

function requestById(
  database: Database.Database,
  userId: string,
  requestId: string,
) {
  const row = database
    .prepare("SELECT * FROM chat_requests WHERE id = ? AND owner_user_id = ?")
    .get(requestId, userId) as RequestRow | undefined;
  if (!row) {
    throw new DataInsightsServiceError(
      "resource_unavailable",
      "This request is unavailable.",
      404,
    );
  }
  return row;
}

function previousContext(
  database: Database.Database,
  chatId: string,
): SimulationContext {
  const row = database
    .prepare(`
      SELECT resolved_context_json
      FROM chat_requests
      WHERE chat_id = ?
        AND status = 'completed'
        AND resolved_context_json IS NOT NULL
      ORDER BY ended_at DESC, id DESC
      LIMIT 1
    `)
    .get(chatId) as { resolved_context_json: string } | undefined;
  return row ? parseJson<SimulationContext>(row.resolved_context_json) : {};
}

function configuredFailureMode(): SimulationFailureMode {
  const value = process.env.CFI_DATA_INSIGHTS_FAILURE_MODE;
  if (
    value === "data_query_failed" ||
    value === "answer_failed" ||
    value === "interrupted"
  ) {
    return value;
  }
  return null;
}

function configuredScenario(): SimulationScenario {
  const value = process.env.CFI_DATA_INSIGHTS_SCENARIO;
  if (
    value === "partial_coverage" ||
    value === "access_denied" ||
    value === "report_save_failed" ||
    value === "cap_known" ||
    value === "cap_unknown" ||
    value === "freshness_unknown"
  ) {
    return value;
  }
  return null;
}

function plainTitle(content: string) {
  const normalized = content
    .replace(/[`*_>#\[\]()~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const points = [...normalized];
  return points.length <= 60 ? normalized : `${points.slice(0, 59).join("")}…`;
}

function createResponse(
  database: Database.Database,
  request: RequestRow,
): CreateMessageResponseDto {
  const chat = database
    .prepare(
      "SELECT id, title, created_at, last_activity_at FROM chats WHERE id = ?",
    )
    .get(request.chat_id) as ChatRow;
  const userMessage = database
    .prepare("SELECT * FROM chat_messages WHERE id = ?")
    .get(request.user_message_id) as MessageRow;
  return {
    chat: chatSummary(chat),
    userMessage: messageDto(database, userMessage),
    request: requestStatusDto(database, request),
  };
}

function insertSubmission(
  database: Database.Database,
  userId: string,
  input: CreateMessageRequestDto,
  chatId?: string,
) {
  const existing = database
    .prepare(
      "SELECT * FROM chat_requests WHERE owner_user_id = ? AND client_submission_id = ?",
    )
    .get(userId, input.clientSubmissionId) as RequestRow | undefined;
  if (existing) return existing;

  const now = new Date();
  const submittedAt = now.toISOString();
  const readyAt = new Date(now.getTime() + 350).toISOString();
  const resolvedChatId = chatId ?? makeId("chat");
  const context = chatId ? previousContext(database, chatId) : {};
  const plan = resolveSimulation(
    input.content,
    context,
    configuredFailureMode(),
    configuredScenario(),
  );
  const requestId = makeId("request");
  const messageId = makeId("message");

  if (!chatId) {
    database
      .prepare(
        "INSERT INTO chats (id, owner_user_id, title, created_at, last_activity_at) VALUES (?, ?, ?, ?, ?)",
      )
      .run(
        resolvedChatId,
        userId,
        plainTitle(input.content),
        submittedAt,
        submittedAt,
      );
  } else {
    assertOwnedChat(database, userId, chatId);
    const active = database
      .prepare(
        "SELECT 1 FROM chat_requests WHERE chat_id = ? AND status IN ('queued', 'running') LIMIT 1",
      )
      .get(chatId);
    if (active) {
      throw new DataInsightsServiceError(
        "request_active",
        "Wait for the current answer before sending another question in this chat.",
        409,
      );
    }
  }

  const sequence = (
    database
      .prepare(
        "SELECT COALESCE(MAX(sequence), 0) + 1 AS sequence FROM chat_messages WHERE chat_id = ?",
      )
      .get(resolvedChatId) as { sequence: number }
  ).sequence;
  database
    .prepare(`
      INSERT INTO chat_messages (
        id, chat_id, sequence, role, body_format, body_content,
        created_at, request_id, input_mode
      ) VALUES (?, ?, ?, 'user', 'plain', ?, ?, ?, ?)
    `)
    .run(
      messageId,
      resolvedChatId,
      sequence,
      input.content.trim(),
      submittedAt,
      requestId,
      input.inputMode,
    );
  database
    .prepare(`
      INSERT INTO chat_requests (
        id, owner_user_id, chat_id, user_message_id, client_submission_id,
        status, active_attempt, result_message_id, plan_json,
        resolved_context_json, submitted_at, ready_at, started_at, ended_at,
        failure_code, failure_message, retryable
      ) VALUES (?, ?, ?, ?, ?, 'queued', 1, NULL, ?, NULL, ?, ?, NULL, NULL, NULL, NULL, 0)
    `)
    .run(
      requestId,
      userId,
      resolvedChatId,
      messageId,
      input.clientSubmissionId,
      JSON.stringify(plan),
      submittedAt,
      readyAt,
    );
  database
    .prepare(
      "INSERT INTO chat_request_attempts (request_id, attempt_number, status) VALUES (?, 1, 'queued')",
    )
    .run(requestId);
  database
    .prepare("UPDATE chats SET last_activity_at = ? WHERE id = ?")
    .run(submittedAt, resolvedChatId);
  return requestById(database, userId, requestId);
}

export function listChats(
  userId: string,
  databasePath?: string,
): ChatListDto {
  return withDataInsightsDatabase((database) => {
    const rows = database
      .prepare(`
        SELECT id, title, created_at, last_activity_at
        FROM chats
        WHERE owner_user_id = ?
        ORDER BY last_activity_at DESC, id ASC
      `)
      .all(userId) as ChatRow[];
    return { chats: rows.map(chatSummary) };
  }, databasePath);
}

export function createFirstSubmission(
  userId: string,
  input: CreateMessageRequestDto,
  databasePath?: string,
): CreateMessageResponseDto {
  return withDataInsightsDatabase((database) => {
    const transaction = database.transaction(() =>
      insertSubmission(database, userId, input),
    );
    return createResponse(database, transaction());
  }, databasePath);
}

export function createFollowUp(
  userId: string,
  chatId: string,
  input: CreateMessageRequestDto,
  databasePath?: string,
): CreateMessageResponseDto {
  return withDataInsightsDatabase((database) => {
    const transaction = database.transaction(() =>
      insertSubmission(database, userId, input, chatId),
    );
    return createResponse(database, transaction());
  }, databasePath);
}

export function getChatDetail(
  userId: string,
  chatId: string,
  databasePath?: string,
): ChatDetailDto {
  return withDataInsightsDatabase((database) => {
    const chat = assertOwnedChat(database, userId, chatId);
    const messages = database
      .prepare("SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY sequence")
      .all(chatId) as MessageRow[];
    const active = database
      .prepare(`
        SELECT * FROM chat_requests
        WHERE chat_id = ? AND status IN ('queued', 'running')
        ORDER BY submitted_at DESC LIMIT 1
      `)
      .get(chatId) as RequestRow | undefined;
    const latest = database
      .prepare(`
        SELECT * FROM chat_requests
        WHERE chat_id = ?
        ORDER BY submitted_at DESC LIMIT 1
      `)
      .get(chatId) as RequestRow | undefined;
    return {
      chat: chatSummary(chat),
      messages: messages.map((row) => messageDto(database, row)),
      activeRequest: active ? requestStatusDto(database, active) : null,
      latestRequest: latest ? requestStatusDto(database, latest) : null,
    };
  }, databasePath);
}

function persistCompletedPlan(
  database: Database.Database,
  request: RequestRow,
  plan: SimulationPlan,
) {
  const completedAt = new Date().toISOString();
  if (plan.failure) {
    const status = plan.failure.code === "interrupted" ? "interrupted" : "failed";
    database
      .prepare(`
        UPDATE chat_requests
        SET status = ?, ended_at = ?, failure_code = ?, failure_message = ?, retryable = ?
        WHERE id = ? AND status IN ('queued', 'running')
      `)
      .run(
        status,
        completedAt,
        plan.failure.code,
        plan.failure.message,
        plan.failure.retryable ? 1 : 0,
        request.id,
      );
    database
      .prepare(`
        UPDATE chat_request_attempts
        SET status = ?, started_at = COALESCE(started_at, ?), ended_at = ?, failure_code = ?
        WHERE request_id = ? AND attempt_number = ?
      `)
      .run(
        status,
        request.started_at ?? request.submitted_at,
        completedAt,
        plan.failure.code,
        request.id,
        request.active_attempt,
      );
    return;
  }

  if (!plan.bodyMarkdown.trim()) {
    throw new DataInsightsServiceError(
      "reply_contract_failed",
      "The answer could not be displayed. Retry this question.",
      500,
      true,
    );
  }
  const sequence = (
    database
      .prepare(
        "SELECT COALESCE(MAX(sequence), 0) + 1 AS sequence FROM chat_messages WHERE chat_id = ?",
      )
      .get(request.chat_id) as { sequence: number }
  ).sequence;
  const messageId = makeId("message");
  database
    .prepare(`
      INSERT INTO chat_messages (
        id, chat_id, sequence, role, body_format, body_content,
        created_at, request_id, input_mode
      ) VALUES (?, ?, ?, 'assistant', 'markdown', ?, ?, ?, NULL)
    `)
    .run(
      messageId,
      request.chat_id,
      sequence,
      plan.bodyMarkdown,
      completedAt,
      request.id,
    );

  if (plan.artifact) {
    const artifactId = makeId("artifact");
    const scopeKey = readScopeKey(database, request.owner_user_id);
    if (!scopeKey) {
      throw new DataInsightsServiceError(
        "artifact_persistence_failed",
        "The detailed report could not be saved.",
        500,
      );
    }
    assertTableArtifactDetailDto({
      id: artifactId,
      type: "table",
      title: plan.artifact.title,
      snapshotRowCount: plan.artifact.snapshotRowCount,
      totalMatchingRowCount: plan.artifact.totalMatchingRowCount,
      isTruncated: plan.artifact.isTruncated,
      columnCount: plan.artifact.columns.length,
      columns: plan.artifact.columns,
      previewRows: plan.artifact.rows.slice(0, 3),
      filters: plan.artifact.filters,
      provenance: {
        reportingTimezone: "UTC",
        queriedAt: plan.artifact.queriedAt,
        dataUpdatedThrough: plan.artifact.dataUpdatedThrough,
        mode: "synthetic",
        dateBasis: plan.artifact.dateBasis,
        periodStart: plan.artifact.periodStart,
        periodEndExclusive: plan.artifact.periodEndExclusive,
        ordering: plan.artifact.ordering,
      },
    });
    database
      .prepare(`
        INSERT INTO chat_artifacts (
          id, owner_user_id, chat_id, assistant_message_id, title,
          artifact_type, columns_json, snapshot_row_count,
          total_matching_row_count, is_truncated, filters_json,
          provenance_json, scope_key, created_at
        ) VALUES (?, ?, ?, ?, ?, 'table', ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        artifactId,
        request.owner_user_id,
        request.chat_id,
        messageId,
        plan.artifact.title,
        JSON.stringify(plan.artifact.columns),
        plan.artifact.snapshotRowCount,
        plan.artifact.totalMatchingRowCount,
        plan.artifact.isTruncated ? 1 : 0,
        JSON.stringify(plan.artifact.filters),
        JSON.stringify({
          reportingTimezone: "UTC",
          queriedAt: plan.artifact.queriedAt,
          dataUpdatedThrough: plan.artifact.dataUpdatedThrough,
          mode: "synthetic",
          dateBasis: plan.artifact.dateBasis,
          periodStart: plan.artifact.periodStart,
          periodEndExclusive: plan.artifact.periodEndExclusive,
          ordering: plan.artifact.ordering,
        }),
        scopeKey,
        completedAt,
      );
    const insertRow = database.prepare(
      "INSERT INTO chat_artifact_rows (artifact_id, row_index, row_json) VALUES (?, ?, ?)",
    );
    plan.artifact.rows.forEach((row, index) =>
      insertRow.run(artifactId, index, JSON.stringify(row)),
    );
  }

  database
    .prepare(`
      UPDATE chat_requests
      SET status = 'completed', result_message_id = ?, resolved_context_json = ?,
          ended_at = ?, failure_code = NULL, failure_message = NULL, retryable = 0
      WHERE id = ? AND status IN ('queued', 'running')
    `)
    .run(messageId, JSON.stringify(plan.context), completedAt, request.id);
  database
    .prepare(`
      UPDATE chat_request_attempts
      SET status = 'completed', started_at = COALESCE(started_at, ?), ended_at = ?, failure_code = NULL
      WHERE request_id = ? AND attempt_number = ?
    `)
    .run(
      request.started_at ?? request.submitted_at,
      completedAt,
      request.id,
      request.active_attempt,
    );
  database
    .prepare("UPDATE chats SET last_activity_at = ? WHERE id = ?")
    .run(completedAt, request.chat_id);
}

export function getRequestStatus(
  userId: string,
  requestId: string,
  databasePath?: string,
): RequestStatusDto {
  return withDataInsightsDatabase((database) => {
    let request = requestById(database, userId, requestId);
    const now = new Date();
    if (request.status === "queued" && request.ready_at <= now.toISOString()) {
      const transaction = database.transaction(() => {
        const current = requestById(database, userId, requestId);
        if (current.status !== "queued") return;
        const startedAt = now.toISOString();
        const completionReadyAt = new Date(now.getTime() + 350).toISOString();
        database
          .prepare(
            "UPDATE chat_requests SET status = 'running', started_at = COALESCE(started_at, ?), ready_at = ? WHERE id = ?",
          )
          .run(startedAt, completionReadyAt, requestId);
        database
          .prepare(
            "UPDATE chat_request_attempts SET status = 'running', started_at = COALESCE(started_at, ?) WHERE request_id = ? AND attempt_number = ?",
          )
          .run(startedAt, requestId, current.active_attempt);
      });
      transaction();
      request = requestById(database, userId, requestId);
    } else if (
      request.status === "running" &&
      request.ready_at <= now.toISOString()
    ) {
      const transaction = database.transaction(() => {
        const current = requestById(database, userId, requestId);
        if (current.status !== "running") return;
        persistCompletedPlan(
          database,
          current,
          parseJson<SimulationPlan>(current.plan_json),
        );
      });
      transaction();
      request = requestById(database, userId, requestId);
    }
    return requestStatusDto(database, request);
  }, databasePath);
}

export function retryRequest(
  userId: string,
  requestId: string,
  databasePath?: string,
): RequestStatusDto {
  return withDataInsightsDatabase((database) => {
    const transaction = database.transaction(() => {
      const request = requestById(database, userId, requestId);
      if (
        (request.status !== "failed" && request.status !== "interrupted") ||
        request.retryable !== 1
      ) {
        throw new DataInsightsServiceError(
          "retry_unavailable",
          "This question cannot be retried.",
          409,
        );
      }
      const userMessage = database
        .prepare("SELECT body_content FROM chat_messages WHERE id = ?")
        .get(request.user_message_id) as { body_content: string };
      const contextRow = database
        .prepare(`
          SELECT resolved_context_json FROM chat_requests
          WHERE chat_id = ? AND status = 'completed' AND id <> ?
          ORDER BY ended_at DESC, id DESC LIMIT 1
        `)
        .get(request.chat_id, request.id) as
        | { resolved_context_json: string | null }
        | undefined;
      const context = contextRow?.resolved_context_json
        ? parseJson<SimulationContext>(contextRow.resolved_context_json)
        : {};
      const attempt = request.active_attempt + 1;
      const now = new Date();
      const readyAt = new Date(now.getTime() + 350).toISOString();
      database
        .prepare(`
          UPDATE chat_requests
          SET status = 'queued', active_attempt = ?, plan_json = ?, ready_at = ?,
              started_at = NULL, ended_at = NULL, failure_code = NULL,
              failure_message = NULL, retryable = 0
          WHERE id = ?
        `)
        .run(
          attempt,
          JSON.stringify(resolveSimulation(userMessage.body_content, context)),
          readyAt,
          requestId,
        );
      database
        .prepare(
          "INSERT INTO chat_request_attempts (request_id, attempt_number, status) VALUES (?, ?, 'queued')",
        )
        .run(requestId, attempt);
    });
    transaction();
    return requestStatusDto(database, requestById(database, userId, requestId));
  }, databasePath);
}

function ownedArtifact(
  database: Database.Database,
  userId: string,
  artifactId: string,
) {
  const row = database
    .prepare(`
      SELECT id, title, columns_json, snapshot_row_count,
             total_matching_row_count, is_truncated, filters_json,
             provenance_json
      FROM chat_artifacts
      WHERE id = ? AND owner_user_id = ?
    `)
    .get(artifactId, userId) as ArtifactRow | undefined;
  if (!row) {
    throw new DataInsightsServiceError(
      "resource_unavailable",
      "This report is unavailable.",
      404,
    );
  }
  return row;
}

export function getArtifactDetail(
  userId: string,
  artifactId: string,
  databasePath?: string,
): TableArtifactDetailDto {
  return withDataInsightsDatabase((database) => {
    const artifact = ownedArtifact(database, userId, artifactId);
    const columns = parseJson<TableColumnDto[]>(artifact.columns_json);
    const rawProvenance = parseJson<Partial<TableArtifactDetailDto["provenance"]>>(
      artifact.provenance_json,
    );
    if (!rawProvenance.queriedAt) {
      throw new DataInsightsServiceError(
        "artifact_invalid",
        "This report is unavailable.",
        500,
      );
    }
    const previewRows = database
      .prepare(
        "SELECT row_json FROM chat_artifact_rows WHERE artifact_id = ? ORDER BY row_index LIMIT 3",
      )
      .all(artifactId)
      .map((row) => parseJson<Record<string, TableCellValue>>((row as { row_json: string }).row_json));
    return assertTableArtifactDetailDto({
      ...artifactSummary(artifact),
      columns,
      previewRows,
      filters: parseJson<string[]>(artifact.filters_json),
      provenance: {
        reportingTimezone: rawProvenance.reportingTimezone ?? "UTC",
        queriedAt: rawProvenance.queriedAt,
        dataUpdatedThrough: rawProvenance.dataUpdatedThrough ?? null,
        mode: "synthetic",
        dateBasis: rawProvenance.dateBasis ?? null,
        periodStart: rawProvenance.periodStart ?? null,
        periodEndExclusive: rawProvenance.periodEndExclusive ?? null,
        ordering: rawProvenance.ordering ?? null,
      },
    });
  }, databasePath);
}

export function getArtifactRows(
  userId: string,
  artifactId: string,
  page: number,
  pageSize: number,
  databasePath?: string,
): TableRowPageDto {
  return withDataInsightsDatabase((database) => {
    const artifact = ownedArtifact(database, userId, artifactId);
    if (process.env.CFI_DATA_INSIGHTS_ARTIFACT_PAGE_FAILURE === String(page)) {
      throw new DataInsightsServiceError(
        "artifact_page_failed",
        `Page ${page} could not be loaded. Try again or return to page 1.`,
        503,
        true,
      );
    }
    const offset = (page - 1) * pageSize;
    const rows = database
      .prepare(
        "SELECT row_json FROM chat_artifact_rows WHERE artifact_id = ? AND row_index >= ? ORDER BY row_index LIMIT ?",
      )
      .all(artifactId, offset, pageSize)
      .map((row) => parseJson<Record<string, TableCellValue>>((row as { row_json: string }).row_json));
    return assertTableRowPageDto({
      artifactId,
      page,
      pageSize,
      columns: parseJson<TableColumnDto[]>(artifact.columns_json),
      rows,
      snapshotRowCount: artifact.snapshot_row_count,
      totalMatchingRowCount: artifact.total_matching_row_count,
      isTruncated: artifact.is_truncated === 1,
      hasNextPage: offset + rows.length < artifact.snapshot_row_count,
    });
  }, databasePath);
}
