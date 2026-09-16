import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SafeMarkdown } from "@/components/data-insights/safe-markdown";

describe("SafeMarkdown", () => {
  it("renders useful Markdown without active HTML, unsafe links, or images", () => {
    const markup = renderToStaticMarkup(
      <SafeMarkdown>{`## Result

**Safe answer** with [safe](https://example.com), [unsafe](javascript:alert(1)), and ![tracker](https://tracker.example/pixel.png).

<script>alert("no")</script>

\`inline\`

\`\`\`sql
SELECT 1;
\`\`\``}</SafeMarkdown>,
    );

    expect(markup).toContain("<h2>Result</h2>");
    expect(markup).toContain('href="https://example.com"');
    expect(markup).not.toContain("javascript:");
    expect(markup).not.toContain("<img");
    expect(markup).not.toContain("<script");
    expect(markup).toContain("SELECT 1;");
  });
});
