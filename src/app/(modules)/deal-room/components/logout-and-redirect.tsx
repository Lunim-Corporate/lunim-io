"use client";

import { signOut } from "next-auth/react";

export default function LogoutAndRedirect() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="dr-card rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full dr-icon-warning flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-2">Access Not Available</h3>
          <p className="text-sm dr-text-muted mb-6">
            Your current subscription does not include Deal Room access.
            You can sign in with a different account.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => signOut({ callbackUrl: "/deal-room", redirect: true })}
              className="dr-btn-primary px-4 py-2 rounded text-sm font-medium"
            >
              Sign in with different account
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/", redirect: true })}
              className="dr-btn-secondary px-4 py-2 rounded text-sm font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

