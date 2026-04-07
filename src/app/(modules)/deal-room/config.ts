/**
 * Deal Room Module — Configuration
 *
 * Reads directly from environment variables on the server.
 * No initDealRoom() call needed anywhere — just set the env vars.
 *
 * NEXT_PUBLIC_* vars are available on both server and client.
 */

export interface DealRoomFeatureFlags {
  enableAccessAttemptEmails?: boolean;
}

export interface DealRoomConfig {
  backendUrl: string;
  hubId: number;
  allowedTiers: string[];
  featureFlags?: DealRoomFeatureFlags;
}

/**
 * Get the Deal Room config. Call from any server component or server action.
 * Throws clearly if required env vars are missing.
 */
export function getDealRoomConfig(): DealRoomConfig {
  const backendUrl = process.env.NEXT_PUBLIC_TECH_SUITE_URL;
  if (!backendUrl) {
    throw new Error(
      "[deal-room] Missing required env var: NEXT_PUBLIC_TECH_SUITE_URL"
    );
  }

  const hubIdRaw = process.env.NEXT_PUBLIC_DEAL_ROOM_HUB_ID;
  if (!hubIdRaw) {
    throw new Error(
      "[deal-room] Missing required env var: NEXT_PUBLIC_DEAL_ROOM_HUB_ID"
    );
  }

  const hubId = Number(hubIdRaw);
  if (isNaN(hubId)) {
    throw new Error(
      "[deal-room] NEXT_PUBLIC_DEAL_ROOM_HUB_ID must be a number, got: " + hubIdRaw
    );
  }

  const allowedTiers = (
    process.env.NEXT_PUBLIC_DEAL_ROOM_ALLOWED_TIERS ?? "gold"
  )
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    backendUrl,
    hubId,
    allowedTiers,
    featureFlags: {
      enableAccessAttemptEmails:
        process.env.NEXT_PUBLIC_ENABLE_ACCESS_ATTEMPT_EMAILS === "true",
    },
  };
}
