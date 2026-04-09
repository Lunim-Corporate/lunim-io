"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";

interface AuthFormProps {
  defaultToCreateAccount?: boolean;
  message?: string;
  variant?: "deal-room" | "deck";
}

function AuthFormContent({
  defaultToCreateAccount = false,
  message,
  variant = "deal-room",
}: AuthFormProps) {
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(!defaultToCreateAccount);
  const signInToggleRef = useRef<HTMLDivElement>(null);
  const createAccountToggleRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickName, setNickName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const isDeck = variant === "deck";

  // ── Keyboard accessibility ────────────────────────────────────────────────
  useEffect(() => {
    const el = signInToggleRef.current;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !showSignIn) { e.preventDefault(); setShowSignIn(true); }
    };
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [showSignIn]);

  useEffect(() => {
    const el = createAccountToggleRef.current;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showSignIn) { e.preventDefault(); setShowSignIn(false); }
    };
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [showSignIn]);

  function clearErrors() {
    setError("");
    setEmailError("");
    setInfoMessage(null);
    setShowResend(false);
    setResendSent(false);
  }

  function switchTab(toSignIn: boolean) {
    clearErrors();
    setShowSignIn(toSignIn);
  }

  // ── Resend confirmation ───────────────────────────────────────────────────
  const handleResend = async () => {
    if (!email) {
      setError("Enter your email address above, then click resend.");
      return;
    }
    setResendLoading(true);
    setInfoMessage(null);

    try {
      const base = process.env.NEXT_PUBLIC_TECH_SUITE_URL;
      const res = await fetch(`${base}/api/auth/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "deal-room" }),
      });

      if (res.status === 404) {
        // Endpoint not yet in this version of tech-suite
        setInfoMessage(
          "Automatic resend is not available. Please contact support to confirm your email."
        );
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to resend");
      }

      setResendSent(true);
      setInfoMessage("Confirmation email sent — check your inbox and spam folder.");
    } catch {
      setInfoMessage(
        "Could not resend right now. Please try again or contact support."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ── Sign in ───────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!email) { setEmailError("Email address is required."); return; }
    if (!password) { setError("Password is required."); return; }

    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_CONFIRMED") {
          setError("Please confirm your email before signing in.");
          setInfoMessage("Didn't receive the confirmation email? Resend it below.");
          setShowResend(true);
        } else {
          setError("Invalid email or password.");
        }
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ── Create account ────────────────────────────────────────────────────────
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!fullName) { setError("Full name is required."); return; }
    if (!nickName) { setError("Nickname is required."); return; }
    if (!email) { setEmailError("Email address is required."); return; }
    if (!password) { setError("Password is required."); return; }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_TECH_SUITE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name: fullName,
            friendly_name: nickName,
            source: "deal-room",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message || data?.error || "Registration failed.";
        setError(
          typeof msg === "string" && msg.toLowerCase().includes("already exists")
            ? "An account with this email already exists."
            : msg
        );
        return;
      }

      setRegistrationSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ── Registration success ──────────────────────────────────────────────────
  if (registrationSuccess) {
    return (
      <div className="dr-card rounded-lg p-8">
        <div className="text-center">
          <div className="dr-icon-success mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--dr-text)" }}>
            Account Created
          </h2>
          <p className="text-sm mb-2" style={{ color: "var(--dr-text-muted)" }}>
            A confirmation email has been sent to <strong>{email}</strong>.
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--dr-text-muted)" }}>
            Click the link in that email, then sign in to{" "}
            {isDeck ? "access the pitch deck" : "request access to the Deal Room"}.
          </p>
          <button
            onClick={() => { setRegistrationSuccess(false); setShowSignIn(true); setPassword(""); }}
            className="dr-btn-primary px-6 py-2 rounded text-sm font-medium"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Server-side message (e.g. email not confirmed) */}
      {message && (
        <div className="mb-4 p-3 rounded border dr-alert-warning text-sm">
          {message}
        </div>
      )}

      <div className="dr-card rounded-lg p-6">
        <h2
          className="text-center text-lg font-semibold mb-5"
          style={{ color: "var(--dr-text)" }}
        >
          Investor Area
        </h2>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => switchTab(true)}
            className={`py-3 px-4 rounded text-sm font-medium transition-all ${
              showSignIn ? "dr-tab-active" : "dr-tab-inactive"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTab(false)}
            className={`py-3 px-4 rounded text-sm font-medium transition-all ${
              !showSignIn ? "dr-tab-active" : "dr-tab-inactive"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Info message */}
        {infoMessage && (
          <div
            className="mb-4 text-sm text-center p-2 rounded"
            style={{
              color: resendSent ? "var(--dr-success-icon-fg)" : "var(--dr-text-muted)",
              background: resendSent ? "var(--dr-success-icon-bg)" : "transparent",
            }}
          >
            {infoMessage}
          </div>
        )}

        {/* Resend button */}
        {showResend && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendSent}
              className="text-sm underline disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: "var(--dr-accent)" }}
            >
              {resendLoading
                ? "Sending…"
                : resendSent
                ? "✓ Email sent"
                : "Resend confirmation email"}
            </button>
          </div>
        )}

        {/* ── Sign In Form ── */}
        {showSignIn && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="dr-email"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--dr-text)" }}
              >
                Email Address
              </label>
              <input
                id="dr-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                className={`dr-input w-full px-3 py-2 rounded border text-sm ${emailError ? "!border-red-500" : ""}`}
                required
              />
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            <div>
              <label
                htmlFor="dr-password"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--dr-text)" }}
              >
                Password
              </label>
              <input
                id="dr-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="dr-input w-full px-3 py-2 rounded border text-sm"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="dr-btn-primary w-full py-2.5 rounded text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        {/* ── Create Account Form ── */}
        {!showSignIn && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="dr-fullname"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--dr-text)" }}
                >
                  Full Name
                </label>
                <input
                  id="dr-fullname"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="First and last name"
                  className="dr-input w-full px-3 py-2 rounded border text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="dr-nickname"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--dr-text)" }}
                >
                  Nickname
                </label>
                <input
                  id="dr-nickname"
                  type="text"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  placeholder="What shall we call you?"
                  className="dr-input w-full px-3 py-2 rounded border text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="dr-create-email"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--dr-text)" }}
                >
                  Email Address
                </label>
                <input
                  id="dr-create-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  className={`dr-input w-full px-3 py-2 rounded border text-sm ${emailError ? "!border-red-500" : ""}`}
                  required
                />
                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
              </div>
              <div>
                <label
                  htmlFor="dr-create-password"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--dr-text)" }}
                >
                  Password
                </label>
                <input
                  id="dr-create-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="dr-input w-full px-3 py-2 rounded border text-sm"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="dr-btn-primary w-full py-2.5 rounded text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-xs text-center" style={{ color: "var(--dr-text-muted)" }}>
              You will receive a confirmation email. Click the link before signing in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthForm(props: AuthFormProps) {
  return (
    <Suspense fallback={<div className="text-center text-sm py-4" style={{ color: "var(--dr-text-muted)" }}>Loading…</div>}>
      <AuthFormContent {...props} />
    </Suspense>
  );
}
