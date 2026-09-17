import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

export function temporaryReportingDatabase() {
  const directory = mkdtempSync(path.join(tmpdir(), "cfi-data-insights-"));
  const databasePath = path.join(directory, "reporting.sqlite");
  copyFileSync(
    path.join(
      process.cwd(),
      "_PROJECT/data/reporting/cfi_reporting.sqlite",
    ),
    databasePath,
  );
  const database = new Database(databasePath);
  try {
    const applicationTables = [
      "chat_artifact_rows",
      "chat_artifacts",
      "chat_request_attempts",
      "chat_requests",
      "chat_messages",
      "chats",
      "chat_sessions",
    ];
    const existingTables = new Set(
      database
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((row) => (row as { name: string }).name),
    );
    const clearApplicationState = database.transaction(() => {
      for (const table of applicationTables) {
        if (existingTables.has(table)) database.exec(`DELETE FROM ${table}`);
      }
    });
    clearApplicationState();
  } finally {
    database.close();
  }
  return {
    databasePath,
    cleanup: () => rmSync(directory, { recursive: true, force: true }),
  };
}
