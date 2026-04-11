import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/db";
import { credentialsSignInSchema } from "@/lib/validations/auth";
import {
  consumeRateLimit,
  resetRateLimit,
  type RateLimitPolicy,
} from "@/lib/security/auth-rate-limit";

type AppRole = "TENANT" | "OWNER" | "ADMIN";

type CredentialsUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: AppRole;
  age: number | null;
  passwordHash?: string | null;
};

type HeaderMap = Record<string, string | string[] | undefined>;

const LOGIN_IP_POLICY: RateLimitPolicy = {
  windowMs: 15 * 60_000,
  maxAttempts: 15,
  lockoutMs: 15 * 60_000,
};

const LOGIN_EMAIL_POLICY: RateLimitPolicy = {
  windowMs: 15 * 60_000,
  maxAttempts: 5,
  lockoutMs: 30 * 60_000,
};

function getIpFromHeaders(
  headers: Record<string, string | string[] | undefined> | undefined,
): string {
  if (!headers) return "unknown";

  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = headers["x-real-ip"];
  if (typeof realIp === "string") {
    return realIp.trim();
  }

  return "unknown";
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Keep providers typed and conditionally include Google when env keys exist.
const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },

    async authorize(credentials, req): Promise<CredentialsUser | null> {
      const headers = req?.headers as HeaderMap | undefined;

      const ip = getIpFromHeaders(headers);

      const ipLimit = await consumeRateLimit({
        scope: "login_ip",
        identifier: ip,
        policy: LOGIN_IP_POLICY,
      });

      // Return null so attacker does not get detailed reason.
      if (!ipLimit.allowed) return null;

      const parsed = credentialsSignInSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      const emailLimit = await consumeRateLimit({
        scope: "login_email",
        identifier: email,
        policy: LOGIN_EMAIL_POLICY,
      });

      if (!emailLimit.allowed) return null;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          age: true,
          passwordHash: true,
        },
      });

      // Generic null return avoids user-enumeration leakage.
      if (!user?.passwordHash) return null;

      const passwordValid = await compare(password, user.passwordHash);
      if (!passwordValid) return null;

      // On successful login, clear counters for this email and source IP.
      await resetRateLimit("login_email", email);
      await resetRateLimit("login_ip", ip);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role as AppRole,
        age: user.age,
      };
    },
  }),
];

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // DB sessions allow server-side revocation and security audits later.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role =(user.role as AppRole) ?? "TENANT";
        token.age = (user.age as number | null) ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      // Merge custom fields into session.user.
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as AppRole) ?? "TENANT";
        session.user.age = (token.age as number | null) ?? null;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
