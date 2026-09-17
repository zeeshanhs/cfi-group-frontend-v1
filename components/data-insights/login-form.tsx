"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

import type {
  ApiErrorDto,
  LoginResponseDto,
} from "@/lib/data-insights/contracts";

import styles from "./data-insights.module.css";

function validationMessage(email: string, password: string) {
  if (!email.trim()) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Enter an email address in the format name@example.com.";
  }
  if (!password) return "Enter your password.";
  return null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("reason") === "signed-out"
      ? "You’re signed out. Your saved chats are still available when you sign in again."
      : searchParams.get("reason") === "expired"
        ? "Your session has expired. Sign in again to continue. Unsent text and recordings were cleared."
        : null,
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validationMessage(email, password);
    if (validation) {
      setError(validation);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json()) as ApiErrorDto;
        setPassword("");
        setError(
          response.status === 401
            ? "Unable to sign in. Check your email and password and try again."
            : body.error.message,
        );
        requestAnimationFrame(() => passwordRef.current?.focus());
        return;
      }
      await response.json() as LoginResponseDto;
      router.replace("/app");
      router.refresh();
    } catch {
      setError("Sign-in is temporarily unavailable. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.loginContent} aria-labelledby="login-title">
      <h1 id="login-title">Sign in to the CFI workspace</h1>
      <p>Use your provisioned account to access available internal tools.</p>
      <form className={styles.loginForm} onSubmit={submit} noValidate>
        {error ? (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        ) : null}
        <label className={styles.fieldGroup}>
          <span>Email address</span>
          <input
            autoComplete="email"
            autoFocus
            inputMode="email"
            name="email"
            placeholder="name@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={styles.fieldGroup}>
          <span>Password</span>
          <span className={styles.passwordField}>
            <input
              ref={passwordRef}
              autoComplete="current-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className={styles.passwordToggle}
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>
        <button
          className={styles.primaryButton}
          type="submit"
          disabled={pending}
        >
          {pending ? "Checking your account…" : "Sign in"}
        </button>
      </form>
      <p className={styles.loginSupport}>
        Need access? Contact your CFI prototype administrator.
      </p>
      <p className={styles.disclosure}>
        This local prototype uses fictional accounts and synthetic data. It is
        not connected to a live identity or business-data service.
      </p>
    </section>
  );
}
