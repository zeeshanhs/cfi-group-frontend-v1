import type { Metadata } from "next";

import { ChatWorkspace } from "@/components/data-insights/chat-workspace";

export const metadata: Metadata = {
  title: "Conversation — Data Insights Chat",
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return <ChatWorkspace chatId={chatId} key={chatId} />;
}
