import { NextRequest } from "next/server";

import {
  parseTranscriptionRequest,
  type TranscriptionResponseDto,
} from "@/lib/data-insights/contracts";
import {
  noStoreJson,
  readJson,
  requireSameOrigin,
  requireUser,
  routeError,
} from "@/lib/data-insights/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    requireUser(request);
    const input = parseTranscriptionRequest(await readJson(request));
    let result: TranscriptionResponseDto;
    if (!input.scenario || input.scenario === "success") {
      result = {
        mode: "simulated",
        status: "completed",
        transcript:
          "How many bids did Casey Patel create in the past seven days?",
      };
    } else {
      const messages = {
        empty: "The simulated recording did not contain any words.",
        failed: "The simulated transcription could not be completed.",
        timeout: "The simulated transcription timed out.",
      } as const;
      result = {
        mode: "simulated",
        status: "failed",
        code: input.scenario,
        message: messages[input.scenario],
        retryable: input.scenario !== "empty",
      };
    }
    return noStoreJson(result);
  } catch (error) {
    return routeError(error);
  }
}
