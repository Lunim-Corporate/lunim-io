"use server";

import { requestAccess } from "./subscription";

/**
 * Server action — called from RequestAccessButton (client component).
 * Keeps getDealRoomConfig() on the server where process.env is available.
 */
export async function requestAccessAction(userId: string) {
  return requestAccess(userId);
}
