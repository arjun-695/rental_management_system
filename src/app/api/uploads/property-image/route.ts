import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { uploadPropertyImage } from "@/lib/cloudinary";
import type { AppRole } from "@/types/next-auth";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function isOwnerOrAdmin(role: AppRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isOwnerOrAdmin(session.user.role)) {
    return NextResponse.json(
      { ok: false, error: "Only owners or admins can upload property images" },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const uploaded = formData.get("image");

  if (!(uploaded instanceof File)) {
    return NextResponse.json({ ok: false, error: "Image file is required" }, { status: 400 });
  }

  if (!uploaded.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Only image files are allowed" }, { status: 400 });
  }

  if (uploaded.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Image exceeds 5MB limit" },
      { status: 400 },
    );
  }

  try {
    const result = await uploadPropertyImage(uploaded, session.user.id);

    return NextResponse.json({
      ok: true,
      data: {
        imageUrl: result.secureUrl,
        imagePublicId: result.publicId,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Image upload failed. Please try again." },
      { status: 500 },
    );
  }
}
