import path from "node:path";
import { scryptSync, timingSafeEqual } from "node:crypto";

import Database from "better-sqlite3";

export const DEFAULT_DATA_INSIGHTS_DATABASE_PATH = path.join(
  process.cwd(),
  "_PROJECT/data/reporting/cfi_reporting.sqlite",
);

const DATABASE_OVERRIDE_ENV = "CFI_DATA_INSIGHTS_DB_PATH";

const USER_SEEDS = [
  {
    id: "user_jordan",
    email: "jordan.ellis@cfi-demo.example",
    passwordVerifier:
      "cfi-jordan-demo-v1:5cd77ac5c3e3e45c7351160f0a9901eed29b3fc5eb48114ce686773e66706cae",
    firstName: "Jordan",
    lastName: "Ellis",
    displayName: "Jordan Ellis",
    designation: "Business Development Manager",
    department: "Estimating",
    initials: "JE",
    scopeKey: "scope_a",
  },
  {
    id: "user_riley",
    email: "riley.chen@cfi-demo.example",
    passwordVerifier:
      "cfi-riley-demo-v1:85b761bc593e6c94c154720a16a15c96bd5dd919561c269e81677ecafb737aec",
    firstName: "Riley",
    lastName: "Chen",
    displayName: "Riley Chen",
    designation: null,
    department: null,
    initials: "RC",
    scopeKey: "scope_b",
  },
] as const;

const MIGRATION_001 = `
CREATE TABLE IF NOT EXISTS chat_schema_migrations (
  migration_id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_users (
  id TEXT PRIMARY KEY,
  normalized_email TEXT NOT NULL UNIQUE,
  password_verifier TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  initials TEXT NOT NULL,
  avatar_url TEXT,
  designation TEXT,
  department TEXT,
  scope_key TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user
  ON chat_sessions(user_id, expires_at);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chats_owner_activity
  ON chats(owner_user_id, last_activity_at DESC, id ASC);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL CHECK(sequence > 0),
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  body_format TEXT NOT NULL CHECK(body_format IN ('plain', 'markdown')),
  body_content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  request_id TEXT,
  input_mode TEXT CHECK(input_mode IN ('typed', 'voice')),
  UNIQUE(chat_id, sequence)
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order
  ON chat_messages(chat_id, sequence);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_one_assistant_per_request
  ON chat_messages(request_id)
  WHERE role = 'assistant' AND request_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS chat_requests (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_message_id TEXT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  client_submission_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('queued', 'running', 'completed', 'failed', 'interrupted')),
  active_attempt INTEGER NOT NULL CHECK(active_attempt > 0),
  result_message_id TEXT REFERENCES chat_messages(id),
  plan_json TEXT NOT NULL,
  resolved_context_json TEXT,
  submitted_at TEXT NOT NULL,
  ready_at TEXT NOT NULL,
  started_at TEXT,
  ended_at TEXT,
  failure_code TEXT,
  failure_message TEXT,
  retryable INTEGER NOT NULL DEFAULT 0 CHECK(retryable IN (0, 1)),
  UNIQUE(owner_user_id, client_submission_id),
  UNIQUE(result_message_id)
);
CREATE INDEX IF NOT EXISTS idx_chat_requests_chat
  ON chat_requests(chat_id, submitted_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_requests_one_active_per_chat
  ON chat_requests(chat_id)
  WHERE status IN ('queued', 'running');

CREATE TABLE IF NOT EXISTS chat_request_attempts (
  request_id TEXT NOT NULL REFERENCES chat_requests(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK(attempt_number > 0),
  status TEXT NOT NULL CHECK(status IN ('queued', 'running', 'completed', 'failed', 'interrupted')),
  started_at TEXT,
  ended_at TEXT,
  failure_code TEXT,
  PRIMARY KEY(request_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS chat_artifacts (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  assistant_message_id TEXT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK(artifact_type = 'table'),
  columns_json TEXT NOT NULL,
  snapshot_row_count INTEGER NOT NULL CHECK(snapshot_row_count >= 0),
  total_matching_row_count INTEGER CHECK(total_matching_row_count >= 0),
  is_truncated INTEGER NOT NULL CHECK(is_truncated IN (0, 1)),
  filters_json TEXT NOT NULL,
  provenance_json TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_artifacts_owner_chat
  ON chat_artifacts(owner_user_id, chat_id, created_at);

CREATE TABLE IF NOT EXISTS chat_artifact_rows (
  artifact_id TEXT NOT NULL REFERENCES chat_artifacts(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL CHECK(row_index >= 0),
  row_json TEXT NOT NULL,
  PRIMARY KEY(artifact_id, row_index)
);
CREATE INDEX IF NOT EXISTS idx_chat_artifact_rows_page
  ON chat_artifact_rows(artifact_id, row_index);
`;

export class DataInsightsDatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DataInsightsDatabaseError";
  }
}

export function resolveDataInsightsDatabasePath(databasePath?: string) {
  const candidate =
    databasePath ?? process.env[DATABASE_OVERRIDE_ENV] ?? DEFAULT_DATA_INSIGHTS_DATABASE_PATH;
  if (!path.isAbsolute(candidate)) {
    throw new DataInsightsDatabaseError(
      "The Data Insights database path must be absolute.",
    );
  }
  return candidate;
}

function migrate(database: Database.Database) {
  database.pragma("foreign_keys = ON");
  const foreignKeys = database.pragma("foreign_keys", { simple: true });
  if (foreignKeys !== 1) {
    throw new DataInsightsDatabaseError("SQLite foreign keys are unavailable.");
  }

  const transaction = database.transaction(() => {
    database.exec(MIGRATION_001);
    const now = new Date().toISOString();
    database
      .prepare(
        "INSERT OR IGNORE INTO chat_schema_migrations (migration_id, applied_at) VALUES (?, ?)",
      )
      .run("001_data_insights_chat", now);

    const insertUser = database.prepare(`
      INSERT OR IGNORE INTO chat_users (
        id, normalized_email, password_verifier, first_name, last_name,
        display_name, initials, avatar_url, designation, department, scope_key,
        created_at
      ) VALUES (
        @id, @email, @passwordVerifier, @firstName, @lastName,
        @displayName, @initials, NULL, @designation, @department, @scopeKey,
        @createdAt
      )
    `);
    for (const seed of USER_SEEDS) {
      insertUser.run({ ...seed, createdAt: now });
    }
  });
  transaction();
}

export function withDataInsightsDatabase<T>(
  callback: (database: Database.Database) => T,
  databasePath?: string,
): T {
  const resolvedPath = resolveDataInsightsDatabasePath(databasePath);
  let database: Database.Database | undefined;
  try {
    database = new Database(resolvedPath, { fileMustExist: true });
    database.pragma("busy_timeout = 5000");
    migrate(database);
  } catch (error) {
    database?.close();
    throw new DataInsightsDatabaseError(
      "The Data Insights database could not be opened.",
      { cause: error },
    );
  }

  if (!database) {
    throw new DataInsightsDatabaseError(
      "The Data Insights database could not be opened.",
    );
  }

  try {
    return callback(database);
  } finally {
    database.close();
  }
}

export function verifyPassword(password: string, verifier: string) {
  const [salt, expectedHex, extra] = verifier.split(":");
  if (!salt || !expectedHex || extra !== undefined) return false;
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== 32) return false;
  const actual = scryptSync(password, salt, 32);
  return timingSafeEqual(actual, expected);
}
