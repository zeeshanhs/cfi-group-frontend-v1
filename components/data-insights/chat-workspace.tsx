"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
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
  MessageDto,
  RequestStatusDto,
  UserProfileDto,
} from "@/lib/data-insights/contracts";

import styles from "./data-insights.module.css";
import { BrandMark } from "./brand-mark";
import { SafeMarkdown } from "./safe-markdown";

const suggestions = [
  "How many bids were created last month?",
  "How many bids did Casey Patel create in the past seven days?",
  "Show the report of bids created in the past seven days.",
];

function draftKey(chatId: string | null) {
  return `cfi-data-insights-draft:${chatId ?? "new"}`;
}

async function responseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T | ApiErrorDto;
  if (!response.ok) throw new Error((body as ApiErrorDto).error.message);
  return body as T;
}

function Message({ message }: { message: MessageDto }) {
  return (
    <article
      className={
        message.role === "user" ? styles.userMessage : styles.assistantMessage
      }
    >
      <p className={styles.messageAuthor}>
        {message.role === "user" ? "You" : "Data Insights"}
      </p>
      {message.role === "assistant" && message.bodyMarkdown ? (
        <SafeMarkdown>{message.bodyMarkdown}</SafeMarkdown>
      ) : (
        <p className={styles.userText}>{message.content}</p>
      )}
      {message.attachments.map((attachment) => (
        <section
          className={styles.attachment}
          key={attachment.id}
          aria-label="Report attachment"
        >
          <span className={styles.attachmentType}>Table report</span>
          <strong>{attachment.title}</strong>
          <span>
            {attachment.snapshotRowCount.toLocaleString()} snapshot rows ·{" "}
            {attachment.columnCount} columns
          </span>
        </section>
      ))}
    </article>
  );
}

export function ChatWorkspace({ chatId }: { chatId: string | null }) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openChatsRef = useRef<HTMLButtonElement>(null);
  const draftReady = useRef(false);
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [chats, setChats] = useState<ChatListDto["chats"]>([]);
  const [detail, setDetail] = useState<ChatDetailDto | null>(null);
  const [draft, setDraft] = useState("");
  const [requestState, setRequestState] =
    useState<RequestStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(
    null,
  );
  const composing = useRef(false);

  const expireSession = useCallback(() => {
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
    if (!chatId) {
      setDetail(null);
      setRequestState(null);
      return;
    }
    const response = await fetch(`/api/chats/${chatId}/messages`, {
      cache: "no-store",
    });
    if (response.status === 401) return expireSession();
    const next = await responseJson<ChatDetailDto>(response);
    setDetail(next);
    setRequestState(next.activeRequest);
  }, [chatId, expireSession]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const profileResponse = await fetch("/api/me", { cache: "no-store" });
        if (profileResponse.status === 401) return expireSession();
        const profile = await responseJson<{ user: UserProfileDto }>(
          profileResponse,
        );
        if (!mounted) return;
        setUser(profile.user);
        await Promise.all([loadChats(), loadDetail()]);
      } catch (caught) {
        if (mounted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "This workspace could not be loaded.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [expireSession, loadChats, loadDetail]);

  useEffect(() => {
    draftReady.current = false;
    const frame = requestAnimationFrame(() => {
      setDraft(sessionStorage.getItem(draftKey(chatId)) ?? "");
      draftReady.current = true;
      headingRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [chatId]);

  useEffect(() => {
    if (draftReady.current) {
      sessionStorage.setItem(draftKey(chatId), draft);
    }
  }, [chatId, draft]);

  useEffect(() => {
    if (!drawerOpen) return;
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        requestAnimationFrame(() => openChatsRef.current?.focus());
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen]);

  useEffect(() => {
    if (
      !requestState ||
      (requestState.status !== "queued" && requestState.status !== "running")
    ) {
      return;
    }
    let mounted = true;
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/requests/${requestState.id}`, {
          cache: "no-store",
        });
        if (response.status === 401) return expireSession();
        const next = await responseJson<RequestStatusDto>(response);
        if (!mounted) return;
        setRequestState(next);
        if (
          next.status === "completed" ||
          next.status === "failed" ||
          next.status === "interrupted"
        ) {
          setOptimisticMessage(null);
          await Promise.all([loadDetail(), loadChats()]);
        }
      } catch (caught) {
        if (mounted) {
          setError(
            caught instanceof Error
              ? caught.message
              : "The request status could not be checked.",
          );
        }
      }
    }, 450);
    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [expireSession, loadChats, loadDetail, requestState]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const content = draft;
    const count = [...content].length;
    if (!content.trim()) {
      setError("Enter a question to send.");
      return;
    }
    if (count > 4_000) {
      setError(
        "Your question is over 4,000 characters. Shorten it before sending.",
      );
      return;
    }
    setSending(true);
    setError(null);
    setOptimisticMessage(content.trim());
    const submission = {
      content,
      inputMode: "typed" as const,
      clientSubmissionId: `submission_${crypto.randomUUID()}`,
    };
    try {
      const endpoint = chatId
        ? `/api/chats/${chatId}/messages`
        : "/api/chats";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (response.status === 401) return expireSession();
      const created = await responseJson<CreateMessageResponseDto>(response);
      sessionStorage.removeItem(draftKey(chatId));
      setDraft("");
      setRequestState(created.request);
      if (!chatId) {
        router.replace(`/app/chats/${created.chat.id}`);
      } else {
        await Promise.all([loadDetail(), loadChats()]);
      }
    } catch (caught) {
      setOptimisticMessage(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Your question could not be sent.",
      );
    } finally {
      setSending(false);
    }
  }

  async function retry() {
    if (!requestState || !requestState.retryable) return;
    setError(null);
    try {
      const response = await fetch(`/api/requests/${requestState.id}/retry`, {
        method: "POST",
      });
      if (response.status === 401) return expireSession();
      setRequestState(await responseJson<RequestStatusDto>(response));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "This question could not be retried.",
      );
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    sessionStorage.clear();
    router.replace("/login?reason=signed-out");
    router.refresh();
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !composing.current) {
      event.preventDefault();
      void submit();
    }
  }

  const codePointCount = [...draft].length;
  const active =
    requestState?.status === "queued" || requestState?.status === "running";

  return (
    <div className={styles.appShell}>
      <header className={styles.appHeader}>
        <button
          ref={openChatsRef}
          className={styles.openChats}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
        >
          Chats
        </button>
        <BrandMark />
        <span className={styles.productName}>Data Insights Chat</span>
        <div className={styles.accountArea}>
          <span className={styles.accountName}>
            {user?.displayName ?? "Account"}
          </span>
          <button
            className={styles.initials}
            type="button"
            aria-label="Account actions"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((value) => !value)}
          >
            {user?.initials ?? "—"}
          </button>
          <button
            className={styles.headerButton}
            type="button"
            onClick={logout}
          >
            Log out
          </button>
          {accountOpen ? (
            <div className={styles.accountMenu}>
              <strong>{user?.displayName}</strong>
              <button type="button" onClick={logout}>
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <div className={styles.modeStrip}>
        <strong>Data Insights Chat</strong>
        <span className={styles.modeDesktop}>
          Synthetic demo · Fictional data · Reporting timezone: UTC
        </span>
        <span className={styles.modeMobile}>
          Synthetic demo · Fictional data · UTC
        </span>
      </div>
      <div className={styles.workspace}>
        {drawerOpen ? (
          <button
            className={styles.drawerBackdrop}
            type="button"
            aria-label="Close chats"
            onClick={() => setDrawerOpen(false)}
          />
        ) : null}
        <aside
          className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`}
          aria-label="Chat history"
        >
          <div className={styles.drawerHeading}>
            <strong>Chats</strong>
            <button type="button" onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>
          <Link
            className={styles.newChatButton}
            href="/app"
            onClick={() => setDrawerOpen(false)}
          >
            New chat
          </Link>
          <h2>Recent chats</h2>
          {chats.length ? (
            <nav className={styles.chatList}>
              {chats.map((chat) => (
                <Link
                  aria-current={chat.id === chatId ? "page" : undefined}
                  className={chat.id === chatId ? styles.activeChat : ""}
                  href={`/app/chats/${chat.id}`}
                  key={chat.id}
                  onClick={() => setDrawerOpen(false)}
                >
                  {chat.title}
                </Link>
              ))}
            </nav>
          ) : (
            <p className={styles.emptyHistory}>No saved chats yet.</p>
          )}
        </aside>
        <main className={styles.conversation}>
          <header className={styles.conversationHeader}>
            <h1 ref={headingRef} tabIndex={-1}>
              {detail?.chat.title ?? "Ask about your data"}
            </h1>
            {detail ? <p>Fictional bid data · UTC</p> : null}
          </header>
          <div className={styles.messageScroller} aria-live="polite">
            {loading ? (
              <p className={styles.statusText}>Loading your workspace…</p>
            ) : null}
            {!loading && !detail ? (
              <section className={styles.emptyWorkspace}>
                <p className={styles.eyebrow}>Synthetic Data Insights</p>
                <h2>Start with a question</h2>
                <p>
                  Explore a bounded set of fictional bid data. No live system or
                  AI service is connected.
                </p>
                <div className={styles.suggestions}>
                  {suggestions.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => setDraft(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
            {detail?.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {optimisticMessage &&
            !detail?.messages.some(
              (message) => message.content === optimisticMessage,
            ) ? (
              <article className={styles.userMessage}>
                <p className={styles.messageAuthor}>You</p>
                <p className={styles.userText}>{optimisticMessage}</p>
              </article>
            ) : null}
            {active ? (
              <p className={styles.processing} role="status">
                Data Insights is preparing a simulated answer…
              </p>
            ) : null}
            {requestState &&
            (requestState.status === "failed" ||
              requestState.status === "interrupted") ? (
              <section className={styles.requestError} role="alert">
                <strong>This answer could not be completed.</strong>
                <p>{requestState.error.message}</p>
                {requestState.retryable ? (
                  <button type="button" onClick={retry}>
                    Retry question
                  </button>
                ) : null}
              </section>
            ) : null}
          </div>
          <form className={styles.composer} onSubmit={submit}>
            <label htmlFor="chat-question">Your question</label>
            <textarea
              id="chat-question"
              placeholder="Ask about bids, people or a reporting period…"
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onCompositionStart={() => {
                composing.current = true;
              }}
              onCompositionEnd={() => {
                composing.current = false;
              }}
              onKeyDown={onComposerKeyDown}
              disabled={active}
            />
            <div className={styles.composerActions}>
              <span>Enter sends · Shift+Enter adds a line</span>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={
                  sending || active || !draft.trim() || codePointCount > 4_000
                }
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
            {codePointCount >= 3_600 ? (
              <span
                className={
                  codePointCount > 4_000 ? styles.counterError : styles.counter
                }
              >
                {codePointCount.toLocaleString()} / 4,000
              </span>
            ) : null}
            {error ? (
              <p className={styles.inlineError} role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </main>
      </div>
    </div>
  );
}
