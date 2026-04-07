"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { requestAccessAction } from "../lib/actions";

export default function RequestAccessButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRequest = async () => {
    if (!session?.user) {
      setMessage({ type: "error", text: "Please sign in to request access." });
      return;
    }

    const userId = (session.user as any)?.id;
    setIsLoading(true);
    setMessage(null);

    try {
      await requestAccessAction(userId);
      setMessage({
        type: "success",
        text: "Access request submitted. An administrator will review it shortly.",
      });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={isLoading}
        className="dr-btn-primary px-5 py-2.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Submitting…" : "Request Access"}
      </button>

      {message && (
        <p className={`mt-3 text-sm ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
