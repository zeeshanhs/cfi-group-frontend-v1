import { NextRequest } from "next/server";

import {
  parseCreateMessageRequest,
  parseOpaqueId,
} from "@/lib/data-insights/contracts";
import {
  noStoreJson,
  readJson,
  requireSameOrigin,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";
import {
  createFollowUp,
  getChatDetail,
} from "@/lib/data-insights/server/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ chatId: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = requireUser(request);
    const chatId = parseOpaqueId((await context.params).chatId, "chat identifier");
    return noStoreJson(getChatDetail(user.id, chatId));
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    requireSameOrigin(request);
    const user = requireUser(request);
    const chatId = parseOpaqueId((await context.params).chatId, "chat identifier");
    const input = parseCreateMessageRequest(await readJson(request));
    return noStoreJson(createFollowUp(user.id, chatId, input), 202);
  } catch (error) {
    return routeError(error);
  }
}
