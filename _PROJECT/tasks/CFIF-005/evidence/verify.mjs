import fs from "node:fs/promises";
import path from "node:path";

import puppeteer from "puppeteer";

const baseUrl = "http://localhost:3000";
const evidenceDir = path.resolve("_PROJECT/tasks/CFIF-005/evidence");
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
const checks = {};

const pause = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function clickButton(text, rootSelector = "body") {
  await page.evaluate(
    ({ label, root }) => {
      const container = document.querySelector(root);
      const button = [...(container?.querySelectorAll("button") ?? [])].find(
        (candidate) => candidate.textContent?.trim() === label,
      );
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Button not found: ${label}`);
      }
      button.click();
    },
    { label: text, root: rootSelector },
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

try {
  await login();
  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await page.waitForSelector('button[aria-haspopup="dialog"]');

  const apiCatalog = await page.evaluate(async () => {
    const response = await fetch("/api/prompts", { cache: "no-store" });
    return {
      status: response.status,
      cacheControl: response.headers.get("cache-control"),
      body: await response.json(),
    };
  });
  checks.api = {
    status: apiCatalog.status,
    cacheControl: apiCatalog.cacheControl,
    revision: apiCatalog.body.revision,
    categories: apiCatalog.body.categories.map((category) => category.label),
    promptIds: apiCatalog.body.prompts.map((prompt) => prompt.id),
    supportedOnly: apiCatalog.body.prompts.every(
      (prompt) => prompt.availability === "supported",
    ),
  };
  checks.starters = await page.evaluate(() => ({
    count: [...document.querySelectorAll("button")].filter((button) =>
      [
        "How many bids were created last month?",
        "How many bids did Casey Patel create in the past seven days?",
        "Show the report of bids created in the past seven days.",
        "How many bids did Casey Patel and Morgan Reed create in the past seven days?",
        "How many bids did Alex Morgan create in the past seven days?",
      ].includes(button.textContent?.trim() ?? ""),
    ).length,
  }));

  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  await page.screenshot({
    path: path.join(evidenceDir, "prompt-browser-desktop-1440x900.png"),
  });
  checks.desktopPopover = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const textarea = document.querySelector("textarea");
    const send = document.querySelector('button[aria-label="Send question"]');
    const layer = dialog?.parentElement;
    const dialogRect = dialog?.getBoundingClientRect();
    const textareaRect = textarea?.getBoundingClientRect();
    const sendRect = send?.getBoundingClientRect();
    const overlaps = (first, second) =>
      Boolean(
        first &&
          second &&
          first.left < second.right &&
          first.right > second.left &&
          first.top < second.bottom &&
          first.bottom > second.top,
      );
    return {
      presentation: layer?.getAttribute("data-presentation"),
      ariaModal: dialog?.getAttribute("aria-modal"),
      searchFocused: document.activeElement?.id === "prompt-search",
      width: dialogRect?.width,
      insideViewport:
        Boolean(dialogRect) &&
        dialogRect.left >= 0 &&
        dialogRect.right <= window.innerWidth &&
        dialogRect.bottom <= window.innerHeight,
      obscuresTextarea: overlaps(dialogRect, textareaRect),
      obscuresSend: overlaps(dialogRect, sendRect),
    };
  });

  await setInput("#prompt-search", "Casey");
  await page.waitForFunction(
    () => document.querySelector('[role="dialog"]')?.textContent?.includes("2 prompts"),
  );
  checks.search = await page.evaluate(() => ({
    query: document.querySelector("#prompt-search")?.value,
    results: [...document.querySelectorAll('[role="dialog"] ul button strong')].map(
      (item) => item.textContent,
    ),
  }));
  await clickButton("People", '[role="dialog"]');
  checks.categoryAndSearch = await page.evaluate(() => ({
    selected: document
      .querySelector('[role="dialog"] button[aria-pressed="true"]')
      ?.textContent?.trim(),
    resultCount: document.querySelectorAll('[role="dialog"] ul > li').length,
  }));

  await page.click('[role="dialog"] ul button');
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  await pause(80);
  checks.fillOnlySelection = await page.evaluate(() => ({
    draft: document.querySelector("textarea")?.value,
    textareaFocused: document.activeElement === document.querySelector("textarea"),
    path: window.location.pathname,
    messageCount: document.querySelectorAll("article").length,
  }));

  await setInput("textarea", "Keep this unsent draft");
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] ul button');
  await page.click('[role="dialog"] ul button');
  await page.waitForSelector('[role="alertdialog"]');
  await page.screenshot({
    path: path.join(
      evidenceDir,
      "prompt-replacement-confirmation-desktop-1440x900.png",
    ),
  });
  await clickButton("Keep draft", '[role="alertdialog"]');
  await pause(80);
  checks.replacementCancel = await page.evaluate(() => ({
    draft: document.querySelector("textarea")?.value,
    browserStillOpen: Boolean(document.querySelector('[role="dialog"]')),
    query: document.querySelector("#prompt-search")?.value,
    resultFocused: Boolean(document.activeElement?.closest("ul")),
  }));
  await page.click('[role="dialog"] ul button');
  await clickButton("Replace draft", '[role="alertdialog"]');
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  await pause(80);
  checks.replacementConfirm = await page.evaluate(() => ({
    draft: document.querySelector("textarea")?.value,
    textareaFocused: document.activeElement === document.querySelector("textarea"),
    path: window.location.pathname,
  }));

  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"]');
  await page.click("h2");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  await pause(80);
  checks.desktopOutsideClick = await page.evaluate(() => ({
    closed: !document.querySelector('[role="dialog"]'),
    openerFocused:
      document.activeElement?.getAttribute("aria-haspopup") === "dialog",
  }));

  let failPromptRequest = true;
  await page.setRequestInterception(true);
  const interceptPromptApi = (request) => {
    if (
      failPromptRequest &&
      new URL(request.url()).pathname === "/api/prompts"
    ) {
      void request.respond({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "service_unavailable",
            message: "Prompts are temporarily unavailable.",
            retryable: true,
            requestId: "error_rendered_verification",
          },
        }),
      });
    } else {
      void request.continue();
    }
  };
  page.on("request", interceptPromptApi);
  await page.goto(`${baseUrl}/app`, { waitUntil: "networkidle0" });
  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() =>
    document.body.textContent?.includes("Starter prompts are unavailable"),
  );
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForFunction(() =>
    document.querySelector('[role="dialog"]')?.textContent?.includes(
      "Prompts could not be loaded",
    ),
  );
  checks.errorState = await page.evaluate(() => ({
    freeformEnabled: !document.querySelector("textarea")?.disabled,
    retryVisible: [...document.querySelectorAll('[role="dialog"] button')].some(
      (button) => button.textContent?.trim() === "Try again",
    ),
  }));
  await page.screenshot({
    path: path.join(evidenceDir, "prompt-browser-error-desktop-1440x900.png"),
  });
  failPromptRequest = false;
  await clickButton("Try again", '[role="dialog"]');
  await page.waitForSelector('[role="dialog"] ul button');
  checks.errorRecovery = await page.evaluate(
    () => document.querySelectorAll('[role="dialog"] ul > li').length,
  );
  page.off("request", interceptPromptApi);
  await page.setRequestInterception(false);

  await page.keyboard.press("Escape");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await page.waitForSelector('button[aria-haspopup="dialog"]');
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  await page.screenshot({
    path: path.join(evidenceDir, "prompt-browser-mobile-390x844.png"),
  });
  checks.mobileSheet = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const rect = dialog?.getBoundingClientRect();
    return {
      presentation: dialog?.parentElement?.getAttribute("data-presentation"),
      ariaModal: dialog?.getAttribute("aria-modal"),
      searchFocused: document.activeElement?.id === "prompt-search",
      height: rect?.height,
      maximumHeight: window.innerHeight * 0.85,
      anchoredToBottom: rect?.bottom === window.innerHeight,
      bodyOverflowX: document.body.scrollWidth > document.body.clientWidth,
    };
  });
  checks.mobileFocusTrap = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const items = dialog
      ? [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')]
      : [];
    items.at(-1)?.focus();
    return { focusableCount: items.length };
  });
  await page.keyboard.press("Tab");
  checks.mobileFocusTrap.wrapsLastToFirst = await page.evaluate(
    () => document.activeElement?.textContent?.trim() === "Close",
  );
  await page.keyboard.down("Shift");
  await page.keyboard.press("Tab");
  await page.keyboard.up("Shift");
  checks.mobileFocusTrap.wrapsFirstToLast = await page.evaluate(
    () => Boolean(document.activeElement?.closest("ul")),
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  await pause(80);
  checks.mobileEscape = await page.evaluate(() => ({
    closed: !document.querySelector('[role="dialog"]'),
    openerFocused:
      document.activeElement?.getAttribute("aria-haspopup") === "dialog",
  }));

  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] ul li:nth-child(3) button');
  const mobileDraftBeforeReplacement = await page.$eval(
    "textarea",
    (textarea) => textarea.value,
  );
  await page.click('[role="dialog"] ul li:nth-child(3) button');
  await page.waitForSelector('[role="alertdialog"]');
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="alertdialog"]'));
  await pause(80);
  checks.mobileReplacementEscape = await page.evaluate(
    (expectedDraft) => ({
      browserStillOpen: Boolean(document.querySelector('[role="dialog"]')),
      draftUnchanged: document.querySelector("textarea")?.value === expectedDraft,
      resultFocused: Boolean(document.activeElement?.closest("ul")),
    }),
    mobileDraftBeforeReplacement,
  );
  await page.keyboard.press("Escape");

  await page.setViewport({ width: 390, height: 560, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await page.waitForSelector('button[aria-haspopup="dialog"]');
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  await page.screenshot({
    path: path.join(
      evidenceDir,
      "prompt-browser-keyboard-representative-390x560.png",
    ),
  });
  checks.keyboardRepresentative = await page.evaluate(() => {
    const search = document
      .querySelector("#prompt-search")
      ?.getBoundingClientRect();
    const firstResult = document
      .querySelector('[role="dialog"] ul button')
      ?.getBoundingClientRect();
    return {
      viewportHeight: window.innerHeight,
      searchVisible: Boolean(
        search && search.top >= 0 && search.bottom <= window.innerHeight,
      ),
      firstResultVisible: Boolean(
        firstResult && firstResult.top < window.innerHeight && firstResult.bottom > 0,
      ),
    };
  });
  await page.keyboard.press("Escape");

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });

  await page.click('button[aria-haspopup="dialog"]');
  await setInput("#prompt-search", "zzzzz");
  await page.waitForFunction(() =>
    document.querySelector('[role="dialog"]')?.textContent?.includes(
      "No prompts found",
    ),
  );
  await page.screenshot({
    path: path.join(evidenceDir, "prompt-browser-no-match-mobile-390x844.png"),
  });
  await clickButton("Clear filters", '[role="dialog"]');
  checks.clearFilters = await page.evaluate(() => ({
    query: document.querySelector("#prompt-search")?.value,
    selected: document
      .querySelector('[role="dialog"] button[aria-pressed="true"]')
      ?.textContent?.trim(),
    resultCount: document.querySelectorAll('[role="dialog"] ul > li').length,
  }));
  await page.keyboard.press("Escape");

  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await page.waitForSelector('button[aria-haspopup="dialog"]');
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  await page.screenshot({
    path: path.join(evidenceDir, "prompt-browser-tablet-768x1024.png"),
  });
  checks.tabletPopover = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const rect = dialog?.getBoundingClientRect();
    const firstResult = document.querySelector('[role="dialog"] ul button');
    return {
      presentation: dialog?.parentElement?.getAttribute("data-presentation"),
      insideViewport: Boolean(
        rect &&
          rect.left >= 0 &&
          rect.right <= window.innerWidth &&
          rect.bottom <= window.innerHeight,
      ),
      searchFocused: document.activeElement?.id === "prompt-search",
      firstResultReachable: Boolean(firstResult),
      bodyOverflowX: document.body.scrollWidth > document.body.clientWidth,
    };
  });
  await page.keyboard.press("Escape");

  await page.setViewport({ width: 320, height: 720, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/app/chat`, { waitUntil: "networkidle0" });
  await page.waitForSelector('button[aria-haspopup="dialog"]');
  await page.click('button[aria-haspopup="dialog"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  checks.narrowZoomRepresentative = await page.evaluate(() => {
    const firstResult = document
      .querySelector('[role="dialog"] ul button')
      ?.getBoundingClientRect();
    return {
      width: window.innerWidth,
      noBodyOverflowX: document.body.scrollWidth === document.body.clientWidth,
      searchVisible: Boolean(document.querySelector("#prompt-search")),
      firstResultVisible: Boolean(
        firstResult && firstResult.top < window.innerHeight && firstResult.bottom > 0,
      ),
    };
  });
  await page.keyboard.press("Escape");

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  let chatHref = await page.evaluate(
    () => document.querySelector('a[href^="/app/chats/"]')?.getAttribute("href") ?? null,
  );
  if (!chatHref) {
    chatHref = await page.evaluate(async () => {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "How many bids were created last month?",
          inputMode: "typed",
          clientSubmissionId: `submission_verify_${crypto.randomUUID()}`,
        }),
      });
      const body = await response.json();
      return `/app/chats/${body.chat.id}`;
    });
  }
  await page.goto(`${baseUrl}${chatHref}`, { waitUntil: "networkidle0" });
  await page.waitForSelector('button[aria-label="Browse prompts"]');
  await page.click('button[aria-label="Browse prompts"]');
  await page.waitForSelector('[role="dialog"] #prompt-search');
  await page.screenshot({
    path: path.join(evidenceDir, "prompt-browser-ongoing-desktop-1440x900.png"),
  });
  checks.ongoingPopover = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const textarea = document.querySelector("textarea");
    const dialogRect = dialog?.getBoundingClientRect();
    const textareaRect = textarea?.getBoundingClientRect();
    return {
      aboveComposer: Boolean(
        dialogRect && textareaRect && dialogRect.bottom <= textareaRect.top,
      ),
      insideConversation: Boolean(
        dialogRect &&
          dialogRect.left >=
            document.querySelector("main")?.getBoundingClientRect().left &&
          dialogRect.right <=
            document.querySelector("main")?.getBoundingClientRect().right,
      ),
      searchFocused: document.activeElement?.id === "prompt-search",
    };
  });

  checks.browser = await page.browser().version();
  checks.checkedAt = new Date().toISOString();
  await fs.writeFile(
    path.join(evidenceDir, "verification.json"),
    `${JSON.stringify(checks, null, 2)}\n`,
  );
} finally {
  await browser.close();
}
