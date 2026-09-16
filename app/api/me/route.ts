import { NextRequest } from "next/server";

import {
  noStoreJson,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return noStoreJson({ user: requireUser(request) });
  } catch (error) {
    return routeError(error);
  }
}
