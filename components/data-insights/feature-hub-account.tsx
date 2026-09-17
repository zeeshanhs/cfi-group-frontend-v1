"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/app/feature-hub.module.css";

export function FeatureHubAccount() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      sessionStorage.clear();
      router.replace("/login?reason=signed-out");
      router.refresh();
    } catch {
      setError("Sign out could not be completed. Try again.");
      setPending(false);
    }
  }

  return (
    <div className={styles.accountActions}>
      <Link
        href="/app/profile?from=workspace"
        onClick={() =>
          sessionStorage.setItem("cfi-data-insights-return", "/app")
        }
      >
        Profile
      </Link>
      <button type="button" disabled={pending} onClick={() => void signOut()}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error ? (
        <p className={styles.accountError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
