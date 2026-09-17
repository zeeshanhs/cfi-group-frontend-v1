"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
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
  RequestStatusDto,
  TranscriptionResponseDto,
  UserProfileDto,
} from "@/lib/data-insights/contracts";

import styles from "./data-insights.module.css";
import { BrandMark } from "./brand-mark";
import { ReportAttachment, ReportView } from "./report-view";
import { SafeMarkdown } from "./safe-markdown";

const suggestions = [
  "How many bids were created last month?",
  "How many bids did Casey Patel create in the past seven days?",
  "Show the report of bids created in the past seven days.",
];

type CaptureState = "idle" | "recording" | "transcribing" | "review";
type Confirmation = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  confirm: () => void;
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
  const reportOpenerRef = useRef<HTMLButtonElement | null>(null);
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
    if (view === "profile") return;
    draftReady.current = false;
    const frame = requestAnimationFrame(() => {
      setDraft(sessionStorage.getItem(draftKey(chatId)) ?? "");
      draftReady.current = true;
      if (!initialReport.current) headingRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [chatId, view]);

  useEffect(() => {
    if (draftReady.current && view === "chat") sessionStorage.setItem(draftKey(chatId), draft);
  }, [chatId, draft, view]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    requestAnimationFrame(() => openChatsRef.current?.focus());
  }, []);
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

  const stopRecording = useCallback(async () => {
    if (recordingTimeout.current !== null) window.clearTimeout(recordingTimeout.current);
    const generation = ++transcriptionGeneration.current;
    const controller = new AbortController();
    transcriptionController.current = controller;
    setCapture("transcribing");
    setVoiceNotice(null);
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
        setVoiceNotice("Transcript added. Review it before sending.");
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
          if (wasNearEnd) requestAnimationFrame(() => scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" }));
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
    setVoiceNotice(null);
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
    setVoiceNotice(null);
    recordingTimeout.current = window.setTimeout(() => void stopRecording(), 120_000);
  }

  function discardTranscript() {
    const apply = () => { setDraft(preTranscriptDraft); setTranscriptDraft(""); setCapture("idle"); setVoiceNotice(null); setConfirmation(null); };
    if (draft !== transcriptDraft) {
      setConfirmation({ title: "Discard the reviewed transcript?", body: "This restores the question text from before the transcript was added. Changes made during transcript review will be discarded.", confirmLabel: "Discard transcript", cancelLabel: "Keep editing", confirm: apply });
    } else apply();
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (capture === "recording" || capture === "transcribing") {
      return;
    }
    const content = draft;
    const count = [...content].length;
    if (!content.trim()) return setError("Enter a question to send.");
    if (count > 4_000) return setError("Your question is over 4,000 characters. Shorten it before sending.");
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
      const remembered = sessionStorage.getItem(`cfi-data-insights-report-page:${artifactId}`) ?? "1";
      router.replace(`${pathname}?report=${encodeURIComponent(artifactId)}&page=${remembered}`, { scroll: false });
    });
  }

  function closeReport() {
    router.replace(pathname, { scroll: false });
    requestAnimationFrame(() => {
      const target =
        reportOpenerRef.current ??
        document.querySelector<HTMLButtonElement>('button[aria-label^="Open report:"]');
      (target ?? headingRef.current)?.focus({ preventScroll: true });
    });
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

  let main: ReactNode;
  if (view === "profile") {
    main = <ProfileView user={user} loading={loading} error={error} onRetry={() => setLoadAttempt((value) => value + 1)} onBack={backFromProfile} backLabel={searchParams.get("from") === "conversation" ? "Back to conversation" : "Back to workspace"} />;
  } else {
    main = (
      <div className={`${styles.mainWorkspace} ${reportId ? styles.withReport : ""}`}>
        <main className={styles.conversation}>
          <header className={styles.conversationHeader}>
            <h1 ref={headingRef} tabIndex={-1}>{detail?.chat.title ?? "Ask about your data"}</h1>
            {detail ? <p>Fictional bid data · UTC</p> : null}
          </header>
          <div className={styles.messageScroller} aria-live="polite" ref={messageScrollerRef}>
            {loading ? <p className={styles.statusText}>Loading your workspace…</p> : null}
            {!loading && !detail ? (
              <section className={styles.emptyWorkspace}>
                <p className={styles.eyebrow}>Synthetic Data Insights</p>
                <h2>Ask about bids. Inspect the details.</h2>
                <p>Ask for a count or a detailed report. Your chats are private to your account.</p>
                {!draft ? <div className={styles.suggestions}><strong>Try a question</strong>{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setDraft(suggestion)}>{suggestion}</button>)}</div> : null}
              </section>
            ) : null}
            {detail?.messages.map((message) => <Message key={message.id} message={message} onOpenReport={openReport} onExpired={expireSession} />)}
            {optimisticMessage && !detail?.messages.some((message) => message.content === optimisticMessage) ? <article className={styles.userMessage}><p className={styles.messageAuthor}>You</p><p className={styles.userText}>{optimisticMessage}</p></article> : null}
            {active ? <p className={styles.processing} role="status">Data Insights is preparing a simulated answer…</p> : null}
            {newAnswer ? <button className={styles.newAnswerButton} type="button" onClick={() => { messageScrollerRef.current?.scrollTo({ top: messageScrollerRef.current.scrollHeight, behavior: "smooth" }); setNewAnswer(false); }}>New answer ↓</button> : null}
            {requestState && (requestState.status === "failed" || requestState.status === "interrupted") ? <section className={styles.requestError} role="alert"><strong>This answer could not be completed.</strong><p>{requestState.error.message}</p>{requestState.retryable ? <button type="button" onClick={retry}>Retry question</button> : null}</section> : null}
          </div>
          <form className={styles.composer} onSubmit={submit}>
            <label htmlFor="chat-question">Your question</label>
            <textarea id="chat-question" placeholder="Ask about bids, people or a reporting period…" rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={onComposerKeyDown} />
            <div className={styles.captureRow}>
              {capture === "idle" ? <button className={styles.secondaryButton} type="button" onClick={beginRecording}>Record</button> : null}
              {capture === "recording" ? <><span role="status">Recording · {clock} / 02:00</span><button type="button" onClick={() => void stopRecording()}>Stop recording</button><button type="button" onClick={cancelCapture}>Cancel</button></> : null}
              {capture === "transcribing" ? <><span role="status">Transcribing…</span><button type="button" onClick={cancelCapture}>Cancel transcription</button></> : null}
              {capture === "review" ? <button type="button" onClick={discardTranscript}>Discard transcript</button> : null}
              <span className={styles.simulatedLabel}>Simulated recording · no microphone access</span>
            </div>
            {voiceNotice ? <p className={styles.voiceNotice} role="status">{voiceNotice}</p> : null}
            <div className={styles.composerActions}><span>Enter sends · Shift+Enter adds a line</span><button className={styles.primaryButton} type="submit" disabled={sending || active || capture === "recording" || capture === "transcribing" || !draft.trim() || codePointCount > 4_000}>{sending ? "Sending…" : "Send"}</button></div>
            {active ? <p className={styles.waitNotice}>Wait for this reply before sending another question.</p> : null}
            {codePointCount >= 3_600 ? <span className={codePointCount > 4_000 ? styles.counterError : styles.counter}>{codePointCount.toLocaleString()} / 4,000</span> : null}
            {error ? <p className={styles.inlineError} role="alert">{error}</p> : null}
          </form>
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
      <div className={styles.modeStrip}><strong>Data Insights Chat</strong><span className={styles.modeDesktop}>Synthetic demo · Fictional data · Reporting timezone: UTC</span><span className={styles.modeMobile}>Synthetic demo · Fictional data · UTC</span></div>
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
      <ConfirmationDialog confirmation={confirmation} onCancel={() => setConfirmation(null)} />
    </div>
  );
}
