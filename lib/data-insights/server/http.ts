import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  ContractValidationError,
  type ApiErrorDto,
  type UserProfileDto,
} from "@/lib/data-insights/contracts";
import {
  SESSION_COOKIE_NAME,
  userForSession,
} from "@/lib/data-insights/server/auth";
import { DataInsightsDatabaseError } from "@/lib/data-insights/server/database";
import { DataInsightsServiceError } from "@/lib/data-insights/server/service";

export class HttpRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "HttpRequestError";
  }
}

export function noStoreJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function readJson(request: NextRequest): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new HttpRequestError(
      "invalid_content_type",
      "Send this request as JSON.",
      415,
    );
  }
  try {
    return await request.json();
  } catch {
    throw new ContractValidationError("invalid_json", "Provide valid JSON.");
  }
}

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    (origin && origin !== request.nextUrl.origin) ||
    (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none")
  ) {
    throw new HttpRequestError(
      "cross_origin_rejected",
      "This request must come from the Data Insights application.",
      403,
    );
  }
}

export function requireUser(request: NextRequest): UserProfileDto {
  const user = userForSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!user) {
    throw new HttpRequestError(
      "session_expired",
      "Your session has expired. Sign in again.",
      401,
    );
  }
  return user;
}

export function routeError(error: unknown) {
  const requestId = `error_${randomUUID()}`;
  let code = "service_unavailable";
  let message = "Data Insights is temporarily unavailable. Try again.";
  let status = 500;
  let retryable = true;

  if (error instanceof ContractValidationError) {
    code = error.code;
    message = error.message;
    status = 400;
    retryable = false;
  } else if (
    error instanceof HttpRequestError ||
    error instanceof DataInsightsServiceError
  ) {
    code = error.code;
    message = error.message;
    status = error.status;
    retryable = error.retryable;
  } else if (error instanceof DataInsightsDatabaseError) {
    code = "service_unavailable";
    status = 503;
  }

  const body: ApiErrorDto = {
    error: { code, message, retryable, requestId },
  };
  return noStoreJson(body, status);
}
