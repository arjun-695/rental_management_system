import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["TENANT", "OWNER"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = roleSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid role provided." },
        { status: 400 }
      );
    }

    // Do not allow users to escalate to ADMIN via this route.
    const { role } = parsed.data;

    // Reject updates if the user is already an ADMIN (protecting administrative users from degrading themselves accidentally)
    if (session.user.role === "ADMIN") {
        return NextResponse.json(
            { ok: false, error: "Admins cannot change their roles." },
            { status: 403 }
        );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
