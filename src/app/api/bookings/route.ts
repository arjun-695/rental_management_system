import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import { hasBookingConflict } from "@/lib/bookings/conflict";
import {
  createBookingSchema,
  type CreateBookingInput,
} from "@/lib/validations/booking";
import type { AppRole } from "@/types/next-auth";

function dayDiff(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as AppRole;

  const where =
    role === "TENANT"
      ? { tenantId: session.user.id }
      : role === "OWNER"
      ? { property: { ownerId: session.user.id } }
      : {};

  const rows = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      propertyId: true,
      tenantId: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      nights: true,
      totalAmount: true,
      status: true,
      createdAt: true,
      property: { select: { title: true, city: true } },
      tenant: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TENANT") {
    return NextResponse.json(
      { ok: false, error: "Only tenants can create bookings" },
      { status: 403 }
    );
  }

  const rawBody: unknown = await request.json();
  const parsed = createBookingSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid booking payload" }, { status: 400 });
  }

  const input: CreateBookingInput = parsed.data;

  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: {
      id: true,
      status: true,
      availableFrom: true,
      monthlyRent: true,
    },
  });

  if (!property || property.status !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Property unavailable" }, { status: 404 });
  }

  if (input.checkIn < property.availableFrom) {
    return NextResponse.json(
      { ok: false, error: "Property is not available for selected check-in date" },
      { status: 400 }
    );
  }

  const conflict = await hasBookingConflict(input.propertyId, input.checkIn, input.checkOut);
  if (conflict) {
    return NextResponse.json(
      { ok: false, error: "Selected dates conflict with an existing booking" },
      { status: 409 }
    );
  }

  const nights = dayDiff(input.checkIn, input.checkOut);
  const pricePerNight = Number(property.monthlyRent) / 30;
  const totalAmount = Number((pricePerNight * nights).toFixed(2));

  const created = await prisma.booking.create({
    data: {
      propertyId: input.propertyId,
      tenantId: session.user.id,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      nights,
      pricePerNight,
      totalAmount,
      status: "PENDING",
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}
