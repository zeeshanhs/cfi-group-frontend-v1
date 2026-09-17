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
    const configured = process.env.CFI_DATA_INSIGHTS_TRANSCRIPTION_SCENARIO;
    const scenario =
      configured === "success" ||
      configured === "empty" ||
      configured === "failed" ||
      configured === "timeout"
        ? configured
        : input.scenario;
    await new Promise((resolve) => setTimeout(resolve, 650));
    let result: TranscriptionResponseDto;
    if (!scenario || scenario === "success") {
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
        code: scenario,
        message: messages[scenario],
        retryable: scenario !== "empty",
      };
    }
    return noStoreJson(result);
  } catch (error) {
    return routeError(error);
  }
}
