"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing confirmation token.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TECH_SUITE_URL}/api/auth/confirm-email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Invalid or expired confirmation token.");
        } else {
          setSuccess(true);
        }
      } catch {
        setError("Failed to confirm email. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full dr-card rounded-xl p-8 text-center">
        {loading && (
          <>
            <div className="dr-spinner inline-block w-8 h-8 border-2 rounded-full animate-spin mb-4" />
            <h1 className="text-xl font-semibold mb-2">Confirming your email…</h1>
            <p className="text-sm dr-text-muted">Please wait a moment.</p>
          </>
        )}

        {!loading && success && (
          <>
            <div className="dr-icon-success mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-3">Email Confirmed</h1>
            <p className="text-sm dr-text-muted mb-6">
              Your email has been confirmed. You can now sign in and request access to the Deal Room.
            </p>
            <button
              onClick={() => (window.location.href = "/deal-room")}
              className="dr-btn-primary px-6 py-2.5 rounded text-sm font-medium"
            >
              Go to Deal Room
            </button>
          </>
        )}

        {!loading && error && (
          <>
            <div className="dr-icon-error mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-3">Confirmation Failed</h1>
            <p className="text-sm dr-text-muted mb-6">{error}</p>
            <button
              onClick={() => (window.location.href = "/deal-room")}
              className="dr-btn-primary px-6 py-2.5 rounded text-sm font-medium"
            >
              Back to Deal Room
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm">Loading…</div>}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
