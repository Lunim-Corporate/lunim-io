import { getDealRoomConfig } from "../config";
import type { SubscriptionState } from "../types";

/**
 * Fetch subscription state for a user from tech-suite.
 * Called server-side from page.tsx — no auth header needed for this endpoint.
 */
export async function getUserSubscription(
  userId: string
): Promise<SubscriptionState> {
  const config = getDealRoomConfig();
  const allowedTiers = config.allowedTiers.join(",");

  try {
    const res = await fetch(
      `${config.backendUrl}/api/subscriptions/check-access/${userId}/${config.hubId}?allowedTiers=${allowedTiers}`,
      { method: "GET", headers: { "Content-Type": "application/json" }, cache: "no-store" }
    );

    if (!res.ok) {
      console.error("[deal-room] subscription check failed:", res.status);
      return { hasAccess: false, hasRequestedAccess: false, tier: null, pricePlanId: null, subscriptionId: null };
    }

    const data = await res.json();
    return {
      hasAccess: Boolean(data.hasAccess),
      hasRequestedAccess: Boolean(data.hasRequestedAccess),
      tier: data.tier ?? null,
      pricePlanId: data.pricePlanId ?? null,
      subscriptionId: data.subscriptionId ?? null,
    };
  } catch (err) {
    console.error("[deal-room] subscription check error:", err);
    return { hasAccess: false, hasRequestedAccess: false, tier: null, pricePlanId: null, subscriptionId: null };
  }
}

/**
 * Request access to the deal room.
 * Uses the internal (no-JWT) endpoint because this call is made from the
 * client after the user is already authenticated via NextAuth session.
 * Idempotent — repeated calls from the same user are handled gracefully.
 */
export async function requestAccess(userId: string): Promise<{ success: boolean; alreadyHandled?: boolean; message?: string }> {
  const config = getDealRoomConfig();

  const res = await fetch(
    `${config.backendUrl}/api/subscriptions/internal/request-access`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: Number(userId), hub_id: config.hubId }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data?.message === "string" ? data.message : "Failed to request access";

    // Treat "already pending" / "already have access" as non-errors
    if (
      message.toLowerCase().includes("already pending") ||
      message.toLowerCase().includes("already have deal room access")
    ) {
      return { success: true, alreadyHandled: true, message };
    }

    throw new Error(message);
  }

  return data;
}

/**
 * Notify hub admins that a non-gold authenticated user visited the deal room.
 * Fire-and-forget — page.tsx catches any errors so this never blocks rendering.
 * Requires NEXT_PUBLIC_ENABLE_ACCESS_ATTEMPT_EMAILS=true in the host env.
 */
export async function sendAccessAttemptNotification(userId: string): Promise<void> {
  const config = getDealRoomConfig();

  await fetch(`${config.backendUrl}/api/notifications/access-attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: Number(userId),
      hub_id: config.hubId,
    }),
  });
}
