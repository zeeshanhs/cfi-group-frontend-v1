import {
  createDateRangeSearchParams,
  getDateRangeFilename,
  resolveDateRangeSearchParams,
  type DateRange,
} from "@/lib/reporting/date-range";

const REPORT_PATH = "/reports/weekly-sales";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export class PdfConfigurationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PdfConfigurationError";
  }
}

export function resolvePdfDateRange(requestUrl: URL) {
  return resolveDateRangeSearchParams(requestUrl.searchParams);
}

function resolveRenderOrigin(requestUrl: URL, configuredOrigin?: string) {
  if (!configuredOrigin) {
    if (!LOOPBACK_HOSTS.has(requestUrl.hostname)) {
      throw new PdfConfigurationError(
        "PDF generation requires REPORT_RENDER_ORIGIN in this environment.",
      );
    }

    return requestUrl.origin;
  }

  let origin: URL;
  try {
    origin = new URL(configuredOrigin);
  } catch (error) {
    throw new PdfConfigurationError(
      "REPORT_RENDER_ORIGIN must be a valid HTTP or HTTPS origin.",
      { cause: error },
    );
  }

  if (!["http:", "https:"].includes(origin.protocol)) {
    throw new PdfConfigurationError(
      "REPORT_RENDER_ORIGIN must use HTTP or HTTPS.",
    );
  }

  return origin.origin;
}

export function buildPdfRenderUrl(
  requestUrl: URL,
  range: DateRange,
  configuredOrigin?: string,
) {
  const renderUrl = new URL(
    REPORT_PATH,
    resolveRenderOrigin(requestUrl, configuredOrigin),
  );
  const params = createDateRangeSearchParams(range);
  params.set("print", "1");
  renderUrl.search = params.toString();
  return renderUrl;
}

export function getPdfFilename(range: DateRange) {
  return getDateRangeFilename(range);
}
