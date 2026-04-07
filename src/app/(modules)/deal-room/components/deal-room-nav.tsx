"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function DealRoomNav() {
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/deal-room", redirect: true });
  };

  if (!session?.user) return null;

  const name = session.user.name || session.user.email || "Investor";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: "var(--dr-bg-nav)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "var(--dr-border)",
      }}
    >
      {/* Logo / brand */}
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: "var(--dr-accent)" }}
        >
          Deal Room
        </span>
      </div>

      {/* Right — user info + sign out */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: "color-mix(in srgb, var(--dr-accent) 15%, transparent)",
            color: "var(--dr-accent)",
            border: "1px solid color-mix(in srgb, var(--dr-accent) 30%, transparent)",
          }}
        >
          {initials}
        </div>

        {/* Name — hidden on very small screens */}
        <span
          className="text-sm hidden sm:block"
          style={{ color: "var(--dr-text-muted)" }}
        >
          {name}
        </span>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded transition-all disabled:opacity-50"
          style={{
            color: "var(--dr-text-muted)",
            border: "1px solid var(--dr-border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--dr-accent)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--dr-accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--dr-border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--dr-text-muted)";
          }}
        >
          {signingOut ? (
            "Signing out…"
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
