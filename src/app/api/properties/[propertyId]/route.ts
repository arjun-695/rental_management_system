import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import { updatePropertySchema } from "@/lib/validations/property";
import type {AppRole } from  "@/types/next-auth"


function canManageProperty(role: AppRole, ownerId: string, userId: string): boolean {
  if (role === "ADMIN") return true;
  return role === "OWNER" && ownerId === userId;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ propertyId: string }> }
): Promise<Response> {
  const { propertyId } = await context.params;

  const row = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      title: true,
      description: true,
      city: true,
      state: true,
      country: true,
      addressLine1: true,
      addressLine2: true,
      postalCode: true,
      type: true,
      bedrooms: true,
      bathrooms: true,
      areaSqft: true,
      monthlyRent: true,
      securityDeposit: true,
      coverImageUrl: true,
      coverImagePublicId: true,
      availableFrom: true,
      status: true,
      ownerId: true,
    },
  });

  if (!row) {
    return NextResponse.json({ ok: false, error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: row });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ propertyId: string }> }
): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await context.params;
  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, error: "Property not found" }, { status: 404 });
  }

  if (!canManageProperty(session.user.role, existing.ownerId, session.user.id)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const rawBody: unknown = await request.json();
  const parsed = updatePropertySchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid update payload" }, { status: 400 });
  }

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: parsed.data,
    select: { id: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ propertyId: string }> }
): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await context.params;
  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, error: "Property not found" }, { status: 404 });
  }

  if (!canManageProperty(session.user.role, existing.ownerId, session.user.id)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // Soft delete for auditability.
  await prisma.property.update({
    where: { id: propertyId },
    data: { status: "INACTIVE" },
  });

  return NextResponse.json({ ok: true });
}
