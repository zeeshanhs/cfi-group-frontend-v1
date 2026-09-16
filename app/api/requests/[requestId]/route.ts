import { NextRequest } from "next/server";

import { parseOpaqueId } from "@/lib/data-insights/contracts";
import {
  noStoreJson,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";
import { getRequestStatus } from "@/lib/data-insights/server/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ requestId: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = requireUser(request);
    const requestId = parseOpaqueId(
      (await context.params).requestId,
      "request identifier",
    );
    return noStoreJson(getRequestStatus(user.id, requestId));
  } catch (error) {
    return routeError(error);
  }
}
