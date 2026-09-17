"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type {
  ApiErrorDto,
  ChatDetailDto,
  ChatListDto,
  CreateMessageResponseDto,
  InputMode,
  MessageDto,
  PromptCatalogDto,
  PromptSummaryDto,
  RequestStatusDto,
  TranscriptionResponseDto,
  UserProfileDto,
} from "@/lib/data-insights/contracts";
import { parsePromptCatalogDto } from "@/lib/data-insights/contracts";
import { getElasticTextareaSize } from "@/lib/data-insights/elastic-textarea";

import styles from "./data-insights.module.css";
import { BrandMark } from "./brand-mark";
import { PromptBrowser } from "./prompt-browser";
import { ReportAttachment, ReportView } from "./report-view";
import { SafeMarkdown } from "./safe-markdown";

type CaptureState = "idle" | "recording" | "transcribing" | "review";
type ComposerPlacement = "centered" | "floating" | "constrained";
type Confirmation = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  confirm: () => void;
  cancel?: () => void;
};

function draftKey(chatId: string | null) {
  return `cfi-data-insights-draft:${chatId ?? "new"}`;
}

async function responseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T | ApiErrorDto;
  if (!response.ok) throw new Error((body as ApiErrorDto).error.message);
  return body as T;
}

function focusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function MicrophoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="7" y="7" width="10" height="10" />
    </svg>
  );
}

function DiscardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

function PromptLibraryIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </svg>
  );
}

function useFocusTrap(
  active: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onEscape: () => void,
) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    requestAnimationFrame(() => focusableElements(container)[0]?.focus());
    function keydown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableElements(container);
      if (!items.length) return;
      const start = items[0];
      const end = items[items.length - 1];
      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && document.activeElement === end) {
        event.preventDefault();
        start.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [active, onEscape, ref]);
}

function ConfirmationDialog({
  confirmation,
  onCancel,
}: {
  confirmation: Confirmation | null;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(Boolean(confirmation), dialogRef, onCancel);
  if (!confirmation) return null;
  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        className={styles.confirmationDialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-body"
        ref={dialogRef}
      >
        <h2 id="confirmation-title">{confirmation.title}</h2>
        <p id="confirmation-body">{confirmation.body}</p>
        <div>
          <button type="button" onClick={onCancel}>{confirmation.cancelLabel}</button>
          <button className={styles.dangerButton} type="button" onClick={confirmation.confirm}>
            {confirmation.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Message({
  message,
  onOpenReport,
  onExpired,
}: {
  message: MessageDto;
  onOpenReport: (artifactId: string, source: HTMLButtonElement) => void;
  onExpired: () => void;
}) {
  return (
    <article className={message.role === "user" ? styles.userMessage : styles.assistantMessage}>
      <p className={styles.messageAuthor}>{message.role === "user" ? "You" : "Data Insights"}</p>
      {message.role === "assistant" && message.bodyMarkdown ? (
        <SafeMarkdown>{message.bodyMarkdown}</SafeMarkdown>
      ) : (
        <p className={styles.userText}>{message.content}</p>
      )}
      {message.attachments.map((attachment) => (
        <ReportAttachment
          attachment={attachment}
          key={attachment.id}
          onOpen={onOpenReport}
          onExpired={onExpired}
        />
      ))}
    </article>
  );
}

function ProfileView({
  user,
  loading,
  error,
  onRetry,
  onBack,
  backLabel,
}: {
  user: UserProfileDto | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
  backLabel: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  if (loading) return <main className={styles.profile}><h1 ref={headingRef} tabIndex={-1}>Profile</h1><p>Loading profile…</p></main>;
  if (!user || error) {
    return (
      <main className={styles.profile}>
        <h1 ref={headingRef} tabIndex={-1}>Profile</h1>
        <p role="alert">Your profile could not be loaded. Try again.</p>
        <div className={styles.profileActions}><button type="button" onClick={onRetry}>Retry</button><button type="button" onClick={onBack}>Back</button></div>
      </main>
    );
  }
  const fields = [
    ["Display name", user.displayName, true],
    ["First name", user.firstName, false],
    ["Last name", user.lastName, false],
    ["Email address", user.email, true],
    ["Designation", user.designation ?? "Not provided", false],
    ["Department", user.department ?? "Not provided", false],
  ] as const;
  return (
    <main className={styles.profile}>
      <h1 ref={headingRef} tabIndex={-1}>Profile</h1>
      <p>Your account details are read-only in this prototype.</p>
      <section className={styles.profileSummary} aria-label="Profile identity">
        <span className={styles.profileInitials} aria-label={`Initials ${user.initials}`}>{user.initials}</span>
        <div><h2>{user.displayName}</h2><p>Synthetic demo profile</p></div>
      </section>
      <dl className={styles.profileFields}>
        {fields.map(([label, value, wide]) => (
          <div className={wide ? styles.profileFieldWide : undefined} key={label}>
            <dt>{label}</dt><dd>{value}</dd>
          </div>
        ))}
      </dl>
      <button className={styles.secondaryButton} type="button" onClick={onBack}>← {backLabel}</button>
    </main>
  );
}

function ChatComposer({
  placement,
  draft,
  textareaRef,
  capture,
  clock,
  sending,
  active,
  codePointCount,
  voiceNotice,
  error,
  onDraftChange,
  onSubmit,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onRecord,
  onStopRecording,
  onCancelCapture,
  onDiscardTranscript,
  onHeightChange,
  promptCatalog,
  promptsLoading,
  promptError,
  promptBrowserOpen,
  promptBrowserSuspended,
  promptOpener,
  onOpenPrompts,
  onClosePrompts,
  onRetryPrompts,
  onSelectPrompt,
}: {
  placement: ComposerPlacement;
  draft: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  capture: CaptureState;
  clock: string;
  sending: boolean;
  active: boolean;
  codePointCount: number;
  voiceNotice: string | null;
  error: string | null;
  onDraftChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  onRecord: () => void;
  onStopRecording: () => void;
  onCancelCapture: () => void;
  onDiscardTranscript: () => void;
  onHeightChange?: (height: number) => void;
  promptCatalog: PromptCatalogDto | null;
  promptsLoading: boolean;
  promptError: string | null;
  promptBrowserOpen: boolean;
  promptBrowserSuspended: boolean;
  promptOpener: HTMLElement | null;
  onOpenPrompts: (source: HTMLButtonElement) => void;
  onClosePrompts: () => void;
  onRetryPrompts: () => void;
  onSelectPrompt: (
    prompt: PromptSummaryDto,
    source: HTMLButtonElement,
  ) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const placementClass = {
    centered: styles.composerCentered,
    floating: styles.composerFloating,
    constrained: styles.composerConstrained,
  }[placement];
  const inputDisabled = sending || active;
  const sendDisabled =
    inputDisabled ||
    capture === "recording" ||
    capture === "transcribing" ||
    !draft.trim() ||
    codePointCount > 4_000;

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const computed = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 22;
    const paddingBlock =
      Number.parseFloat(computed.paddingTop) +
      Number.parseFloat(computed.paddingBottom);
    const borderBlock =
      Number.parseFloat(computed.borderTopWidth) +
      Number.parseFloat(computed.borderBottomWidth);
    const size = getElasticTextareaSize({
      scrollHeight: textarea.scrollHeight,
      lineHeight,
      paddingBlock,
      borderBlock,
    });
    textarea.style.height = `${size.height}px`;
    textarea.style.overflowY = size.overflowing ? "auto" : "hidden";
    formRef.current?.setAttribute(
      "data-expanded",
      String(size.height > lineHeight + paddingBlock + borderBlock + 1),
    );
  }, [textareaRef]);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [draft, placement, resizeTextarea]);

  useEffect(() => {
    window.addEventListener("resize", resizeTextarea);
    return () => window.removeEventListener("resize", resizeTextarea);
  }, [resizeTextarea]);

  useLayoutEffect(() => {
    const form = formRef.current;
    if (!form || !onHeightChange) return;
    const reportHeight = () => onHeightChange(Math.ceil(form.getBoundingClientRect().height));
    reportHeight();
    const observer = new ResizeObserver(reportHeight);
    observer.observe(form);
    return () => observer.disconnect();
  }, [onHeightChange]);

  let status = "Demo voice input · simulated; microphone is not accessed.";
  let statusTone: "quiet" | "error" = "quiet";
  if (codePointCount > 4_000) {
    status = `Shorten your question before sending · ${codePointCount.toLocaleString()} / 4,000`;
    statusTone = "error";
  } else if (error) {
    status = error;
    statusTone = "error";
  } else if (active || sending) {
    status = "Waiting for this reply before you can send another question.";
  } else if (voiceNotice) {
    status = voiceNotice;
  } else if (codePointCount >= 3_600) {
    status = `${codePointCount.toLocaleString()} / 4,000`;
  }

  return (
    <form
      className={`${styles.composer} ${placementClass}`}
      data-placement={placement}
      onSubmit={onSubmit}
      ref={formRef}
    >
      {placement !== "centered" ? <span className={styles.composerFade} aria-hidden="true" /> : null}
      <div className={styles.composerPill} aria-busy={capture === "transcribing" || sending || active}>
        {capture === "idle" || capture === "review" ? (
          <button
            className={styles.promptLibraryButton}
            type="button"
            aria-label={
              placement === "centered" ? undefined : "Browse prompts"
            }
            aria-haspopup="dialog"
            aria-expanded={promptBrowserOpen}
            data-tooltip={
              placement === "centered" ? undefined : "Browse prompts"
            }
            onClick={(event) => onOpenPrompts(event.currentTarget)}
          >
            <PromptLibraryIcon />
            {placement === "centered" ? <span>Browse prompts</span> : null}
          </button>
        ) : null}
        <div className={styles.composerInput}>
          <label htmlFor="chat-question">Your question</label>
          <textarea
            ref={textareaRef}
            id="chat-question"
            aria-describedby="composer-hint composer-status"
            aria-invalid={statusTone === "error"}
            disabled={inputDisabled}
            placeholder="Ask about bids, people, jobs, or a reporting period…"
            rows={1}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className={styles.composerControls}>
          {capture === "recording" ? (
            <>
              <span className={styles.captureState}>Recording · {clock} / 02:00</span>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="Stop recording"
                data-tooltip="Stop recording"
                onClick={onStopRecording}
              >
                <StopIcon />
              </button>
              <button className={styles.compactButton} type="button" onClick={onCancelCapture}>Cancel</button>
            </>
          ) : null}
          {capture === "transcribing" ? (
            <>
              <span className={styles.captureState}>Transcribing…</span>
              <button className={styles.compactButton} type="button" onClick={onCancelCapture}>Cancel transcription</button>
            </>
          ) : null}
          {capture === "idle" ? (
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Record"
              data-tooltip="Record"
              disabled={active || sending}
              onClick={onRecord}
            >
              <MicrophoneIcon />
            </button>
          ) : null}
          {capture === "review" ? (
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Discard transcript"
              data-tooltip="Discard transcript"
              onClick={onDiscardTranscript}
            >
              <DiscardIcon />
            </button>
          ) : null}
          {capture === "idle" || capture === "review" ? (
            <button
              className={`${styles.primaryButton} ${styles.sendButton}`}
              type="submit"
              aria-label="Send question"
              data-tooltip="Send question"
              disabled={sendDisabled}
            >
              <SendIcon />
              <span className={styles.sendLabel}>{sending ? "Sending…" : "Send"}</span>
            </button>
          ) : null}
        </div>
      </div>
      <p
        className={`${styles.composerStatus} ${statusTone === "error" ? styles.composerStatusError : ""}`}
        id="composer-status"
        role={statusTone === "error" ? "alert" : "status"}
      >
        {status}
      </p>
      <span className={styles.srOnly} id="composer-hint">Enter sends. Shift plus Enter adds a line.</span>
      <PromptBrowser
        open={promptBrowserOpen}
        placement={placement}
        catalog={promptCatalog}
        loading={promptsLoading}
        error={promptError}
        opener={promptOpener}
        suspended={promptBrowserSuspended}
        onClose={onClosePrompts}
        onRetry={onRetryPrompts}
        onSelect={onSelectPrompt}
      />
    </form>
  );
}

export function ChatWorkspace({
  chatId,
  view = "chat",
}: {
  chatId: string | null;
  view?: "chat" | "profile";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reportId = view === "chat" ? searchParams.get("report") : null;
  const pageParam = Number(searchParams.get("page") ?? "1");
  const reportPage = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openChatsRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const messageScrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reportOpenerRef = useRef<HTMLButtonElement | null>(null);
  const reportScrollTopRef = useRef<number | null>(null);
  const restoreReportFocusRef = useRef(false);
  const initialReport = useRef(reportId);
  const draftReady = useRef(false);
  const composing = useRef(false);
  const transcriptionController = useRef<AbortController | null>(null);
  const transcriptionGeneration = useRef(0);
  const recordingTimeout = useRef<number | null>(null);
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [chats, setChats] = useState<ChatListDto["chats"]>([]);
  const [detail, setDetail] = useState<ChatDetailDto | null>(null);
  const [draft, setDraft] = useState("");
  const [requestState, setRequestState] = useState<RequestStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [sending, setSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const [capture, setCapture] = useState<CaptureState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [preTranscriptDraft, setPreTranscriptDraft] = useState("");
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [newAnswer, setNewAnswer] = useState(false);
  const [promptCatalog, setPromptCatalog] = useState<PromptCatalogDto | null>(
    null,
  );
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [promptBrowserOpen, setPromptBrowserOpen] = useState(false);
  const [promptOpener, setPromptOpener] = useState<HTMLButtonElement | null>(
    null,
  );

  const updateComposerOverlayHeight = useCallback((height: number) => {
    const scroller = messageScrollerRef.current;
    if (!scroller) return;
    const previousTop = scroller.scrollTop;
    const wasNearEnd =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 120;
    scroller.style.setProperty("--composer-overlay-height", `${height}px`);
    scroller.parentElement?.style.setProperty(
      "--composer-overlay-height",
      `${height}px`,
    );
    requestAnimationFrame(() => {
      if (wasNearEnd) scroller.scrollTop = scroller.scrollHeight;
      else scroller.scrollTop = previousTop;
    });
  }, []);

  const expireSession = useCallback(() => {
    transcriptionGeneration.current += 1;
    transcriptionController.current?.abort();
    sessionStorage.clear();
    router.replace("/login?reason=expired");
    router.refresh();
  }, [router]);

  const loadChats = useCallback(async () => {
    const response = await fetch("/api/chats", { cache: "no-store" });
    if (response.status === 401) return expireSession();
    setChats((await responseJson<ChatListDto>(response)).chats);
  }, [expireSession]);

  const loadDetail = useCallback(async () => {
    if (!chatId || view === "profile") {
      setDetail(null);
      setRequestState(null);
      return;
    }
    const response = await fetch(`/api/chats/${chatId}/messages`, { cache: "no-store" });
    if (response.status === 401) return expireSession();
    const next = await responseJson<ChatDetailDto>(response);
    setDetail(next);
    setRequestState(
      next.activeRequest ??
        (next.latestRequest?.status === "failed" ||
        next.latestRequest?.status === "interrupted"
          ? next.latestRequest
          : null),
    );
  }, [chatId, expireSession, view]);

  const loadPromptCatalog = useCallback(async () => {
    setPromptsLoading(true);
    setPromptError(null);
    try {
      const response = await fetch("/api/prompts", { cache: "no-store" });
      if (response.status === 401) {
        expireSession();
        return;
      }
      const payload = await responseJson<unknown>(response);
      setPromptCatalog(parsePromptCatalogDto(payload));
    } catch (caught) {
      setPromptCatalog(null);
      setPromptError(
        caught instanceof Error
          ? caught.message
          : "The prompt catalog is unavailable.",
      );
    } finally {
      setPromptsLoading(false);
    }
  }, [expireSession]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const profileResponse = await fetch("/api/me", { cache: "no-store" });
        if (profileResponse.status === 401) return expireSession();
        const profile = await responseJson<{ user: UserProfileDto }>(profileResponse);
        if (!mounted) return;
        setUser(profile.user);
        await Promise.all([loadChats(), loadDetail()]);
      } catch (caught) {
        if (mounted) setError(caught instanceof Error ? caught.message : "This workspace could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [expireSession, loadAttempt, loadChats, loadDetail]);

  useEffect(() => {
    if (view !== "chat") return;
    const frame = requestAnimationFrame(() => void loadPromptCatalog());
    return () => cancelAnimationFrame(frame);
  }, [loadPromptCatalog, view]);

  useEffect(() => {
    if (view === "profile") return;
    draftReady.current = false;
    const frame = requestAnimationFrame(() => {
      setDraft(sessionStorage.getItem(draftKey(chatId)) ?? "");
      draftReady.current = true;
      if (!initialReport.current) headingRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [chatId, view]);

  useEffect(() => {
    if (draftReady.current && view === "chat") sessionStorage.setItem(draftKey(chatId), draft);
  }, [chatId, draft, view]);

  useEffect(() => {
    if (reportId || !restoreReportFocusRef.current) return;
    restoreReportFocusRef.current = false;
    let restoreFrame = 0;
    const frame = requestAnimationFrame(() => {
      restoreFrame = requestAnimationFrame(() => {
        if (reportScrollTopRef.current !== null && messageScrollerRef.current) {
          const previousBehavior = messageScrollerRef.current.style.scrollBehavior;
          messageScrollerRef.current.style.scrollBehavior = "auto";
          messageScrollerRef.current.scrollTop = reportScrollTopRef.current;
          messageScrollerRef.current.style.scrollBehavior = previousBehavior;
        }
        const target =
          reportOpenerRef.current ??
          document.querySelector<HTMLButtonElement>(
            'button[aria-label^="Open report:"]',
          );
        (target ?? headingRef.current)?.focus({ preventScroll: true });
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(restoreFrame);
    };
  }, [reportId]);

  useEffect(() => {
    if (!reportId) return;
    const replacementQuery = window.matchMedia("(max-width: 1279px)");
    const closeChatOverlayForReplacement = () => {
      if (!replacementQuery.matches) return;
      setPromptBrowserOpen(false);
      setPromptOpener(null);
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>("#report-heading")
          ?.focus({ preventScroll: true });
      });
    };
    closeChatOverlayForReplacement();
    replacementQuery.addEventListener(
      "change",
      closeChatOverlayForReplacement,
    );
    return () =>
      replacementQuery.removeEventListener(
        "change",
        closeChatOverlayForReplacement,
      );
  }, [reportId]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    requestAnimationFrame(() => openChatsRef.current?.focus());
  }, [setDrawerOpen]);
  useFocusTrap(drawerOpen, drawerRef, closeDrawer);

  useEffect(() => {
    if (!accountOpen) return;
    function keydown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        requestAnimationFrame(() => accountRef.current?.focus());
      }
    }
    function pointer(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node) && !accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", pointer);
    return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("pointerdown", pointer); };
  }, [accountOpen]);

  useEffect(() => {
    if (capture !== "recording") return;
    const interval = window.setInterval(() => setRecordingSeconds((value) => Math.min(value + 1, 120)), 1000);
    return () => window.clearInterval(interval);
  }, [capture]);

  const stopRecording = useCallback(async (reason: "manual" | "limit" = "manual") => {
    if (recordingTimeout.current !== null) window.clearTimeout(recordingTimeout.current);
    const generation = ++transcriptionGeneration.current;
    const controller = new AbortController();
    transcriptionController.current = controller;
    setCapture("transcribing");
    setVoiceNotice(
      reason === "limit"
        ? "Recording stopped at the two-minute limit. Transcribing…"
        : "Recording stopped. Transcribing…",
    );
    try {
      const response = await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "simulated", clientTranscriptionId: `transcription_${crypto.randomUUID()}` }),
        signal: controller.signal,
      });
      if (response.status === 401) return expireSession();
      const result = await responseJson<TranscriptionResponseDto>(response);
      if (generation !== transcriptionGeneration.current) return;
      if (result.status === "completed") {
        setDraft((current) => {
          setPreTranscriptDraft(current);
          const joined = current.trim() ? `${current}\n\n${result.transcript}` : result.transcript;
          setTranscriptDraft(joined);
          return joined;
        });
        setCapture("review");
        setVoiceNotice("Transcript added. Review before sending.");
      } else {
        const copy = {
          empty: "No clear speech was detected. Try recording again or type your question.",
          failed: "The recording could not be transcribed. Record again or type your question.",
          timeout: "Transcription took too long. Record again or type your question.",
        } as const;
        setCapture("idle");
        setVoiceNotice(copy[result.code]);
      }
    } catch (caught) {
      if (!controller.signal.aborted && generation === transcriptionGeneration.current) {
        setCapture("idle");
        setVoiceNotice(caught instanceof Error ? caught.message : "The recording could not be transcribed. Record again or type your question.");
      }
    }
  }, [expireSession]);

  useEffect(() => {
    if (!requestState || (requestState.status !== "queued" && requestState.status !== "running")) return;
    let mounted = true;
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/requests/${requestState.id}`, { cache: "no-store" });
        if (response.status === 401) return expireSession();
        const next = await responseJson<RequestStatusDto>(response);
        if (!mounted) return;
        setRequestState(next);
        if (next.status === "completed" || next.status === "failed" || next.status === "interrupted") {
          const scroller = messageScrollerRef.current;
          const wasNearEnd = !scroller || scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 120;
          setOptimisticMessage(null);
          await Promise.all([loadDetail(), loadChats()]);
          if (wasNearEnd) requestAnimationFrame(() => scroller?.scrollTo({ top: scroller.scrollHeight, behavior: preferredScrollBehavior() }));
          else setNewAnswer(true);
        }
      } catch (caught) {
        if (mounted) setError(caught instanceof Error ? caught.message : "The request status could not be checked.");
      }
    }, 450);
    return () => { mounted = false; window.clearTimeout(timeout); };
  }, [expireSession, loadChats, loadDetail, requestState]);

  function cancelCapture() {
    transcriptionGeneration.current += 1;
    transcriptionController.current?.abort();
    if (recordingTimeout.current !== null) window.clearTimeout(recordingTimeout.current);
    setCapture("idle");
    setRecordingSeconds(0);
    setVoiceNotice("Simulation canceled. Your typed question was kept.");
  }

  function guarded(action: () => void) {
    if (capture === "recording") {
      setConfirmation({ title: "Discard recording?", body: "This recording has not been sent. Discard it and continue?", confirmLabel: "Discard and continue", cancelLabel: "Keep recording", confirm: () => { setConfirmation(null); cancelCapture(); action(); } });
      return;
    }
    if (capture === "transcribing") {
      setConfirmation({ title: "Cancel transcription?", body: "The transcript has not been added to your question. Cancel it and continue?", confirmLabel: "Cancel and continue", cancelLabel: "Keep transcribing", confirm: () => { setConfirmation(null); cancelCapture(); action(); } });
      return;
    }
    action();
  }

  function beginRecording() {
    setCapture("recording");
    setRecordingSeconds(0);
    setVoiceNotice("Simulated recording started. No microphone is used.");
    recordingTimeout.current = window.setTimeout(() => void stopRecording("limit"), 120_000);
  }

  function discardTranscript() {
    const apply = () => { setDraft(preTranscriptDraft); setTranscriptDraft(""); setCapture("idle"); setVoiceNotice("Transcript discarded. Your earlier question was restored."); setConfirmation(null); };
    if (draft !== transcriptDraft) {
      setConfirmation({ title: "Discard the reviewed transcript?", body: "This restores the question text from before the transcript was added. Changes made during transcript review will be discarded.", confirmLabel: "Discard transcript", cancelLabel: "Keep editing", confirm: apply });
    } else apply();
  }

  const closePromptBrowser = useCallback(() => {
    setPromptBrowserOpen(false);
    requestAnimationFrame(() => promptOpener?.focus());
  }, [promptOpener]);

  function openPromptBrowser(source: HTMLButtonElement) {
    setPromptOpener(source);
    setPromptBrowserOpen(true);
  }

  function applyPrompt(prompt: PromptSummaryDto) {
    setDraft(prompt.promptText);
    setError(null);
    setConfirmation(null);
    setPromptBrowserOpen(false);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(prompt.promptText.length, prompt.promptText.length);
    });
  }

  function selectPrompt(prompt: PromptSummaryDto, source: HTMLButtonElement) {
    if (draft.length > 0 && draft !== prompt.promptText) {
      setConfirmation({
        title: "Replace your current question?",
        body: "Choosing this prompt will replace your current draft. Nothing will be sent until you choose Send.",
        confirmLabel: "Replace draft",
        cancelLabel: "Keep draft",
        confirm: () => applyPrompt(prompt),
        cancel: () => {
          setConfirmation(null);
          requestAnimationFrame(() => source.focus());
        },
      });
      return;
    }
    applyPrompt(prompt);
  }

  function cancelConfirmation() {
    if (confirmation?.cancel) confirmation.cancel();
    else setConfirmation(null);
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (capture === "recording" || capture === "transcribing") {
      return;
    }
    const content = draft;
    const count = [...content].length;
    if (!content.trim()) {
      setError("Enter a question to send.");
      textareaRef.current?.focus();
      return;
    }
    if (count > 4_000) {
      setError("Your question is over 4,000 characters. Shorten it before sending.");
      textareaRef.current?.focus();
      return;
    }
    if (requestState?.status === "queued" || requestState?.status === "running") return;
    setSending(true);
    setError(null);
    setOptimisticMessage(content.trim());
    const inputMode: InputMode = capture === "review" ? "voice" : "typed";
    try {
      const response = await fetch(chatId ? `/api/chats/${chatId}/messages` : "/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, inputMode, clientSubmissionId: `submission_${crypto.randomUUID()}` }),
      });
      if (response.status === 401) return expireSession();
      const created = await responseJson<CreateMessageResponseDto>(response);
      sessionStorage.removeItem(draftKey(chatId));
      setDraft(""); setCapture("idle"); setVoiceNotice(null); setTranscriptDraft("");
      setRequestState(created.request);
      if (!chatId) router.replace(`/app/chats/${created.chat.id}`);
      else await Promise.all([loadDetail(), loadChats()]);
    } catch (caught) {
      setOptimisticMessage(null);
      setError(caught instanceof Error ? caught.message : "Your question could not be sent.");
    } finally { setSending(false); }
  }

  async function retry() {
    if (!requestState || !requestState.retryable) return;
    setError(null);
    try {
      const response = await fetch(`/api/requests/${requestState.id}/retry`, { method: "POST" });
      if (response.status === 401) return expireSession();
      setRequestState(await responseJson<RequestStatusDto>(response));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "This question could not be retried."); }
  }

  async function logout() {
    transcriptionGeneration.current += 1;
    transcriptionController.current?.abort();
    await fetch("/api/auth/logout", { method: "POST" });
    sessionStorage.clear();
    router.replace("/login?reason=signed-out");
    router.refresh();
  }

  function navigate(href: string) {
    guarded(() => { setDrawerOpen(false); setAccountOpen(false); router.push(href); });
  }

  function openProfile() {
    sessionStorage.setItem("cfi-data-insights-return", `${window.location.pathname}${window.location.search}`);
    setAccountOpen(false);
    navigate(`/app/profile?from=${chatId ? "conversation" : "workspace"}`);
  }

  function backFromProfile() {
    const fallback = searchParams.get("from") === "workspace" ? "/app" : "/app/chat";
    const stored = sessionStorage.getItem("cfi-data-insights-return") ?? fallback;
    const safe = stored.startsWith("/app") && !stored.startsWith("//") ? stored : fallback;
    sessionStorage.removeItem("cfi-data-insights-return");
    router.push(safe);
  }

  function openReport(artifactId: string, source: HTMLButtonElement) {
    guarded(() => {
      reportOpenerRef.current = source;
      reportScrollTopRef.current = messageScrollerRef.current?.scrollTop ?? 0;
      setPromptBrowserOpen(false);
      setPromptOpener(null);
      const remembered = sessionStorage.getItem(`cfi-data-insights-report-page:${artifactId}`) ?? "1";
      router.replace(`${pathname}?report=${encodeURIComponent(artifactId)}&page=${remembered}`, { scroll: false });
    });
  }

  function closeReport() {
    if (messageScrollerRef.current?.getClientRects().length) {
      reportScrollTopRef.current = messageScrollerRef.current.scrollTop;
    }
    setPromptBrowserOpen(false);
    setPromptOpener(null);
    restoreReportFocusRef.current = true;
    router.replace(pathname, { scroll: false });
  }

  function setReportPage(page: number) {
    if (!reportId) return;
    sessionStorage.setItem(`cfi-data-insights-report-page:${reportId}`, String(page));
    router.replace(`${pathname}?report=${encodeURIComponent(reportId)}&page=${page}`, { scroll: false });
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !composing.current) { event.preventDefault(); void submit(); }
  }

  const codePointCount = [...draft].length;
  const active = requestState?.status === "queued" || requestState?.status === "running";
  const clock = `${String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:${String(recordingSeconds % 60).padStart(2, "0")}`;
  const renderComposer = (
    placement: ComposerPlacement,
    onHeightChange?: (height: number) => void,
  ) => (
    <ChatComposer
      placement={placement}
      draft={draft}
      textareaRef={textareaRef}
      capture={capture}
      clock={clock}
      sending={sending}
      active={active}
      codePointCount={codePointCount}
      voiceNotice={voiceNotice}
      error={error}
      onDraftChange={(value) => {
        setDraft(value);
        setError(null);
      }}
      onSubmit={submit}
      onKeyDown={onComposerKeyDown}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={() => { composing.current = false; }}
      onRecord={beginRecording}
      onStopRecording={() => void stopRecording()}
      onCancelCapture={cancelCapture}
      onDiscardTranscript={discardTranscript}
      onHeightChange={onHeightChange}
      promptCatalog={promptCatalog}
      promptsLoading={promptsLoading}
      promptError={promptError}
      promptBrowserOpen={promptBrowserOpen}
      promptBrowserSuspended={Boolean(confirmation)}
      promptOpener={promptOpener}
      onOpenPrompts={openPromptBrowser}
      onClosePrompts={closePromptBrowser}
      onRetryPrompts={() => void loadPromptCatalog()}
      onSelectPrompt={selectPrompt}
    />
  );

  let main: ReactNode;
  if (view === "profile") {
    main = <ProfileView user={user} loading={loading} error={error} onRetry={() => setLoadAttempt((value) => value + 1)} onBack={backFromProfile} backLabel={searchParams.get("from") === "conversation" ? "Back to conversation" : "Back to workspace"} />;
  } else {
    main = (
      <div className={`${styles.mainWorkspace} ${reportId ? styles.withReport : ""}`}>
        <main className={styles.conversation}>
          <header className={styles.conversationHeader}>
            <h1 ref={headingRef} tabIndex={-1}>{detail?.chat.title ?? "Ask about your data"}</h1>
            <p>Synthetic demo · Fictional bid data · UTC</p>
          </header>
          <div className={`${styles.messageScroller} ${detail ? styles.messageScrollerOngoing : styles.messageScrollerEmpty}`} aria-live="polite" ref={messageScrollerRef}>
            {loading ? <p className={styles.statusText}>Loading your workspace…</p> : null}
            {!loading && !detail ? (
              <section className={styles.emptyWorkspace}>
                <p className={styles.eyebrow}>Synthetic Data Insights</p>
                <h2>What would you like to know?</h2>
                <p>Ask about bids, people, jobs, or a reporting period.</p>
                {renderComposer("centered")}
                <div className={styles.suggestions}>
                  <strong>Try a prompt</strong>
                  {promptsLoading ? <p>Loading starter prompts…</p> : null}
                  {!promptsLoading && promptError ? (
                    <div className={styles.suggestionState}>
                      <span>Starter prompts are unavailable. You can still type your own question.</span>
                      <button type="button" onClick={() => void loadPromptCatalog()}>
                        Try again
                      </button>
                    </div>
                  ) : null}
                  {promptCatalog?.prompts.slice(0, 5).map((prompt) => (
                    <button
                      type="button"
                      key={prompt.id}
                      onClick={(event) => selectPrompt(prompt, event.currentTarget)}
                    >
                      {prompt.promptText}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
            {detail?.messages.map((message) => <Message key={message.id} message={message} onOpenReport={openReport} onExpired={expireSession} />)}
            {optimisticMessage && !detail?.messages.some((message) => message.content === optimisticMessage) ? <article className={styles.userMessage}><p className={styles.messageAuthor}>You</p><p className={styles.userText}>{optimisticMessage}</p></article> : null}
            {active ? <p className={styles.processing} role="status">Data Insights is preparing a simulated answer…</p> : null}
            {requestState && (requestState.status === "failed" || requestState.status === "interrupted") ? <section className={styles.requestError} role="alert"><strong>This answer could not be completed.</strong><p>{requestState.error.message}</p>{requestState.retryable ? <button type="button" onClick={retry}>Retry question</button> : null}</section> : null}
          </div>
          {detail
            ? renderComposer(
                reportId ? "constrained" : "floating",
                updateComposerOverlayHeight,
              )
            : null}
          {detail && newAnswer ? (
            <button
              className={styles.newAnswerButton}
              type="button"
              onClick={() => {
                messageScrollerRef.current?.scrollTo({
                  top: messageScrollerRef.current.scrollHeight,
                  behavior: preferredScrollBehavior(),
                });
                setNewAnswer(false);
              }}
            >
              New answer ↓
            </button>
          ) : null}
        </main>
        {reportId ? <ReportView key={reportId} artifactId={reportId} requestedPage={reportPage} onClose={closeReport} onPage={setReportPage} onExpired={expireSession} /> : null}
      </div>
    );
  }

  return (
    <div className={styles.appShell}>
      <header className={styles.appHeader}>
        <button ref={openChatsRef} className={styles.openChats} type="button" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen}>Chats</button>
        <Link className={styles.brandHome} href="/app" aria-label="CFI internal workspace" onClick={(event) => { event.preventDefault(); navigate("/app"); }}><BrandMark /></Link>
        <span className={styles.productName}>Data Insights Chat</span>
        <Link className={styles.headerButton} href="/app" onClick={(event) => { event.preventDefault(); navigate("/app"); }}>All features</Link>
        <div className={styles.accountArea}>
          <span className={styles.accountName}>{user?.displayName ?? "Account"}</span>
          <button ref={accountRef} className={styles.initials} type="button" aria-label="Account actions" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)}>{user?.initials ?? "—"}</button>
          {accountOpen ? <div className={styles.accountMenu} ref={accountMenuRef}><button type="button" onClick={openProfile}>Profile</button><button type="button" onClick={() => { setAccountOpen(false); guarded(() => void logout()); }}>Log out</button></div> : null}
        </div>
      </header>
      <div className={styles.workspace}>
        {drawerOpen ? <button className={styles.drawerBackdrop} type="button" aria-label="Close chats" onClick={closeDrawer} /> : null}
        <aside ref={drawerRef} className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`} aria-label="Chat history">
          <div className={styles.drawerHeading}><strong>Chats</strong><button type="button" onClick={closeDrawer}>Close</button></div>
          <Link className={styles.newChatButton} href="/app/chat" onClick={(event) => { event.preventDefault(); navigate("/app/chat"); }}>New chat</Link>
          <h2>Recent chats</h2>
          {chats.length ? <nav className={styles.chatList}>{chats.map((chat) => <Link aria-current={chat.id === chatId ? "page" : undefined} className={chat.id === chatId ? styles.activeChat : ""} href={`/app/chats/${chat.id}`} key={chat.id} onClick={(event) => { event.preventDefault(); navigate(`/app/chats/${chat.id}`); }}>{chat.title}</Link>)}</nav> : <p className={styles.emptyHistory}>No saved chats yet.</p>}
        </aside>
        {main}
      </div>
      <ConfirmationDialog confirmation={confirmation} onCancel={cancelConfirmation} />
    </div>
  );
}
