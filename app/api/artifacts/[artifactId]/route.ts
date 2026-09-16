import { NextRequest } from "next/server";

import { parseOpaqueId } from "@/lib/data-insights/contracts";
import {
  noStoreJson,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";
import { getArtifactDetail } from "@/lib/data-insights/server/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ artifactId: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = requireUser(request);
    const artifactId = parseOpaqueId(
      (await context.params).artifactId,
      "artifact identifier",
    );
    return noStoreJson(getArtifactDetail(user.id, artifactId));
  } catch (error) {
    return routeError(error);
  }
}
