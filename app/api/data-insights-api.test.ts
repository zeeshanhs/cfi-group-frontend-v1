import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import { POST as login } from "@/app/api/auth/login/route";
import { GET as listChats, POST as createChat } from "@/app/api/chats/route";
import { GET as getMessages } from "@/app/api/chats/[chatId]/messages/route";
import { GET as getMe } from "@/app/api/me/route";
import { GET as getRequest } from "@/app/api/requests/[requestId]/route";
import { withDataInsightsDatabase } from "@/lib/data-insights/server/database";
import { temporaryReportingDatabase } from "@/lib/data-insights/server/test-database";

let cleanup: (() => void) | undefined;

afterEach(() => {
  delete process.env.CFI_DATA_INSIGHTS_DB_PATH;
  cleanup?.();
  cleanup = undefined;
});

function jsonRequest(
  url: string,
  body: unknown,
  cookie?: string,
  origin = "http://localhost",
) {
  const headers = new Headers({
    "Content-Type": "application/json",
    Origin: origin,
  });
  if (cookie) headers.set("Cookie", cookie);
  return new NextRequest(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function signIn(email: string) {
  const response = await login(
    jsonRequest("http://localhost/api/auth/login", {
      email,
      password: "CFI-Demo-2026!",
    }),
  );
  const setCookie = response.headers.get("set-cookie") ?? "";
  return {
    response,
    cookie: setCookie.split(";")[0],
  };
}

describe("Data Insights route handlers", () => {
  it("uses no-store session APIs and enforces same-origin mutations", async () => {
    const temporary = temporaryReportingDatabase();
    cleanup = temporary.cleanup;
    process.env.CFI_DATA_INSIGHTS_DB_PATH = temporary.databasePath;

    const denied = await login(
      jsonRequest(
        "http://localhost/api/auth/login",
        {
          email: "jordan.ellis@cfi-demo.example",
          password: "CFI-Demo-2026!",
        },
        undefined,
        "https://attacker.example",
      ),
    );
    expect(denied.status).toBe(403);

    const signedIn = await signIn("jordan.ellis@cfi-demo.example");
    expect(signedIn.response.status).toBe(200);
    expect(signedIn.response.headers.get("cache-control")).toBe("no-store");
    expect(signedIn.response.headers.get("set-cookie")).toContain("HttpOnly");

    const me = await getMe(
      new NextRequest("http://localhost/api/me", {
        headers: { Cookie: signedIn.cookie },
      }),
    );
    expect(me.status).toBe(200);
    expect((await me.json()).user.id).toBe("user_jordan");
  });

  it("runs the persisted Casey journey through handlers and hides it from Riley", async () => {
    const temporary = temporaryReportingDatabase();
    cleanup = temporary.cleanup;
    process.env.CFI_DATA_INSIGHTS_DB_PATH = temporary.databasePath;
    const jordan = await signIn("jordan.ellis@cfi-demo.example");

    const createdResponse = await createChat(
      jsonRequest(
        "http://localhost/api/chats",
        {
          content:
            "How many bids did Casey Patel create in the past seven days?",
          inputMode: "typed",
          clientSubmissionId: "submission_handler_001",
        },
        jordan.cookie,
      ),
    );
    expect(createdResponse.status).toBe(202);
    const created = await createdResponse.json();
    withDataInsightsDatabase((database) => {
      database
        .prepare("UPDATE chat_requests SET ready_at = ? WHERE id = ?")
        .run("2000-01-01T00:00:00.000Z", created.request.id);
    }, temporary.databasePath);

    const running = await getRequest(
      new NextRequest(`http://localhost/api/requests/${created.request.id}`, {
        headers: { Cookie: jordan.cookie },
      }),
      { params: Promise.resolve({ requestId: created.request.id }) },
    );
    expect((await running.json()).status).toBe("running");
    withDataInsightsDatabase((database) => {
      database
        .prepare("UPDATE chat_requests SET ready_at = ? WHERE id = ?")
        .run("2000-01-01T00:00:00.000Z", created.request.id);
    }, temporary.databasePath);
    const status = await getRequest(
      new NextRequest(`http://localhost/api/requests/${created.request.id}`, {
        headers: { Cookie: jordan.cookie },
      }),
      { params: Promise.resolve({ requestId: created.request.id }) },
    );
    expect(status.status).toBe(200);
    expect((await status.json()).assistantMessage.bodyMarkdown).toContain(
      "Casey Patel created 18 bids",
    );

    const history = await listChats(
      new NextRequest("http://localhost/api/chats", {
        headers: { Cookie: jordan.cookie },
      }),
    );
    expect((await history.json()).chats).toHaveLength(1);

    const riley = await signIn("riley.chen@cfi-demo.example");
    const altered = await getMessages(
      new NextRequest(
        `http://localhost/api/chats/${created.chat.id}/messages`,
        { headers: { Cookie: riley.cookie } },
      ),
      { params: Promise.resolve({ chatId: created.chat.id }) },
    );
    expect(altered.status).toBe(404);
    expect((await altered.json()).error.code).toBe("resource_unavailable");
  });
});
