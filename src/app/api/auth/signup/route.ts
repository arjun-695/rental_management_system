import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import {
  consumeRateLimit,
  resetRateLimit,
  type RateLimitPolicy,
} from "@/lib/security/auth-rate-limit";

type SignupFieldErrors = Partial<
  Record<"name" | "age" | "email" | "password", string[]>
>;

type SignupResponse =
  | { ok: true; message: string }
  | {
      ok: false;
      code: "INVALID_INPUT" | "RATE_LIMITED" | "INTERNAL_ERROR";
      message: string;
      retryAfterSeconds?: number;
      fieldErrors?: SignupFieldErrors;
    };

const SIGNUP_IP_POLICY: RateLimitPolicy = {
  windowMs: 15 * 60_000, // 15 minutes
  maxAttempts: 10,
  lockoutMs: 30 * 60_000, // 30 minutes
};

const SIGNUP_EMAIL_POLICY: RateLimitPolicy = {
  windowMs: 30 * 60_000, // 30 minutes
  maxAttempts: 5,
  lockoutMs: 12 * 60 * 60_000, // 12 hours
};

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

function json(body: SignupResponse, status: number): NextResponse<SignupResponse> {
  const headers = new Headers();

  if (!body.ok && body.code === "RATE_LIMITED" && body.retryAfterSeconds) {
    headers.set("Retry-After", String(body.retryAfterSeconds));
  }

  return NextResponse.json(body, { status, headers });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ip = getClientIp(request);

    // 1) IP-based throttle first to stop spray attacks early.
    const ipLimit = await consumeRateLimit({
      scope: "signup_ip",
      identifier: ip,
      policy: SIGNUP_IP_POLICY,
    });

    if (!ipLimit.allowed) {
      return json(
        {
          ok: false,
          code: "RATE_LIMITED",
          message: "Too many signup attempts. Please try again later.",
          retryAfterSeconds: ipLimit.retryAfterSeconds,
        },
        429
      );
    }

    const rawBody: unknown = await request.json();
    const parsed = signupSchema.safeParse(rawBody);

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors as SignupFieldErrors;
      return json(
        {
          ok: false,
          code: "INVALID_INPUT",
          message: "Invalid signup data.",
          fieldErrors: flattened,
        },
        400
      );
    }

    const data: SignupInput = parsed.data;

    // 2) Email-based throttle to protect specific user addresses.
    const emailLimit = await consumeRateLimit({
      scope: "signup_email",
      identifier: data.email,
      policy: SIGNUP_EMAIL_POLICY,
    });

    if (!emailLimit.allowed) {
      return json(
        {
          ok: false,
          code: "RATE_LIMITED",
          message: "Too many attempts for this email. Please try again later.",
          retryAfterSeconds: emailLimit.retryAfterSeconds,
        },
        429
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    // Anti-enumeration: do not reveal whether email exists.
    if (existingUser) {
      return json(
        {
          ok: true,
          message: "If eligible, the account request has been accepted.",
        },
        202
      );
    }

    const passwordHash: string = await hash(data.password, 12);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        age: data.age,
        passwordHash,
      },
    });

    // Optional reset after success to avoid trapping real users in limits.
    await resetRateLimit("signup_email", data.email);
    await resetRateLimit("signup_ip", ip);

    return json(
      {
        ok: true,
        message: "Account created successfully.",
      },
      201
    );
  } catch {
    return json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Internal server error.",
      },
      500
    );
  }
}