import fs from "node:fs/promises";
import path from "node:path";

import puppeteer from "puppeteer";

const baseUrl = "http://localhost:3000";
const evidenceDir = path.resolve("_PROJECT/tasks/CFIF-006/evidence");
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
const checks = {};

const pause = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function clickButton(label, root = "body") {
  await page.evaluate(
    ({ expected, rootSelector }) => {
      const container = document.querySelector(rootSelector);
      const button = [...(container?.querySelectorAll("button") ?? [])].find(
        (candidate) => candidate.textContent?.trim() === expected,
      );
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Button not found: ${expected}`);
      }
      button.click();
    },
    { expected: label, rootSelector: root },
  );
}

async function clickButtonContaining(label, root = "body") {
  await page.evaluate(
    ({ expected, rootSelector }) => {
      const container = document.querySelector(rootSelector);
      const button = [...(container?.querySelectorAll("button") ?? [])].find(
        (candidate) => candidate.textContent?.includes(expected),
      );
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Button containing text not found: ${expected}`);
      }
      button.click();
    },
    { expected: label, rootSelector: root },
  );
}

async function setInput(selector, value) {
  await page.$eval(
    selector,
    (element, nextValue) => {
      const prototype = Object.getPrototypeOf(element);
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      setter?.call(element, nextValue);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.focus();
    },
    value,
  );
}

async function login() {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', "jordan.ellis@cfi-demo.example");
  await page.type('input[name="password"]', "CFI-Demo-2026!");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => window.location.pathname === "/app");
}

async function createCompletedChat(content, chatId = null) {
  return page.evaluate(
    async ({ question, existingChatId }) => {
      const response = await fetch(
        existingChatId ? `/api/chats/${existingChatId}/messages` : "/api/chats",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: question,
            inputMode: "typed",
            clientSubmissionId: `submission_cfif006_${crypto.randomUUID()}`,
          }),
        },
      );
      const created = await response.json();
      if (!response.ok) throw new Error(created.error?.message ?? "Submission failed");
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const statusResponse = await fetch(`/api/requests/${created.request.id}`, {
          cache: "no-store",
        });
        const status = await statusResponse.json();
        if (status.status === "completed") {
          return {
            chatId: created.chat.id,
            requestId: status.id,
            attachment: status.assistantMessage.attachments[0] ?? null,
          };
        }
        if (status.status === "failed" || status.status === "interrupted") {
          throw new Error(status.error?.message ?? "Request failed");
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      throw new Error("Request did not finish in time");
    },
    { question: content, existingChatId: chatId },
  );
}

async function screenshot(name) {
  await page.screenshot({ path: path.join(evidenceDir, name) });
}

try {
  await fs.mkdir(evidenceDir, { recursive: true });
  await login();

  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await page.waitForSelector('button[aria-haspopup="dialog"]');
  await screenshot("new-chat-desktop-1440x900.png");
  checks.newChatDesktop = await page.evaluate(() => ({
    centered: document.querySelector("form")?.getAttribute("data-placement"),
    starterCount: document.querySelectorAll("main button").length,
    bodyOverflowX: document.documentElement.scrollWidth > innerWidth,
    textareaLabel: document.querySelector('label[for="chat-question"]')?.textContent,
  }));

  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  await screenshot("prompt-browser-desktop-1440x900.png");
  checks.promptDesktop = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const rect = dialog?.getBoundingClientRect();
    return {
      presentation: dialog?.parentElement?.getAttribute("data-presentation"),
      searchFocused: document.activeElement?.id === "prompt-search",
      resultCount: document.querySelectorAll('[role="dialog"] ul > li').length,
      insideViewport: Boolean(
        rect && rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
      ),
    };
  });
  await setInput("#prompt-search", "Casey");
  await page.waitForFunction(
    () => document.querySelector('[role="dialog"]')?.textContent?.includes("2 prompts"),
  );
  await clickButton("People", '[role="dialog"]');
  checks.promptFilter = await page.evaluate(() => ({
    query: document.querySelector("#prompt-search")?.value,
    selected: document
      .querySelector('[role="dialog"] button[aria-pressed="true"]')
      ?.textContent?.trim(),
    results: document.querySelectorAll('[role="dialog"] ul > li').length,
  }));
  await setInput("#prompt-search", "no-supported-prompt-matches-this");
  await page.waitForFunction(() =>
    document.querySelector('[role="dialog"]')?.textContent?.includes("No prompts found"),
  );
  checks.promptEmpty = await page.evaluate(() => ({
    emptyVisible: document
      .querySelector('[role="dialog"]')
      ?.textContent?.includes("No prompts found"),
    clearFiltersVisible: [...document.querySelectorAll('[role="dialog"] button')].some(
      (button) => button.textContent?.trim() === "Clear filters",
    ),
  }));
  await clickButton("Clear filters", '[role="dialog"]');
  await page.click('[role="dialog"] ul button');
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  await page.waitForFunction(
    () => document.activeElement === document.querySelector("textarea"),
  );
  checks.promptFillOnly = await page.evaluate(() => ({
    draftFilled: Boolean(document.querySelector("textarea")?.value),
    textareaFocused: document.activeElement === document.querySelector("textarea"),
    noMessageCreated: document.querySelectorAll("article").length === 0,
  }));
  await setInput("textarea", "Keep this unsent draft");
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] ul button');
  await page.click('[role="dialog"] ul button');
  await page.waitForSelector('[role="alertdialog"]');
  await screenshot("prompt-replacement-confirmation-desktop-1440x900.png");
  checks.promptConfirmation = await page.evaluate(() => ({
    nondestructiveFocus:
      document.activeElement?.textContent?.trim() === "Keep draft",
    draftStillPresent:
      document.querySelector("textarea")?.value === "Keep this unsent draft",
  }));
  await clickButton("Keep draft", '[role="alertdialog"]');
  await page.waitForFunction(() => !document.querySelector('[role="alertdialog"]'));
  await page.waitForFunction(() => Boolean(document.activeElement?.closest("ul")));
  checks.promptConfirmation.cancelKeepsBrowser = await page.evaluate(() => ({
    browserOpen: Boolean(document.querySelector('[role="dialog"]')),
    draftKept: document.querySelector("textarea")?.value === "Keep this unsent draft",
    resultFocused: Boolean(document.activeElement?.closest("ul")),
  }));
  await page.click('[role="dialog"] ul button');
  await clickButton("Replace draft", '[role="alertdialog"]');
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  await page.waitForFunction(
    () => document.activeElement === document.querySelector("textarea"),
  );
  checks.promptConfirmation.replaceFillsWithoutSending = await page.evaluate(() => ({
    textareaFocused: document.activeElement === document.querySelector("textarea"),
    draftReplaced:
      document.querySelector("textarea")?.value !== "Keep this unsent draft",
    noMessageCreated: document.querySelectorAll("article").length === 0,
  }));

  let failPromptCatalog = true;
  await page.setRequestInterception(true);
  const promptFailureHandler = (request) => {
    if (failPromptCatalog && new URL(request.url()).pathname === "/api/prompts") {
      void request.respond({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "service_unavailable",
            message: "Prompts are temporarily unavailable.",
            retryable: true,
            requestId: "cfif006_prompt_error",
          },
        }),
      });
    } else {
      void request.continue();
    }
  };
  page.on("request", promptFailureHandler);
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction(() =>
    document.body.textContent?.includes("Starter prompts are unavailable"),
  );
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForFunction(() =>
    document.querySelector('[role="dialog"]')?.textContent?.includes(
      "Prompts could not be loaded",
    ),
  );
  await screenshot("prompt-browser-error-desktop-1440x900.png");
  failPromptCatalog = false;
  await clickButton("Try again", '[role="dialog"]');
  await page.waitForSelector('[role="dialog"] ul button');
  checks.promptErrorRecovery = await page.evaluate(() => ({
    recoveredResults: document.querySelectorAll('[role="dialog"] ul > li').length,
    freeformEnabled: !document.querySelector("textarea")?.disabled,
  }));
  await page.keyboard.press("Escape");
  page.off("request", promptFailureHandler);
  await page.setRequestInterception(false);

  await setInput("textarea", "How many bids were created last month?");
  let failSubmission = true;
  await page.setRequestInterception(true);
  const submissionFailureHandler = (request) => {
    if (
      failSubmission &&
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/chats"
    ) {
      void request.respond({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "service_unavailable",
            message: "The simulated request is temporarily unavailable.",
            retryable: true,
            requestId: "cfif006_submission_error",
          },
        }),
      });
    } else {
      void request.continue();
    }
  };
  page.on("request", submissionFailureHandler);
  await page.click('button[aria-label="Send question"]');
  await page.waitForFunction(() =>
    document.body.textContent?.includes("The simulated request is temporarily unavailable."),
  );
  checks.requestError = await page.evaluate(() => ({
    alertVisible: Boolean(document.querySelector('[role="alert"]')),
    draftRetained: document.querySelector("textarea")?.value ===
      "How many bids were created last month?",
    textareaFocused: document.activeElement === document.querySelector("textarea"),
  }));
  failSubmission = false;
  page.off("request", submissionFailureHandler);
  await page.setRequestInterception(false);

  await page.click('button[aria-label="Send question"]');
  await page.waitForFunction(() => window.location.pathname.startsWith("/app/chats/"));
  const ongoingHref = await page.evaluate(() => window.location.pathname);
  checks.processing = await page.evaluate(() => ({
    announced: document.body.textContent?.includes("preparing a simulated answer"),
    sendDisabled: document.querySelector('button[aria-label="Send question"]')?.disabled,
  }));
  await page.waitForFunction(
    () =>
      document.querySelectorAll("article").length >= 2 &&
      !document.body.textContent?.includes("preparing a simulated answer"),
    { timeout: 15000 },
  );
  await screenshot("ongoing-chat-desktop-1440x900.png");

  const sixLines = "Line one\nLine two\nLine three\nLine four\nLine five\nLine six";
  await setInput("textarea", sixLines);
  await pause(100);
  const sixLineMetrics = await page.$eval("textarea", (element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  await setInput("textarea", `${sixLines}\nLine seven`);
  await pause(100);
  checks.composerGrowth = await page.$eval("textarea", (element, six) => ({
    sixLines: six,
    sevenLines: {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      internalScroll: element.scrollHeight > element.clientHeight,
    },
  }), sixLineMetrics);

  await setInput("textarea", "Keep this typed question");
  const articlesBeforeVoice = await page.$$eval("article", (items) => items.length);
  await page.click('button[aria-label="Record"]');
  await page.waitForFunction(() => document.body.textContent?.includes("Recording ·"));
  const recordingText = await page.$eval("form", (form) => form.textContent);
  await page.click('button[aria-label="Stop recording"]');
  await page.waitForSelector('button[aria-label="Discard transcript"]');
  checks.voice = await page.evaluate(
    ({ before, recording }) => ({
      recordingAnnounced: recording.includes("Recording"),
      reviewAnnounced: document.body.textContent?.includes(
        "Transcript added. Review before sending.",
      ),
      noAutoSend: document.querySelectorAll("article").length === before,
      transcriptAdded: document.querySelector("textarea")?.value.includes(
        "How many bids did Casey Patel create in the past seven days?",
      ),
    }),
    { before: articlesBeforeVoice, recording: recordingText },
  );
  await page.click('button[aria-label="Discard transcript"]');
  checks.voice.restoredTypedDraft =
    (await page.$eval("textarea", (element) => element.value)) ===
    "Keep this typed question";

  await page.click('button[aria-label="Account actions"]');
  await page.keyboard.press("Escape");
  checks.accountMenuEscape = await page.evaluate(() => ({
    closed: !document.querySelector('button[aria-label="Account actions"]')
      ?.nextElementSibling,
    focusReturned:
      document.activeElement?.getAttribute("aria-label") === "Account actions",
  }));

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await screenshot("new-chat-mobile-390x844.png");
  await page.goto(`${baseUrl}${ongoingHref}`, { waitUntil: "networkidle0" });
  await screenshot("ongoing-chat-mobile-390x844.png");
  await page.click('button[aria-label="Browse prompts"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  await screenshot("prompt-browser-mobile-390x844.png");
  checks.promptMobile = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const focusables = dialog
      ? [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')]
      : [];
    focusables.at(-1)?.focus();
    return {
      presentation: dialog?.parentElement?.getAttribute("data-presentation"),
      ariaModal: dialog?.getAttribute("aria-modal"),
      focusableCount: focusables.length,
      bodyOverflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });
  await page.keyboard.press("Tab");
  checks.promptMobile.wrapsLastToFirst = await page.evaluate(
    () => document.activeElement?.textContent?.trim() === "Close",
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  checks.promptMobile.escapeRestoresOpener = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") === "Browse prompts",
  );

  await page.evaluate(() => {
    const chats = [...document.querySelectorAll("button")].find(
      (button) => button.textContent?.trim() === "Chats",
    );
    if (chats instanceof HTMLButtonElement) chats.click();
  });
  await page.waitForFunction(
    () =>
      document
        .querySelector("button")
        ?.textContent?.trim() === "Chats" &&
      [...document.querySelectorAll("button")].some(
        (button) =>
          button.textContent?.trim() === "Chats" &&
          button.getAttribute("aria-expanded") === "true",
      ),
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(
      (button) =>
        button.textContent?.trim() === "Chats" &&
        button.getAttribute("aria-expanded") === "false",
    ),
  );
  await pause(80);
  checks.drawerEscape = await page.evaluate(() => ({
    focusReturned: document.activeElement?.textContent?.trim() === "Chats",
    collapsed:
      document.activeElement?.getAttribute("aria-expanded") === "false",
  }));

  await page.setViewport({ width: 390, height: 560, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}${ongoingHref}`, { waitUntil: "networkidle0" });
  checks.keyboardRepresentative = await page.evaluate(() => {
    const textarea = document.querySelector("textarea")?.getBoundingClientRect();
    const send = document
      .querySelector('button[aria-label="Send question"]')
      ?.getBoundingClientRect();
    return {
      textareaVisible: Boolean(textarea && textarea.top >= 0 && textarea.bottom <= innerHeight),
      sendVisible: Boolean(send && send.top >= 0 && send.bottom <= innerHeight),
      bodyOverflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const reportFixture = await createCompletedChat(
    "Show the report of bids created in the past seven days.",
  );
  const reportHref = `/app/chats/${reportFixture.chatId}`;
  const artifactId = reportFixture.attachment?.id;
  if (!artifactId) throw new Error("Report fixture did not include an artifact");
  await page.goto(`${baseUrl}${reportHref}`, { waitUntil: "networkidle0" });
  await setInput("textarea", sixLines);
  await pause(100);
  const anchorBefore = await page.evaluate(() => {
    const scroller = document.querySelector('[class*="messageScroller"]');
    if (scroller) {
      scroller.style.scrollBehavior = "auto";
      scroller.scrollTop = scroller.scrollHeight;
      scroller.style.removeProperty("scroll-behavior");
    }
    return {
      draft: document.querySelector("textarea")?.value,
      scrollTop: scroller?.scrollTop ?? 0,
    };
  });
  await page.click(`button[aria-label^="Open report:"]`);
  await page.waitForSelector("#report-heading");
  await page.waitForFunction(() => document.body.textContent?.includes("Rows 1–50 of 64"));
  await screenshot("report-open-desktop-1440x900.png");
  checks.reportDesktop = await page.evaluate(() => {
    const form = document.querySelector("form");
    const conversation = form?.closest("main");
    const report = document.querySelector("#report-heading")?.closest("section");
    const scroller = report?.querySelector('[tabindex="0"]');
    const rect = (element) => {
      const box = element?.getBoundingClientRect();
      return box
        ? { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height }
        : null;
    };
    const conversationRect = rect(conversation);
    const reportRect = rect(report);
    const formRect = rect(form);
    const boundaryHits = reportRect
      ? document.elementsFromPoint(reportRect.left + 1, formRect?.top ?? 700)
      : [];
    return {
      report: reportRect,
      conversation: conversationRect,
      form: formRect,
      fullWorkspaceHeight: reportRect?.top === 64 && reportRect?.bottom === innerHeight,
      composerPlacement: form?.getAttribute("data-placement"),
      composerContained: Boolean(
        formRect && conversationRect && formRect.left >= conversationRect.left && formRect.right <= conversationRect.right,
      ),
      reportBoundaryInterceptedByChat: boundaryHits.some((element) => conversation?.contains(element)),
      visibleLabel: document.querySelector('label[for="chat-question"]')?.textContent,
      controlsAtLeast44: [...(form?.querySelectorAll("button") ?? [])].every(
        (button) => button.getBoundingClientRect().height >= 44,
      ),
      tableScrollWidth: scroller?.scrollWidth,
      tableClientWidth: scroller?.clientWidth,
      bodyOverflowX: document.documentElement.scrollWidth > innerWidth,
      headingFocused: document.activeElement?.id === "report-heading",
      lastMessageClearance: (() => {
        const messageScroller = document.querySelector('[class*="messageScroller"]');
        const previousTop = messageScroller?.scrollTop ?? 0;
        if (messageScroller) {
          messageScroller.style.scrollBehavior = "auto";
          messageScroller.scrollTop = messageScroller.scrollHeight;
        }
        const lastMessage = [...document.querySelectorAll("article")].at(-1);
        const last = lastMessage?.getBoundingClientRect();
        const result = {
          clears: Boolean(last && formRect && last.bottom <= formRect.top),
          lastBottom: last?.bottom ?? null,
          composerTop: formRect?.top ?? null,
          scrollTop: messageScroller?.scrollTop ?? null,
          scrollHeight: messageScroller?.scrollHeight ?? null,
          clientHeight: messageScroller?.clientHeight ?? null,
          paddingBottom: messageScroller
            ? getComputedStyle(messageScroller).paddingBottom
            : null,
        };
        if (messageScroller) {
          messageScroller.scrollTop = previousTop;
          messageScroller.style.removeProperty("scroll-behavior");
        }
        return result;
      })(),
    };
  });

  await page.hover('button[aria-label="Browse prompts"]');
  checks.constrainedTooltips = await page.evaluate(() => {
    const prompt = document.querySelector('button[aria-label="Browse prompts"]');
    const send = document.querySelector('button[aria-label="Send question"]');
    const promptTooltip = prompt ? getComputedStyle(prompt, "::after") : null;
    const sendTooltip = send ? getComputedStyle(send, "::after") : null;
    return {
      prompt: {
        content: promptTooltip?.content,
        opacity: promptTooltip?.opacity,
        left: promptTooltip?.left,
        transform: promptTooltip?.transform,
      },
      send: {
        content: sendTooltip?.content,
        right: sendTooltip?.right,
        left: sendTooltip?.left,
        transform: sendTooltip?.transform,
      },
    };
  });
  await page.hover('button[aria-label="Send question"]');
  checks.constrainedTooltips.sendHover = await page.$eval(
    'button[aria-label="Send question"]',
    (send) => {
      const tooltip = getComputedStyle(send, "::after");
      return { content: tooltip.content, opacity: tooltip.opacity };
    },
  );

  await page.click('button[aria-label="Browse prompts"]');
  await page.waitForSelector('[role="dialog"]');
  await screenshot("report-prompt-browser-desktop-1440x900.png");
  checks.reportOverlay = await page.evaluate(() => {
    const form = document.querySelector("form");
    const conversation = form?.closest("main");
    const dialog = document.querySelector('[role="dialog"]');
    const rect = (element) => element?.getBoundingClientRect();
    const pane = rect(conversation);
    const overlay = rect(dialog);
    return {
      placement: dialog?.parentElement?.getAttribute("data-placement"),
      contained: Boolean(
        pane && overlay && overlay.left >= pane.left && overlay.right <= pane.right && overlay.top >= pane.top && overlay.bottom <= pane.bottom,
      ),
      searchFocused: document.activeElement?.id === "prompt-search",
    };
  });

  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
  await pause(150);
  checks.tabletReplacement = await page.evaluate(() => {
    const form = document.querySelector("form");
    const report = document.querySelector("#report-heading")?.closest("section");
    const back = [...document.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Back to conversation"),
    );
    const heading = document.querySelector("#report-heading");
    const a = back?.getBoundingClientRect();
    const b = heading?.getBoundingClientRect();
    return {
      promptClosed: !document.querySelector('[role="dialog"]'),
      reportFocused: document.activeElement?.id === "report-heading",
      composerVisible: Boolean(form?.getClientRects().length),
      composerAtPoint: document.elementsFromPoint(innerWidth - 16, innerHeight - 16).some((element) => form?.contains(element)),
      reportHeight: report?.getBoundingClientRect().height,
      backHeadingOverlap: Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top),
      bodyOverflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });
  await screenshot("report-open-tablet-768x1024.png");
  await clickButtonContaining("Back to conversation");
  await page.waitForFunction(() => !document.querySelector("#report-heading"));
  await page.waitForFunction(
    () => !new URL(location.href).searchParams.has("report"),
  );
  await page.waitForFunction(
    () =>
      document.activeElement?.getAttribute("aria-label")?.startsWith(
        "Open report:",
      ) ?? false,
  );
  checks.tabletRestoration = await page.evaluate((before) => {
    const scroller = document.querySelector('[class*="messageScroller"]');
    const maximumScrollTop = scroller
      ? Math.max(0, scroller.scrollHeight - scroller.clientHeight)
      : 0;
    const expectedScrollTop = Math.min(before.scrollTop, maximumScrollTop);
    return {
      draft: document.querySelector("textarea")?.value,
      draftRestored: document.querySelector("textarea")?.value === before.draft,
      scrollTop: scroller?.scrollTop ?? 0,
      maximumScrollTop,
      expectedScrollTop,
      anchorRestored:
        Math.abs((scroller?.scrollTop ?? 0) - expectedScrollTop) <= 1,
      reportOpenerFocused:
        document.activeElement?.getAttribute("aria-label")?.startsWith("Open report:") ?? false,
    };
  }, anchorBefore);

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await pause(100);
  await page.$eval('button[aria-label^="Open report:"]', (button) => button.click());
  await page.waitForFunction(() => new URL(location.href).searchParams.has("report"));
  await page.waitForSelector("#report-heading");
  await page.waitForFunction(() =>
    document.body.textContent?.includes("Rows 1–50 of 64") ||
    document.body.textContent?.includes("Rows 51–64 of 64"),
  );
  if (await page.evaluate(() => document.body.textContent?.includes("Rows 51–64 of 64"))) {
    await clickButton("Previous page");
    await page.waitForFunction(() => document.body.textContent?.includes("Rows 1–50 of 64"));
  }
  await page.evaluate(() => {
    const scroller = document.querySelector("#report-heading")
      ?.closest("section")
      ?.querySelector('[tabindex="0"]');
    if (scroller) {
      scroller.scrollLeft = 320;
      scroller.scrollTop = 180;
    }
  });
  await clickButton("Next page");
  await page.waitForFunction(() => document.body.textContent?.includes("Rows 51–64 of 64"));
  checks.pagination = await page.evaluate(() => {
    const report = document.querySelector("#report-heading")?.closest("section");
    const scroller = report?.querySelector('[tabindex="0"]');
    return {
      pageTwoRows: report?.querySelectorAll("tbody tr").length,
      horizontalPosition: scroller?.scrollLeft,
      verticalPosition: scroller?.scrollTop,
      urlPage: new URL(location.href).searchParams.get("page"),
      stableFooterFocus: document.activeElement?.tagName === "FOOTER",
    };
  });
  await clickButton("Previous page");
  await page.waitForFunction(() => document.body.textContent?.includes("Rows 1–50 of 64"));

  let failPageTwo = true;
  await page.setRequestInterception(true);
  const reportPageFailureHandler = (request) => {
    const url = new URL(request.url());
    if (
      failPageTwo &&
      url.pathname === `/api/artifacts/${artifactId}/rows` &&
      url.searchParams.get("page") === "2"
    ) {
      failPageTwo = false;
      setTimeout(() => {
        void request.respond({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "artifact_page_failed",
              message: "The saved report page could not be loaded.",
              retryable: true,
              requestId: "cfif006_report_page_error",
            },
          }),
        });
      }, 180);
    } else {
      void request.continue();
    }
  };
  page.on("request", reportPageFailureHandler);
  await clickButton("Next page");
  await page.waitForFunction(() => document.body.textContent?.includes("Loading page 2"));
  checks.reportPageLoadingAnnounced = true;
  await page.waitForFunction(() =>
    document.body.textContent?.includes("Page 2 could not be loaded"),
  );
  await screenshot("report-page-error-desktop-1440x900.png");
  checks.reportPageError = await page.evaluate(() => ({
    alertVisible: Boolean(document.querySelector('[role="alert"]')),
    footerFocused: document.activeElement?.tagName === "FOOTER",
    retryVisible: [...document.querySelectorAll("button")].some(
      (button) => button.textContent?.trim() === "Retry page",
    ),
  }));
  await clickButton("Retry page");
  await page.waitForFunction(() => document.body.textContent?.includes("Rows 51–64 of 64"));
  page.off("request", reportPageFailureHandler);
  await page.setRequestInterception(false);

  await clickButtonContaining("Close report");
  await page.waitForFunction(() => !document.querySelector("#report-heading"));
  await page.waitForFunction(
    () => !new URL(location.href).searchParams.has("report"),
  );
  await page.waitForFunction(
    () =>
      document.activeElement?.getAttribute("aria-label")?.startsWith(
        "Open report:",
      ) ?? false,
  );
  checks.desktopRestoration = await page.evaluate((before) => ({
    draftRestored: document.querySelector("textarea")?.value === before.draft,
    reportOpenerFocused:
      document.activeElement?.getAttribute("aria-label")?.startsWith("Open report:") ?? false,
  }), anchorBefore);
  await page.$eval('button[aria-label^="Open report:"]', (button) => button.click());
  await page.waitForFunction(() => document.body.textContent?.includes("Rows 51–64 of 64"));
  checks.rememberedReportPage = new URL(page.url()).searchParams.get("page");

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(
    `${baseUrl}${reportHref}?report=${artifactId}&page=1`,
    { waitUntil: "networkidle0" },
  );
  await page.waitForFunction(() => document.body.textContent?.includes("Rows 1–50 of 64"));
  await page.evaluate(() => {
    const scroller = document
      .querySelector("#report-heading")
      ?.closest("section")
      ?.querySelector('[tabindex="0"]');
    if (scroller) {
      scroller.style.scrollBehavior = "auto";
      scroller.scrollLeft = 0;
      scroller.scrollTop = 0;
      scroller.style.removeProperty("scroll-behavior");
    }
  });
  await pause(250);
  await screenshot("report-open-mobile-390x844.png");
  checks.reportMobile = await page.evaluate(() => {
    const form = document.querySelector("form");
    const report = document.querySelector("#report-heading")?.closest("section");
    return {
      reportOnly: Boolean(report?.getClientRects().length) && !form?.getClientRects().length,
      hiddenComposerAtBottom: document.elementsFromPoint(innerWidth / 2, innerHeight - 8).some(
        (element) => form?.contains(element),
      ),
      tableScrollLeft:
        report?.querySelector('[tabindex="0"]')?.scrollLeft ?? null,
      reportLeft: report?.getBoundingClientRect().left ?? null,
      headerText: document.querySelector("header")?.innerText ?? null,
      bodyOverflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });
  await clickButtonContaining("Back to conversation");
  await page.waitForFunction(() => !document.querySelector("#report-heading"));
  await page.waitForFunction(
    () => !new URL(location.href).searchParams.has("report"),
  );
  await page.waitForFunction(
    () =>
      document.activeElement?.getAttribute("aria-label")?.startsWith(
        "Open report:",
      ) ?? false,
  );
  checks.mobileRestoration = await page.evaluate((before) => ({
    draftRestored: document.querySelector("textarea")?.value === before.draft,
    reportOpenerFocused:
      document.activeElement?.getAttribute("aria-label")?.startsWith("Open report:") ?? false,
  }), anchorBefore);

  await setInput("textarea", "How many bids were created last month?");
  const beforeBackgroundReply = await page.evaluate(() => {
    const scroller = document.querySelector('[class*="messageScroller"]');
    if (scroller) {
      scroller.style.scrollBehavior = "auto";
      scroller.scrollTop = 0;
      scroller.style.removeProperty("scroll-behavior");
    }
    return {
      articleCount: document.querySelectorAll("article").length,
      distanceFromEnd: scroller
        ? scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
        : 0,
    };
  });
  await page.click('button[aria-label="Send question"]');
  await pause(80);
  checks.processing = await page.evaluate(() => ({
    announced: document.body.textContent?.includes("preparing a simulated answer"),
    sendDisabled:
      document.querySelector('button[aria-label="Send question"]')?.disabled ?? true,
  }));
  await page.waitForFunction(
    (before) =>
      document.querySelectorAll("article").length >= before + 2 &&
      !document.body.textContent?.includes("preparing a simulated answer"),
    { timeout: 15000 },
    beforeBackgroundReply.articleCount,
  );
  checks.newAnswer = await page.evaluate((distanceFromEnd) => ({
    startedAwayFromEnd: distanceFromEnd > 120,
    controlVisible: [...document.querySelectorAll("button")].some(
      (button) => button.textContent?.trim() === "New answer ↓",
    ),
    focusStayedOutOfNewMessage:
      document.activeElement?.textContent?.trim() !== "New answer ↓",
  }), beforeBackgroundReply.distanceFromEnd);

  const emptyFixture = await createCompletedChat(
    "Show bids created from 1 to 7 June 2026.",
  );
  const emptyArtifactId = emptyFixture.attachment?.id;
  if (!emptyArtifactId) throw new Error("Empty report fixture did not include an artifact");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(
    `${baseUrl}/app/chats/${emptyFixture.chatId}?report=${emptyArtifactId}&page=1`,
    { waitUntil: "networkidle0" },
  );
  await page.waitForFunction(() => document.body.textContent?.includes("No matching bids"));
  checks.emptyReport = await page.evaluate(() => ({
    heading: document.querySelector("#report-heading")?.textContent,
    zeroRows: document.body.textContent?.includes("0 rows · No pages"),
    columnCount:
      document
        .querySelector("#report-heading")
        ?.closest("section")
        ?.querySelectorAll("thead th").length ?? 0,
    noPaginationButtons: ![...document.querySelectorAll("button")].some((button) =>
      ["Next page", "Previous page"].includes(button.textContent?.trim() ?? ""),
    ),
  }));

  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.goto(`${baseUrl}${ongoingHref}`, { waitUntil: "networkidle0" });
  checks.reducedMotion = await page.evaluate(() => ({
    preferenceMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    sidebarTransition: getComputedStyle(document.querySelector("aside")).transitionDuration,
  }));

  const routes = {
    newChat: "/app/chat",
    ongoing: ongoingHref,
    report: `${reportHref}?report=${artifactId}&page=1`,
  };
  checks.overflowMatrix = [];
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewport({ width, height: width < 768 ? 844 : width === 1280 ? 720 : 900, deviceScaleFactor: 1 });
    for (const [view, route] of Object.entries(routes)) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle0" });
      checks.overflowMatrix.push(
        await page.evaluate(
          ({ testedWidth, testedView }) => ({
            width: testedWidth,
            view: testedView,
            documentScrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
            noHorizontalBodyOverflow: document.documentElement.scrollWidth <= innerWidth,
          }),
          { testedWidth: width, testedView: view },
        ),
      );
    }
  }

  checks.browser = await page.browser().version();
  checks.checkedAt = new Date().toISOString();
  await fs.writeFile(
    path.join(evidenceDir, "verification.json"),
    `${JSON.stringify(checks, null, 2)}\n`,
  );
} finally {
  await browser.close();
}
