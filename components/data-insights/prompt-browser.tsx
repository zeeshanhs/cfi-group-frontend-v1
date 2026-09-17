"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  PromptCatalogDto,
  PromptSummaryDto,
} from "@/lib/data-insights/contracts";
import { filterPrompts } from "@/lib/data-insights/prompts";

import styles from "./data-insights.module.css";

type PromptBrowserPlacement = "centered" | "floating" | "constrained";

type PromptBrowserProps = {
  open: boolean;
  placement: PromptBrowserPlacement;
  catalog: PromptCatalogDto | null;
  loading: boolean;
  error: string | null;
  opener: HTMLElement | null;
  suspended: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSelect: (prompt: PromptSummaryDto, source: HTMLButtonElement) => void;
};

function focusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function useMobileSheet() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

export function PromptBrowser({
  open,
  placement,
  catalog,
  loading,
  error,
  opener,
  suspended,
  onClose,
  onRetry,
  onSelect,
}: PromptBrowserProps) {
  const panelRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const mobile = useMobileSheet();
  const selectedCategoryId =
    categoryId &&
    catalog?.categories.some((category) => category.id === categoryId)
      ? categoryId
      : null;
  const results = useMemo(
    () => (catalog ? filterPrompts(catalog, query, selectedCategoryId) : []),
    [catalog, query, selectedCategoryId],
  );
  const categoryLabels = useMemo(
    () =>
      new Map(
        catalog?.categories.map((category) => [category.id, category.label]) ??
          [],
      ),
    [catalog],
  );

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open || loading || error || !catalog) return;
    const timeout = window.setTimeout(() => {
      setAnnouncement(
        results.length === 1
          ? "1 prompt found"
          : `${results.length} prompts found`,
      );
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [catalog, error, loading, open, results.length]);

  useEffect(() => {
    if (!open || suspended) return;
    function keydown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (!mobile || event.key !== "Tab" || !panelRef.current) return;
      const items = focusableElements(panelRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    function pointerdown(event: PointerEvent) {
      if (
        mobile ||
        panelRef.current?.contains(event.target as Node) ||
        opener?.contains(event.target as Node)
      ) {
        return;
      }
      onClose();
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", pointerdown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("pointerdown", pointerdown);
    };
  }, [mobile, onClose, open, opener, suspended]);

  useEffect(() => {
    if (!open || !mobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobile, open]);

  if (!open) return null;

  const resultSummary =
    results.length === 0
      ? "No prompts found"
      : results.length === 1
        ? "1 prompt"
        : `${results.length} prompts`;

  return (
    <div
      className={styles.promptBrowserLayer}
      data-placement={placement}
      data-presentation={mobile ? "sheet" : "popover"}
    >
      <section
        className={styles.promptBrowser}
        role="dialog"
        aria-modal={mobile ? "true" : undefined}
        aria-labelledby="prompt-browser-title"
        ref={panelRef}
      >
        <div className={styles.promptBrowserFixed}>
          <div className={styles.promptBrowserHeader}>
            <div>
              <h2 id="prompt-browser-title">Browse prompts</h2>
              {!loading && !error && catalog ? (
                <span className={styles.promptResultSummary}>
                  {resultSummary}
                </span>
              ) : null}
            </div>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
          <div className={styles.promptBrowserControls}>
            <label className={styles.promptSearchControl} htmlFor="prompt-search">
              <span>Search prompts</span>
              <input
                className={styles.promptSearch}
                id="prompt-search"
                ref={searchRef}
                type="search"
                placeholder="Search prompts"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
              />
            </label>
            {catalog ? (
              <div className={styles.promptCategoryControl}>
                <span id="prompt-category-label">Categories</span>
                <div
                  className={styles.promptCategories}
                  role="group"
                  aria-labelledby="prompt-category-label"
                >
                  <button
                    type="button"
                    aria-pressed={selectedCategoryId === null}
                    onClick={() => setCategoryId(null)}
                  >
                    All
                  </button>
                  {catalog.categories.map((category) => (
                    <button
                      type="button"
                      aria-pressed={selectedCategoryId === category.id}
                      key={category.id}
                      onClick={() => setCategoryId(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
            {announcement}
          </span>
        </div>

        <div
          className={styles.promptResults}
          role="region"
          aria-label="Prompt results"
        >
          {loading ? (
            <div className={styles.promptLoading} role="status">
              <span />
              <span />
              <span />
              <p>Loading prompts…</p>
            </div>
          ) : null}
          {!loading && error ? (
            <div className={styles.promptState} role="alert">
              <strong>Prompts could not be loaded.</strong>
              <p>{error} You can still type your own question.</p>
              <button type="button" onClick={onRetry}>
                Try again
              </button>
            </div>
          ) : null}
          {!loading && !error && catalog && results.length === 0 ? (
            <div className={styles.promptState}>
              <strong>No prompts found</strong>
              <p>
                {query.trim()
                  ? `No prompts match “${query.trim()}”. Try another search or clear filters.`
                  : "No prompts match this category."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategoryId(null);
                  requestAnimationFrame(() => searchRef.current?.focus());
                }}
              >
                Clear filters
              </button>
            </div>
          ) : null}
          {!loading && !error && catalog && results.length > 0 ? (
            <ul className={styles.promptResultList}>
              {results.map((prompt) => (
                <li key={prompt.id}>
                  <button
                    type="button"
                    onClick={(event) => onSelect(prompt, event.currentTarget)}
                  >
                    <strong>{prompt.title}</strong>
                    <span>{prompt.description}</span>
                    <small>{categoryLabels.get(prompt.category)}</small>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
