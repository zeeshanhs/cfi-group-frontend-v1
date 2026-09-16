import { NextRequest } from "next/server";

import { parseOpaqueId } from "@/lib/data-insights/contracts";
import {
  noStoreJson,
  requireSameOrigin,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";
import { retryRequest } from "@/lib/data-insights/server/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ requestId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    requireSameOrigin(request);
    const user = requireUser(request);
    const requestId = parseOpaqueId(
      (await context.params).requestId,
      "request identifier",
    );
    return noStoreJson(retryRequest(user.id, requestId), 202);
  } catch (error) {
    return routeError(error);
  }
}
