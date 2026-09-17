export const MAX_MESSAGE_CODE_POINTS = 4_000;
export const DEFAULT_ARTIFACT_PAGE_SIZE = 50;
export const MAX_ARTIFACT_PAGE_SIZE = 50;

export type InputMode = "typed" | "voice";
export type MessageRole = "user" | "assistant";
export type RequestState =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "interrupted";

export type ApiErrorDto = {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    requestId: string;
  };
};

export type UserProfileDto = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  designation: string | null;
  department: string | null;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  user: UserProfileDto;
};

export type TableArtifactSummaryDto = {
  id: string;
  type: "table";
  title: string;
  snapshotRowCount: number;
  totalMatchingRowCount: number | null;
  isTruncated: boolean;
  columnCount: number;
};

export type MessageDto = {
  id: string;
  chatId: string;
  sequence: number;
  role: MessageRole;
  content: string | null;
  bodyFormat: "plain" | "markdown";
  bodyMarkdown: string | null;
  createdAt: string;
  requestId: string | null;
  inputMode: InputMode | null;
  attachments: TableArtifactSummaryDto[];
};

export type RequestStatusDto =
  | {
      id: string;
      chatId: string;
      status: "queued" | "running";
      attempt: number;
      retryable: false;
      submittedAt: string;
      readyAt: string;
    }
  | {
      id: string;
      chatId: string;
      status: "completed";
      attempt: number;
      retryable: false;
      submittedAt: string;
      completedAt: string;
      assistantMessage: MessageDto;
    }
  | {
      id: string;
      chatId: string;
      status: "failed" | "interrupted";
      attempt: number;
      retryable: boolean;
      submittedAt: string;
      completedAt: string | null;
      error: {
        code: string;
        message: string;
      };
    };

export type ChatSummaryDto = {
  id: string;
  title: string;
  createdAt: string;
  lastActivityAt: string;
};

export type ChatListDto = {
  chats: ChatSummaryDto[];
};

export type ChatDetailDto = {
  chat: ChatSummaryDto;
  messages: MessageDto[];
  activeRequest: RequestStatusDto | null;
  latestRequest: RequestStatusDto | null;
};

export type CreateMessageRequestDto = {
  content: string;
  inputMode: InputMode;
  clientSubmissionId: string;
};

export type CreateMessageResponseDto = {
  chat: ChatSummaryDto;
  userMessage: MessageDto;
  request: RequestStatusDto;
};

export type TableColumnDataType =
  | "text"
  | "identifier"
  | "integer"
  | "decimal"
  | "date"
  | "timestamp"
  | "boolean"
  | "currency";

export type TableColumnDto = {
  key: string;
  label: string;
  dataType: TableColumnDataType;
  precision?: number;
  currencyKey?: string;
};

export type TableCellValue = string | number | boolean | null;

export type TableArtifactDetailDto = TableArtifactSummaryDto & {
  columns: TableColumnDto[];
  previewRows: Record<string, TableCellValue>[];
  filters: string[];
  provenance: {
    reportingTimezone: "UTC";
    queriedAt: string;
    dataUpdatedThrough: string | null;
    mode: "synthetic";
    dateBasis: string | null;
    periodStart: string | null;
    periodEndExclusive: string | null;
    ordering: string | null;
  };
};

export type TableRowPageDto = {
  artifactId: string;
  page: number;
  pageSize: number;
  columns: TableColumnDto[];
  rows: Record<string, TableCellValue>[];
  snapshotRowCount: number;
  totalMatchingRowCount: number | null;
  isTruncated: boolean;
  hasNextPage: boolean;
};

export type TranscriptionRequestDto = {
  mode: "simulated";
  clientTranscriptionId: string;
  scenario?: "success" | "empty" | "failed" | "timeout";
};

export type TranscriptionResponseDto =
  | {
      mode: "simulated";
      status: "completed";
      transcript: string;
    }
  | {
      mode: "simulated";
      status: "failed";
      code: "empty" | "failed" | "timeout";
      message: string;
      retryable: boolean;
    };

export type PromptAvailability = "supported" | "preview" | "unavailable";

export type PromptCategoryDto = {
  id: string;
  label: string;
  sortOrder: number;
};

export type PromptSummaryDto = {
  id: string;
  title: string;
  promptText: string;
  description: string;
  category: string;
  tags: string[];
  availability: "supported";
  sortOrder: number;
};

export type PromptCatalogDto = {
  revision: string;
  categories: PromptCategoryDto[];
  prompts: PromptSummaryDto[];
};

export class ContractValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "ContractValidationError";
  }
}

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContractValidationError("invalid_json", "Provide a JSON object.");
  }
  return value as Record<string, unknown>;
}

function requiredString(
  value: unknown,
  code: string,
  message: string,
): string {
  if (typeof value !== "string") {
    throw new ContractValidationError(code, message);
  }
  return value;
}

export function parseOpaqueId(value: unknown, label = "identifier"): string {
  const parsed = requiredString(
    value,
    "invalid_id",
    `The ${label} is invalid.`,
  );
  if (!/^[a-z][a-z0-9_-]{2,127}$/i.test(parsed)) {
    throw new ContractValidationError(
      "invalid_id",
      `The ${label} is invalid.`,
    );
  }
  return parsed;
}

export function parseLoginRequest(value: unknown): LoginRequestDto {
  const input = record(value);
  const email = requiredString(
    input.email,
    "invalid_email",
    "Enter your email address.",
  )
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ContractValidationError(
      "invalid_email",
      "Enter an email address in the format name@example.com.",
    );
  }
  const password = requiredString(
    input.password,
    "invalid_password",
    "Enter your password.",
  );
  if (password.length === 0 || password.length > 256) {
    throw new ContractValidationError(
      "invalid_password",
      "Enter your password.",
    );
  }
  return { email, password };
}

export function parseCreateMessageRequest(
  value: unknown,
): CreateMessageRequestDto {
  const input = record(value);
  const content = requiredString(
    input.content,
    "invalid_message",
    "Enter a question before sending.",
  );
  if (content.trim().length === 0) {
    throw new ContractValidationError(
      "invalid_message",
      "Enter a question before sending.",
    );
  }
  if ([...content].length > MAX_MESSAGE_CODE_POINTS) {
    throw new ContractValidationError(
      "message_too_long",
      "Keep your question to 4,000 characters or fewer.",
    );
  }
  const inputMode = input.inputMode;
  if (inputMode !== "typed" && inputMode !== "voice") {
    throw new ContractValidationError(
      "invalid_input_mode",
      "The question input mode is invalid.",
    );
  }
  const clientSubmissionId = parseOpaqueId(
    input.clientSubmissionId,
    "submission identifier",
  );
  return { content, inputMode, clientSubmissionId };
}

export function parseTranscriptionRequest(
  value: unknown,
): TranscriptionRequestDto {
  const input = record(value);
  if (input.mode !== "simulated") {
    throw new ContractValidationError(
      "invalid_transcription_mode",
      "Only simulated transcription is available.",
    );
  }
  const clientTranscriptionId = parseOpaqueId(
    input.clientTranscriptionId,
    "transcription identifier",
  );
  const scenario = input.scenario;
  if (
    scenario !== undefined &&
    scenario !== "success" &&
    scenario !== "empty" &&
    scenario !== "failed" &&
    scenario !== "timeout"
  ) {
    throw new ContractValidationError(
      "invalid_transcription_scenario",
      "The simulated transcription scenario is invalid.",
    );
  }
  return { mode: "simulated", clientTranscriptionId, scenario };
}

function promptRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContractValidationError(
      "invalid_prompt_catalog",
      `The ${label} is invalid.`,
    );
  }
  return value as Record<string, unknown>;
}

function promptText(value: unknown, label: string, maximum: number): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    [...value].length > maximum
  ) {
    throw new ContractValidationError(
      "invalid_prompt_catalog",
      `The ${label} is invalid.`,
    );
  }
  return value;
}

function promptSortOrder(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new ContractValidationError(
      "invalid_prompt_catalog",
      `The ${label} is invalid.`,
    );
  }
  return value as number;
}

export function parsePromptCatalogDto(value: unknown): PromptCatalogDto {
  const input = promptRecord(value, "prompt catalog");
  const revision = promptText(input.revision, "catalog revision", 80);
  if (!Array.isArray(input.categories) || !Array.isArray(input.prompts)) {
    throw new ContractValidationError(
      "invalid_prompt_catalog",
      "The prompt catalog lists are invalid.",
    );
  }

  const categoryIds = new Set<string>();
  const categories = input.categories.map((categoryValue) => {
    const category = promptRecord(categoryValue, "prompt category");
    const id = parseOpaqueId(category.id, "prompt category identifier");
    if (categoryIds.has(id)) {
      throw new ContractValidationError(
        "invalid_prompt_catalog",
        "Prompt category identifiers must be unique.",
      );
    }
    categoryIds.add(id);
    return {
      id,
      label: promptText(category.label, "prompt category label", 60),
      sortOrder: promptSortOrder(
        category.sortOrder,
        "prompt category order",
      ),
    };
  });

  const promptIds = new Set<string>();
  const usedCategoryIds = new Set<string>();
  const prompts = input.prompts.map((promptValue) => {
    const prompt = promptRecord(promptValue, "prompt record");
    const id = parseOpaqueId(prompt.id, "prompt identifier");
    if (promptIds.has(id)) {
      throw new ContractValidationError(
        "invalid_prompt_catalog",
        "Prompt identifiers must be unique.",
      );
    }
    promptIds.add(id);
    const category = parseOpaqueId(
      prompt.category,
      "prompt category identifier",
    );
    if (!categoryIds.has(category)) {
      throw new ContractValidationError(
        "invalid_prompt_catalog",
        "Every prompt must use a published category.",
      );
    }
    if (prompt.availability !== "supported") {
      throw new ContractValidationError(
        "invalid_prompt_catalog",
        "Only supported prompts may be published.",
      );
    }
    if (!Array.isArray(prompt.tags)) {
      throw new ContractValidationError(
        "invalid_prompt_catalog",
        "Prompt tags must be a list.",
      );
    }
    const tags = prompt.tags.map((tag) =>
      promptText(tag, "prompt tag", 40),
    );
    usedCategoryIds.add(category);
    return {
      id,
      title: promptText(prompt.title, "prompt title", 100),
      promptText: promptText(prompt.promptText, "inserted prompt text", 4_000),
      description: promptText(prompt.description, "prompt description", 240),
      category,
      tags,
      availability: "supported" as const,
      sortOrder: promptSortOrder(prompt.sortOrder, "prompt order"),
    };
  });

  if (categories.some((category) => !usedCategoryIds.has(category.id))) {
    throw new ContractValidationError(
      "invalid_prompt_catalog",
      "Every published prompt category must contain a supported prompt.",
    );
  }

  return { revision, categories, prompts };
}

function parsePositiveInteger(
  raw: string | null,
  fallback: number,
  maximum: number,
  label: string,
): number {
  if (raw === null) return fallback;
  if (!/^[1-9]\d*$/.test(raw)) {
    throw new ContractValidationError(
      "invalid_pagination",
      `The ${label} must be a positive integer.`,
    );
  }
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new ContractValidationError(
      "invalid_pagination",
      `The ${label} is outside the supported range.`,
    );
  }
  return parsed;
}

export function parseArtifactPagination(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
} {
  if (
    searchParams.getAll("page").length > 1 ||
    searchParams.getAll("pageSize").length > 1
  ) {
    throw new ContractValidationError(
      "invalid_pagination",
      "Provide one page and page size.",
    );
  }
  return {
    page: parsePositiveInteger(
      searchParams.get("page"),
      1,
      100_000,
      "page",
    ),
    pageSize: parsePositiveInteger(
      searchParams.get("pageSize"),
      DEFAULT_ARTIFACT_PAGE_SIZE,
      MAX_ARTIFACT_PAGE_SIZE,
      "page size",
    ),
  };
}

function assertUtcTimestamp(value: string, label: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    throw new ContractValidationError(
      "invalid_response",
      `${label} must include a UTC offset.`,
    );
  }
}

export function assertUserProfileDto(value: UserProfileDto): UserProfileDto {
  parseOpaqueId(value.id, "user identifier");
  assertUtcSafeText(value.displayName, "display name");
  if (!value.email.includes("@")) {
    throw new ContractValidationError(
      "invalid_response",
      "The profile email is invalid.",
    );
  }
  return value;
}

export function assertChatSummaryDto(value: ChatSummaryDto): ChatSummaryDto {
  parseOpaqueId(value.id, "chat identifier");
  assertUtcSafeText(value.title, "chat title");
  assertUtcTimestamp(value.createdAt, "Chat creation timestamp");
  assertUtcTimestamp(value.lastActivityAt, "Chat activity timestamp");
  return value;
}

export function assertMessageDto(value: MessageDto): MessageDto {
  parseOpaqueId(value.id, "message identifier");
  parseOpaqueId(value.chatId, "chat identifier");
  assertUtcTimestamp(value.createdAt, "Message timestamp");
  if (value.role === "assistant") {
    if (
      value.bodyFormat !== "markdown" ||
      typeof value.bodyMarkdown !== "string" ||
      value.bodyMarkdown.trim().length === 0
    ) {
      throw new ContractValidationError(
        "invalid_response",
        "A completed assistant message must contain Markdown.",
      );
    }
  }
  return value;
}

export function assertRequestStatusDto(
  value: RequestStatusDto,
): RequestStatusDto {
  parseOpaqueId(value.id, "request identifier");
  parseOpaqueId(value.chatId, "chat identifier");
  assertUtcTimestamp(value.submittedAt, "Request timestamp");
  if (value.status === "queued" || value.status === "running") {
    assertUtcTimestamp(value.readyAt, "Request ready timestamp");
  }
  if (value.status === "completed") {
    assertUtcTimestamp(value.completedAt, "Request completion timestamp");
    assertMessageDto(value.assistantMessage);
  }
  if (
    (value.status === "failed" || value.status === "interrupted") &&
    value.completedAt !== null
  ) {
    assertUtcTimestamp(value.completedAt, "Request completion timestamp");
  }
  return value;
}

export function assertTableArtifactDetailDto(
  value: TableArtifactDetailDto,
): TableArtifactDetailDto {
  parseOpaqueId(value.id, "artifact identifier");
  if (value.columns.length === 0 || value.columnCount !== value.columns.length) {
    throw new ContractValidationError(
      "invalid_response",
      "The artifact schema is invalid.",
    );
  }
  assertColumns(value.columns);
  for (const row of value.previewRows) assertTableRow(row, value.columns);
  assertUtcTimestamp(value.provenance.queriedAt, "Query timestamp");
  if (value.provenance.periodStart !== null) assertUtcTimestamp(value.provenance.periodStart, "Period start");
  if (value.provenance.periodEndExclusive !== null) assertUtcTimestamp(value.provenance.periodEndExclusive, "Period end");
  if (value.provenance.dateBasis !== null) assertUtcSafeText(value.provenance.dateBasis, "date basis");
  if (value.provenance.ordering !== null) assertUtcSafeText(value.provenance.ordering, "ordering");
  return value;
}

export function assertTableRowPageDto(
  value: TableRowPageDto,
): TableRowPageDto {
  parseOpaqueId(value.artifactId, "artifact identifier");
  assertColumns(value.columns);
  for (const row of value.rows) assertTableRow(row, value.columns);
  if (value.rows.length > value.pageSize) {
    throw new ContractValidationError(
      "invalid_response",
      "The artifact page contains too many rows.",
    );
  }
  return value;
}

function assertTableRow(
  row: Record<string, TableCellValue>,
  columns: TableColumnDto[],
) {
  const keys = new Set(columns.map((column) => column.key));
  if (Object.keys(row).some((key) => !keys.has(key))) {
    throw new ContractValidationError(
      "invalid_response",
      "The artifact row contains an unknown field.",
    );
  }
  for (const value of Object.values(row)) {
    if (
      value !== null &&
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    ) {
      throw new ContractValidationError(
        "invalid_response",
        "The artifact row contains an unsafe value.",
      );
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new ContractValidationError(
        "invalid_response",
        "The artifact row contains a non-finite number.",
      );
    }
  }
}

function assertColumns(columns: TableColumnDto[]) {
  const supportedTypes = new Set<TableColumnDataType>([
    "text",
    "identifier",
    "integer",
    "decimal",
    "date",
    "timestamp",
    "boolean",
    "currency",
  ]);
  const keys = new Set<string>();
  for (const column of columns) {
    parseOpaqueId(column.key, "column key");
    assertUtcSafeText(column.label, "column label");
    if (keys.has(column.key) || !supportedTypes.has(column.dataType)) {
      throw new ContractValidationError(
        "invalid_response",
        "The artifact schema is invalid.",
      );
    }
    keys.add(column.key);
  }
}

function assertUtcSafeText(value: string, label: string) {
  if (value.trim().length === 0) {
    throw new ContractValidationError(
      "invalid_response",
      `The ${label} is empty.`,
    );
  }
}
