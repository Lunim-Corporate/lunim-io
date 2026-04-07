"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Deal Room layout — wraps all deal-room routes with NextAuth SessionProvider.
 * No <html>/<body> here — the root layout owns those.
 */
export default function DealRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
