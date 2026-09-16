import { NextRequest } from "next/server";

import { parseCreateMessageRequest } from "@/lib/data-insights/contracts";
import {
  noStoreJson,
  readJson,
  requireSameOrigin,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";
import {
  createFirstSubmission,
  listChats,
} from "@/lib/data-insights/server/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return noStoreJson(listChats(requireUser(request).id));
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const user = requireUser(request);
    const input = parseCreateMessageRequest(await readJson(request));
    return noStoreJson(createFirstSubmission(user.id, input), 202);
  } catch (error) {
    return routeError(error);
  }
}
