import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import {
  updateBookingStatusSchema,
  type UpdateBookingStatusInput,
} from "@/lib/validations/booking";
import type { AppRole } from "@/types/next-auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingId: string }> }
): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      tenantId: true,
      status: true,
      property: { select: { ownerId: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }

  const rawBody: unknown = await request.json();
  const parsed = updateBookingStatusSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid status payload" }, { status: 400 });
  }

  const input: UpdateBookingStatusInput = parsed.data;
  const role = session.user.role as AppRole;

  if (role === "TENANT") {
    // Tenant can only cancel own booking.
    if (booking.tenantId !== session.user.id || input.status !== "CANCELLED") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  } else if (role === "OWNER") {
    // Owner can confirm/cancel bookings on own properties only.
    if (booking.property.ownerId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  }
  // ADMIN can update any booking.

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: input.status },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, data: updated });
}
