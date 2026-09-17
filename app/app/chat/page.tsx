import type { Metadata } from "next";

import { ChatWorkspace } from "@/components/data-insights/chat-workspace-entry";

export const metadata: Metadata = { title: "Data Insights Chat" };

export default function NewChatPage() {
  return <ChatWorkspace chatId={null} />;
}
