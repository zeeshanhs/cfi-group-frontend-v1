import path from "node:path";

import Database from "better-sqlite3";

export const DEFAULT_REPORTING_DATABASE_PATH = path.join(
  process.cwd(),
  "_PROJECT/data/reporting/cfi_reporting.sqlite",
);

export class ReportingDatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ReportingDatabaseError";
  }
}

export function resolveReportingDatabasePath(databasePath?: string) {
  if (!databasePath) {
    return DEFAULT_REPORTING_DATABASE_PATH;
  }

  if (!path.isAbsolute(databasePath)) {
    throw new ReportingDatabaseError(
      "A reporting database override must be an absolute path.",
    );
  }

  return databasePath;
}

export function withReadOnlyDatabase<T>(
  callback: (database: Database.Database) => T,
  databasePath?: string,
): T {
  const resolvedPath = resolveReportingDatabasePath(databasePath);
  let database: Database.Database;

  try {
    database = new Database(resolvedPath, {
      readonly: true,
      fileMustExist: true,
    });
    database.pragma("query_only = ON");
  } catch (error) {
    throw new ReportingDatabaseError(
      "The local reporting database could not be opened.",
      { cause: error },
    );
  }

  try {
    return callback(database);
  } finally {
    database.close();
  }
}
