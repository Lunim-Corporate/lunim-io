import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type TechSuiteLoginResponse = {
  token: string;
  user: {
    id: number | string;
    email: string;
    name?: string;
    friendlyName?: string;
    role?: string;
    isEmailConfirmed?: boolean;
    emailConfirmed?: boolean;
    email_confirmed?: boolean;
    confirmed?: boolean;
  };
  profile?: { id?: number; name?: string } | null;
  subscription?: {
    id?: number;
    plan_code?: string;
    plan_name?: string;
    current?: boolean;
    yearly?: boolean;
  } | null;
};

/**
 * Normalise the email-confirmed flag across all shapes the backend may return.
 * If the backend doesn't send any confirmation field we default to true so
 * existing users aren't accidentally locked out.
 */
function parseEmailConfirmed(user: TechSuiteLoginResponse["user"]): boolean {
  const v =
    user.isEmailConfirmed ??
    user.emailConfirmed ??
    user.email_confirmed ??
    user.confirmed;
  return typeof v === "boolean" ? v : true;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const base = process.env.NEXT_PUBLIC_TECH_SUITE_URL;
        if (!base) throw new Error("NEXT_PUBLIC_TECH_SUITE_URL is not set");

        const res = await fetch(`${base}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          let message = "Authentication failed";
          try {
            const err = await res.json();
            message = err?.message || message;
          } catch {
            // ignore parse errors
          }
          if (
            typeof message === "string" &&
            message.toLowerCase().includes("confirm your email")
          ) {
            throw new Error("EMAIL_NOT_CONFIRMED");
          }
          return null;
        }

        const data = (await res.json()) as TechSuiteLoginResponse;
        const isEmailConfirmed = parseEmailConfirmed(data.user);

        if (!isEmailConfirmed) {
          throw new Error("EMAIL_NOT_CONFIRMED");
        }

        return {
          id: String(data.user.id),
          email: data.user.email,
          name: data.profile?.name ?? data.user.name ?? data.user.email,
          token: data.token,
          isEmailConfirmed,
          subscriptionPlanCode: data.subscription?.plan_code ?? null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.token = (user as any).token;
        token.isEmailConfirmed = (user as any).isEmailConfirmed;
        token.subscriptionPlanCode = (user as any).subscriptionPlanCode;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).token = token.token;
      (session.user as any).isEmailConfirmed = token.isEmailConfirmed;
      (session.user as any).subscriptionPlanCode = token.subscriptionPlanCode;
      return session;
    },
  },
  pages: { signIn: "/deal-room" },
};
