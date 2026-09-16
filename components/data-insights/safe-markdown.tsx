import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import styles from "./data-insights.module.css";

function safeHref(href: string | undefined) {
  if (!href) return null;
  if (href.startsWith("#")) return href;
  try {
    const parsed = new URL(href);
    return parsed.protocol === "https:" || parsed.protocol === "mailto:"
      ? href
      : null;
  } catch {
    return null;
  }
}

export function SafeMarkdown({ children }: { children: string }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children: linkChildren }) {
            const safe = safeHref(href);
            return safe ? (
              <a
                href={safe}
                rel="noreferrer"
                target={safe.startsWith("#") ? undefined : "_blank"}
              >
                {linkChildren}
              </a>
            ) : (
              <span>{linkChildren}</span>
            );
          },
          img() {
            return null;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
