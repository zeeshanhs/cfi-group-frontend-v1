import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import { POST as login } from "@/app/api/auth/login/route";
import { GET as getPrompts } from "@/app/api/prompts/route";
import { parsePromptCatalogDto } from "@/lib/data-insights/contracts";
import { withDataInsightsDatabase } from "@/lib/data-insights/server/database";
import { temporaryReportingDatabase } from "@/lib/data-insights/server/test-database";

let cleanup: (() => void) | undefined;

afterEach(() => {
  delete process.env.CFI_DATA_INSIGHTS_DB_PATH;
  cleanup?.();
  cleanup = undefined;
});

async function signIn() {
  const response = await login(
    new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
      },
      body: JSON.stringify({
        email: "jordan.ellis@cfi-demo.example",
        password: "CFI-Demo-2026!",
      }),
    }),
  );
  return (response.headers.get("set-cookie") ?? "").split(";")[0];
}

describe("GET /api/prompts", () => {
  it("requires an active session", async () => {
    const temporary = temporaryReportingDatabase();
    cleanup = temporary.cleanup;
    process.env.CFI_DATA_INSIGHTS_DB_PATH = temporary.databasePath;

    const response = await getPrompts(
      new NextRequest("http://localhost/api/prompts"),
    );
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).error.code).toBe("session_expired");

    const cookie = await signIn();
    withDataInsightsDatabase((database) => {
      database
        .prepare("UPDATE chat_sessions SET expires_at = ?")
        .run("2000-01-01T00:00:00.000Z");
    }, temporary.databasePath);
    const expired = await getPrompts(
      new NextRequest("http://localhost/api/prompts", {
        headers: { Cookie: cookie },
      }),
    );
    expect(expired.status).toBe(401);
    expect((await expired.json()).error.code).toBe("session_expired");
  });

  it("returns a runtime-valid supported-only catalog without caching", async () => {
    const temporary = temporaryReportingDatabase();
    cleanup = temporary.cleanup;
    process.env.CFI_DATA_INSIGHTS_DB_PATH = temporary.databasePath;
    const cookie = await signIn();

    const response = await getPrompts(
      new NextRequest("http://localhost/api/prompts", {
        headers: { Cookie: cookie },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const catalog = parsePromptCatalogDto(await response.json());
    expect(catalog.prompts).toHaveLength(6);
    expect(catalog.prompts.every((prompt) => prompt.availability === "supported")).toBe(true);
  });
});
