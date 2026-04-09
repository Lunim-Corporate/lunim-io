import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import { getUserSubscription, sendAccessAttemptNotification } from "./lib/subscription";
import { getDealRoomConfig } from "./config";
import AuthForm from "./components/auth-form";
import DealRoomContent from "./components/deal-room-content";
import DealRoomNav from "./components/deal-room-nav";

export default async function DealRoomPage() {
  const config = getDealRoomConfig();
  const session = await getServerSession(authOptions);

  // ── Shared page background (used by all states) ─────────────────────────────
  const pageBg = (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--dr-accent) 8%, transparent), transparent),
          radial-gradient(ellipse 60% 40% at 80% 80%, color-mix(in srgb, var(--dr-accent) 4%, transparent), transparent),
          var(--dr-bg-page)
        `,
      }}
    />
  );

  // ── 1. Unauthenticated ──────────────────────────────────────────────────────
  // Lunim nav is fixed at 64px. No deal-room bar. Content starts at 64px.
  if (!session) {
    return (
      <>
        {pageBg}
        {/* DealRoomNav renders null when no session — included for layout consistency */}
        <DealRoomNav />
        <main className="min-h-screen flex items-center justify-center px-5 pb-16"
          style={{ paddingTop: "80px" }}
        >
          <div className="w-full max-w-lg">
            {/* Header above form */}
            <div className="text-center mb-8">
              <div
                className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--dr-accent) 10%, transparent)",
                  color: "var(--dr-accent)",
                  border: "1px solid color-mix(in srgb, var(--dr-accent) 20%, transparent)",
                }}
              >
                Investor Portal
              </div>
              <h1 
                className="text-3xl font-bold mb-2" 
                style={{ color: "var(--dr-text)" }}
                >
                Deal Room
              </h1>
              <p className="text-sm" style={{ color: "var(--dr-text-muted)" }}>
                Sign in or create an account to access investor materials
              </p>
            </div>
            <AuthForm variant="deal-room" />
          </div>
        </main>
      </>
    );
  }

  // ── 2. Email not confirmed ──────────────────────────────────────────────────
  const isEmailConfirmed = Boolean((session.user as any)?.isEmailConfirmed);

  if (!isEmailConfirmed) {
    return (
      <>
        {pageBg}
        <DealRoomNav />
        <main className="min-h-screen flex items-center justify-center px-5 pb-16" style={{ paddingTop: "80px" }}>
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div
                className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--dr-accent) 10%, transparent)",
                  color: "var(--dr-accent)",
                  border: "1px solid color-mix(in srgb, var(--dr-accent) 20%, transparent)",
                }}
              >
                Investor Portal
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--dr-text)" }}>
                Confirm Your Email
              </h1>
            </div>
            <AuthForm
              variant="deal-room"
              message="Please confirm your email before continuing. Check your inbox (and spam)."
            />
          </div>
        </main>
      </>
    );
  }

  // ── 3. Resolve subscription ─────────────────────────────────────────────────
  const userId = (session.user as any)?.id ?? "";
  const subscription = await getUserSubscription(userId);

  // ── 4. Access-attempt notification (fire-and-forget) ────────────────────────
  if (config.featureFlags?.enableAccessAttemptEmails && !subscription.hasAccess && userId) {
    sendAccessAttemptNotification(userId).catch(() => {});
  }

  const userName = session.user?.name || session.user?.email || "Investor";

  // ── 5. Authenticated: lunim nav (64px) + deal-room bar (40px) = 104px top ──
  return (
    <>
      {pageBg}
      <DealRoomNav />
      <main
        className="min-h-screen px-5 sm:px-8 pb-16"
        style={{ paddingTop: "112px" }}
      >
        <div style={{ maxWidth: "var(--dr-max-width, 1200px)", margin: "0 auto" }}>
          {/* Page header */}
          <div className="py-8 mb-2">
            <p className="text-sm mb-1" style={{ color: "var(--dr-text-muted)" }}>
              Welcome back,{" "}
              <span style={{ color: "var(--dr-accent)" }}>
                {userName}
                </span>
            </p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--dr-text)" }}>
              Investor Deal Room
            </h1>
            {!subscription.hasAccess && (
              <p className="text-sm mt-1" style={{ color: "var(--dr-text-muted)" }}>
                {subscription.hasRequestedAccess
                  ? "Your access request is under review."
                  : "Request access below to unlock all documents."}
              </p>
            )}
          </div>

          {/* Divider */}
          <div 
          className="mb-8 h-px" 
          style={{ background: "var(--dr-border)" }} 
          />

          <DealRoomContent
            hasAccess={subscription.hasAccess}
            hasRequestedAccess={subscription.hasRequestedAccess}
            backendUrl={config.backendUrl}
          />
        </div>
      </main>
    </>
  );
}
