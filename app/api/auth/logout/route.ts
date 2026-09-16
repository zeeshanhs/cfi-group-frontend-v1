import { NextRequest } from "next/server";

import {
  revokeSession,
  SESSION_COOKIE_NAME,
} from "@/lib/data-insights/server/auth";
import {
  noStoreJson,
  requireSameOrigin,
  routeError,
} from "@/lib/data-insights/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    revokeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    const response = noStoreJson({ loggedOut: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return routeError(error);
  }
}
