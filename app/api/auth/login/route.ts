import { NextRequest } from "next/server";

import { parseLoginRequest } from "@/lib/data-insights/contracts";
import {
  authenticateCredentials,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/data-insights/server/auth";
import {
  HttpRequestError,
  noStoreJson,
  readJson,
  requireSameOrigin,
  routeError,
} from "@/lib/data-insights/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const credentials = parseLoginRequest(await readJson(request));
    const session = authenticateCredentials(
      credentials.email,
      credentials.password,
    );
    if (!session) {
      throw new HttpRequestError(
        "credentials_rejected",
        "The email or password is incorrect.",
        401,
      );
    }
    const response = noStoreJson({ user: session.user });
    response.cookies.set(SESSION_COOKIE_NAME, session.rawToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
      expires: new Date(session.expiresAt),
    });
    return response;
  } catch (error) {
    return routeError(error);
  }
}
