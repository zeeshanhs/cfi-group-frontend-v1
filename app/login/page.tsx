import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/data-insights/login-form";
import { BrandMark } from "@/components/data-insights/brand-mark";
import styles from "@/components/data-insights/data-insights.module.css";
import {
  SESSION_COOKIE_NAME,
  userForSession,
} from "@/lib/data-insights/server/auth";

export const metadata: Metadata = { title: "Sign in to the internal workspace" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const user = userForSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (user) redirect("/app");

  return (
    <main className={styles.loginPage}>
      <header className={styles.loginHeader}>
        <BrandMark />
      </header>
      <div className={styles.loginModeStrip}>
        Synthetic demo · Fictional data · Reporting timezone: UTC
      </div>
      <LoginForm />
    </main>
  );
}
