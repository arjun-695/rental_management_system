import { createHash } from "crypto";
import { prisma } from "@/lib/db";

// Keep scopes explicit for type safety and to avoid typo bugs.

export type RateLimitScope =
  | "signup_ip"
  | "signup_email"
  | "login_ip"
  | "login_email";

export type RateLimitPolicy = {
  windowMs: number;
  maxAttempts: number;
  lockoutMs: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

  type ConsumeRateLimitInput = {
  scope: RateLimitScope;
  identifier: string;
  policy: RateLimitPolicy;
};

/**
 * We hash identifiers (email/ip) before saving to DB so sensitive values
 * are not stored in plain text.
 */
function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function buildKey(scope: RateLimitScope, identifier: string): string {
  const normalized = identifier.trim().toLowerCase();
  return `${scope}:${hashIdentifier(normalized)}`;
}

// Atomically consumes one attempt and returns whether request is allowed.

export async function consumeRateLimit(
  input: ConsumeRateLimitInput
): Promise<RateLimitResult> {
  const now = new Date();
  const key = buildKey(input.scope, input.identifier);

  return prisma.$transaction(async (tx): Promise<RateLimitResult> => {
    const row = await tx.authRateLimit.findUnique({ where: { key } });

    if (!row) {
      await tx.authRateLimit.create({
        data: {
          key,
          scope: input.scope,
          attempts: 1,
          windowStart: now,
          blockedUntil: null,
        },
      });
      return { allowed: true };
    }

    if (row.blockedUntil && row.blockedUntil.getTime() > now.getTime()) {
      const retryAfterSeconds = Math.ceil(
        (row.blockedUntil.getTime() - now.getTime()) / 1000
      );
      return { allowed: false, retryAfterSeconds };
    }

    const windowExpired =
      now.getTime() - row.windowStart.getTime() > input.policy.windowMs;

    if (windowExpired) {
      await tx.authRateLimit.update({
        where: { key },
        data: {
          attempts: 1,
          windowStart: now,
          blockedUntil: null,
        },
      });
      return { allowed: true };
    }

    const nextAttempts = row.attempts + 1;

    if (nextAttempts > input.policy.maxAttempts) {
      const blockedUntil = new Date(now.getTime() + input.policy.lockoutMs);

      await tx.authRateLimit.update({
        where: { key },
        data: {
          attempts: nextAttempts,
          blockedUntil,
        },
      });

      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(input.policy.lockoutMs / 1000),
      };
    }

    await tx.authRateLimit.update({
      where: { key },
      data: { attempts: nextAttempts },
    });

    return { allowed: true };
  });
}

/**
 * Optional reset after successful login/signup so legitimate users are not
 * penalized by old failed attempts.
 */

export async function resetRateLimit(
  scope: RateLimitScope,
  identifier: string
): Promise<void> {
  const key = buildKey(scope, identifier);

  await prisma.authRateLimit.upsert({
    where: { key },
    update: {
      attempts: 0,
      windowStart: new Date(),
      blockedUntil: null,
    },
    create: {
      key,
      scope,
      attempts: 0,
      windowStart: new Date(),
      blockedUntil: null,
    },
  });
}