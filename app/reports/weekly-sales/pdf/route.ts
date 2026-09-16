import puppeteer from "puppeteer";

export const runtime = "nodejs";

const PDF_FILENAME = "cfi-weekly-sales-summary-2026-09-13.pdf";
const REPORT_PATH = "/reports/weekly-sales?print=1";

class PdfConfigurationError extends Error {}

function resolveRenderUrl(request: Request) {
  const configuredOrigin = process.env.REPORT_RENDER_ORIGIN;
  const requestUrl = new URL(request.url);

  if (!configuredOrigin) {
    if (!["localhost", "127.0.0.1", "::1"].includes(requestUrl.hostname)) {
      throw new PdfConfigurationError(
        "PDF generation requires REPORT_RENDER_ORIGIN in this environment.",
      );
    }

    return new URL(REPORT_PATH, requestUrl.origin);
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

  origin.pathname = "/";
  origin.search = "";
  origin.hash = "";
  return new URL(REPORT_PATH, origin);
}

export async function GET(request: Request) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;

  try {
    const renderUrl = resolveRenderUrl(request);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.emulateMediaType("print");
    await page.goto(renderUrl.toString(), {
      waitUntil: "networkidle0",
      timeout: 45_000,
    });
    await page.waitForSelector("[data-report-ready=\"true\"]", {
      timeout: 15_000,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const pdf = await page.pdf({
      format: "letter",
      landscape: true,
      preferCSSPageSize: true,
      printBackground: true,
    });

    if (pdf.byteLength === 0) {
      throw new Error("The report renderer returned an empty PDF.");
    }

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${PDF_FILENAME}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    const status = error instanceof PdfConfigurationError ? 503 : 500;
    const message =
      error instanceof PdfConfigurationError
        ? error.message
        : "The weekly sales PDF could not be generated. Please try again.";

    console.error("Weekly sales PDF generation failed", error);
    return new Response(message, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } finally {
    await browser?.close();
  }
}
