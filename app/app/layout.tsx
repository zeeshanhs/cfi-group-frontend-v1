import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SESSION_COOKIE_NAME,
  userForSession,
} from "@/lib/data-insights/server/auth";

export const dynamic = "force-dynamic";

export default async function DataInsightsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const user = userForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!user) redirect("/login?reason=expired");
  return children;
}
