import { NextRequest } from "next/server";

import { parsePromptCatalogDto } from "@/lib/data-insights/contracts";
import {
  noStoreJson,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";
import { getPromptCatalog } from "@/lib/data-insights/server/prompt-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    requireUser(request);
    return noStoreJson(parsePromptCatalogDto(getPromptCatalog()));
  } catch (error) {
    return routeError(error);
  }
}
