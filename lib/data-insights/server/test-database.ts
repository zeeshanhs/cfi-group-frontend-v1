import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

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
  return {
    databasePath,
    cleanup: () => rmSync(directory, { recursive: true, force: true }),
  };
}
