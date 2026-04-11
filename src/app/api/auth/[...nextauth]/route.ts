import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { credentialsSignInSchema } from "@/lib/validations/auth";
import {
  consumeRateLimit,
  resetRateLimit,
  type RateLimitPolicy,
} from "@/lib/security/auth-rate-limit";

// ── Login rate-limit policies (mirrors signup pattern) ──────────────

const LOGIN_IP_POLICY: RateLimitPolicy = {
  windowMs: 15 * 60_000, // 15 minutes
  maxAttempts: 15, // slightly more generous than signup
  lockoutMs: 15 * 60_000, // 15-minute lockout
};

const LOGIN_EMAIL_POLICY: RateLimitPolicy = {
  windowMs: 15 * 60_000, // 15 minutes
  maxAttempts: 5, // tight per-account limit
  lockoutMs: 30 * 60_000, // 30-minute lockout
};

// ── Helpers ─────────────────────────────────────────────────────────

function getIpFromHeaders(
  headers: Record<string, unknown> | undefined
): string {
  if (!headers) return "unknown";
  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  const real = headers["x-real-ip"];
  if (typeof real === "string") return real.trim();
  return "unknown";
}

// ── NextAuth config ─────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // JWTs for credentials; the adapter still handles account/session DB ops.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        const ip = getIpFromHeaders(
          req?.headers as Record<string, unknown> | undefined
        );

        // 1) IP-based throttle — stops credential-stuffing bots early.
        const ipLimit = await consumeRateLimit({
          scope: "login_ip",
          identifier: ip,
          policy: LOGIN_IP_POLICY,
        });

        if (!ipLimit.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        // 2) Validate shape so we never touch the DB with garbage input.
        const parsed = credentialsSignInSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid credentials.");
        }

        const { email, password } = parsed.data;

        // 3) Email-based throttle — protects individual accounts.
        const emailLimit = await consumeRateLimit({
          scope: "login_email",
          identifier: email,
          policy: LOGIN_EMAIL_POLICY,
        });

        if (!emailLimit.allowed) {
          throw new Error(
            "Too many login attempts for this account. Please try again later."
          );
        }

        // 4) Look up user.
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            passwordHash: true,
          },
        });

        // Generic message to prevent user enumeration.
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.");
        }

        const passwordValid = await compare(password, user.passwordHash);
        if (!passwordValid) {
          throw new Error("Invalid email or password.");
        }

        // 5) Success — reset both rate-limit buckets so legitimate users
        //    are not penalized by prior failed attempts.
        await resetRateLimit("login_email", email);
        await resetRateLimit("login_ip", ip);

        // Return the user object that NextAuth will encode into the JWT.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, `user` is the object returned by authorize().
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
