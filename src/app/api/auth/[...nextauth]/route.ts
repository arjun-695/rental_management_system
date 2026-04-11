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

type AppUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: AppRole;
  age: number | null;
  passwordHash?: string | null;
};

type ExtendedJWT = JWT & {
  id?: string;
  role?: AppRole;
  age?: number | null;
};

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
  headers: Record<string, string | string[] | undefined> | undefined
): string {
  if (!headers) return "unknown";

  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const real = headers["x-real-ip"];
  if (typeof real === "string") {
    return real.trim();
  }

  return "unknown";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // Database sessions are better for admin/security controls (revocation/auditing).
  session: { strategy: "database" },

  pages: {
    // Keep this in sync with your actual page path.
    signIn: "/sign-in",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req): Promise<AppUser | null> {
        const headers = req?.headers as
          | Record<string, string | string[] | undefined>
          | undefined;

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

        if (!user?.passwordHash) return null;

        const passwordValid = await compare(password, user.passwordHash);
        if (!passwordValid) return null;

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
  ],

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      const t = token as ExtendedJWT;

      if (user) {
        const u = user as AppUser;
        t.id = u.id;
        t.role = u.role;
        t.age = u.age ?? null;
      }

      return t;
    },

    async session({ session, token }) {
      const t = token as ExtendedJWT;

      if (session.user) {
        session.user.id = t.id ?? "";
        session.user.role = t.role ?? "TENANT";
        session.user.age = t.age ?? null;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
