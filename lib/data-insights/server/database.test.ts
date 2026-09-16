import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

import {
  authenticateCredentials,
  revokeSession,
  userForSession,
} from "./auth";
import { withDataInsightsDatabase } from "./database";
import { temporaryReportingDatabase } from "./test-database";

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe("Data Insights database and sessions", () => {
  it("migrates repeatedly, enables foreign keys, and seeds users once", () => {
    const temporary = temporaryReportingDatabase();
    cleanup = temporary.cleanup;

    for (let index = 0; index < 2; index += 1) {
      withDataInsightsDatabase((database) => {
        expect(database.pragma("foreign_keys", { simple: true })).toBe(1);
      }, temporary.databasePath);
    }

    const database = new Database(temporary.databasePath, {
      readonly: true,
    });
    expect(
      database
        .prepare("SELECT COUNT(*) AS count FROM chat_schema_migrations")
        .get(),
    ).toEqual({ count: 1 });
    expect(
      database.prepare("SELECT COUNT(*) AS count FROM chat_users").get(),
    ).toEqual({ count: 2 });
    database.close();
  });

  it("authenticates a provisioned demo account and invalidates logout", () => {
    const temporary = temporaryReportingDatabase();
    cleanup = temporary.cleanup;

    expect(
      authenticateCredentials(
        "jordan.ellis@cfi-demo.example",
        "not-the-password",
        temporary.databasePath,
      ),
    ).toBeNull();
    const session = authenticateCredentials(
      "jordan.ellis@cfi-demo.example",
      "CFI-Demo-2026!",
      temporary.databasePath,
    );
    expect(session?.user.displayName).toBe("Jordan Ellis");
    expect(userForSession(session?.rawToken, temporary.databasePath)?.id).toBe(
      "user_jordan",
    );

    revokeSession(session?.rawToken, temporary.databasePath);
    expect(userForSession(session?.rawToken, temporary.databasePath)).toBeNull();
  });

  it("rejects expired sessions without deleting their history", () => {
    const temporary = temporaryReportingDatabase();
    cleanup = temporary.cleanup;
    const session = authenticateCredentials(
      "riley.chen@cfi-demo.example",
      "CFI-Demo-2026!",
      temporary.databasePath,
    );
    expect(session).not.toBeNull();

    withDataInsightsDatabase((database) => {
      database
        .prepare("UPDATE chat_sessions SET expires_at = ?")
        .run("2000-01-01T00:00:00.000Z");
    }, temporary.databasePath);
    expect(userForSession(session?.rawToken, temporary.databasePath)).toBeNull();
  });
});
