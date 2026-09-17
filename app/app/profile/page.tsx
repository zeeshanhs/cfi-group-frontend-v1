import type { Metadata } from "next";

import { ChatWorkspace } from "@/components/data-insights/chat-workspace";

export const metadata: Metadata = { title: "Profile — Data Insights Chat" };

export default function ProfilePage() {
  return <ChatWorkspace chatId={null} view="profile" />;
}
