import { createHash, randomBytes } from "node:crypto";

import type Database from "better-sqlite3";

import type { UserProfileDto } from "@/lib/data-insights/contracts";
import { assertUserProfileDto } from "@/lib/data-insights/contracts";
import {
  verifyPassword,
  withDataInsightsDatabase,
} from "@/lib/data-insights/server/database";

export const SESSION_COOKIE_NAME = "cfi_data_insights_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type UserRow = {
  id: string;
  normalized_email: string;
  password_verifier: string;
  first_name: string;
  last_name: string;
  display_name: string;
  initials: string;
  avatar_url: string | null;
  designation: string | null;
  department: string | null;
};

function profileFromRow(row: UserRow): UserProfileDto {
  return assertUserProfileDto({
    id: row.id,
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.normalized_email,
    initials: row.initials,
    avatarUrl: row.avatar_url,
    designation: row.designation,
    department: row.department,
  });
}

function tokenHash(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function authenticateCredentials(
  email: string,
  password: string,
  databasePath?: string,
): { user: UserProfileDto; rawToken: string; expiresAt: string } | null {
  return withDataInsightsDatabase((database) => {
    const row = database
      .prepare("SELECT * FROM chat_users WHERE normalized_email = ?")
      .get(email) as UserRow | undefined;
    if (!row || !verifyPassword(password, row.password_verifier)) return null;

    const rawToken = randomBytes(32).toString("base64url");
    const createdAt = new Date();
    const expiresAt = new Date(
      createdAt.getTime() + SESSION_MAX_AGE_SECONDS * 1_000,
    ).toISOString();
    database
      .prepare(
        "INSERT INTO chat_sessions (token_hash, user_id, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, NULL)",
      )
      .run(tokenHash(rawToken), row.id, createdAt.toISOString(), expiresAt);
    return { user: profileFromRow(row), rawToken, expiresAt };
  }, databasePath);
}

export function userForSession(
  rawToken: string | undefined,
  databasePath?: string,
): UserProfileDto | null {
  if (!rawToken) return null;
  return withDataInsightsDatabase((database) => {
    const row = database
      .prepare(`
        SELECT u.*
        FROM chat_sessions s
        JOIN chat_users u ON u.id = s.user_id
        WHERE s.token_hash = ?
          AND s.revoked_at IS NULL
          AND s.expires_at > ?
      `)
      .get(tokenHash(rawToken), new Date().toISOString()) as UserRow | undefined;
    return row ? profileFromRow(row) : null;
  }, databasePath);
}

export function revokeSession(
  rawToken: string | undefined,
  databasePath?: string,
) {
  if (!rawToken) return;
  withDataInsightsDatabase((database) => {
    database
      .prepare(
        "UPDATE chat_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL",
      )
      .run(new Date().toISOString(), tokenHash(rawToken));
  }, databasePath);
}

export function readScopeKey(database: Database.Database, userId: string) {
  const row = database
    .prepare("SELECT scope_key FROM chat_users WHERE id = ?")
    .get(userId) as { scope_key: string } | undefined;
  return row?.scope_key ?? null;
}
