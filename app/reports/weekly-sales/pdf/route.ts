import puppeteer from "puppeteer";

import {
  buildPdfRenderUrl,
  getPdfFilename,
  PdfConfigurationError,
  resolvePdfDateRange,
} from "./pdf-request";

export const runtime = "nodejs";

export async function GET(request: Request) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;
  const requestUrl = new URL(request.url);
  const rangeResult = resolvePdfDateRange(requestUrl);

  if (!rangeResult.ok) {
    return new Response(rangeResult.message, {
      status: 400,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  try {
    const renderUrl = buildPdfRenderUrl(
      requestUrl,
      rangeResult.range,
      process.env.REPORT_RENDER_ORIGIN,
    );
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
        "Content-Disposition": `attachment; filename="${getPdfFilename(rangeResult.range)}"`,
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
