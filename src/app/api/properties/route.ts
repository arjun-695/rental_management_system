import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import {
  createPropertySchema,
  propertySearchQuerySchema,
  type CreatePropertyInput,
} from "@/lib/validations/property";
import { buildPropertyWhere, buildPropertyOrderBy } from "@/lib/properties/query";
import type { AppRole } from "@/types/next-auth";

function isOwnerOrAdmin(role: AppRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsed = propertySearchQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid query parameters" }, { status: 400 });
  }

  const filters = parsed.data;
  const where = buildPropertyWhere(filters);
  const orderBy = buildPropertyOrderBy(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: filters.pageSize,
      select: {
        id: true,
        title: true,
        imageUrls: true,
        city: true,
        state: true,
        type: true,
        bedrooms: true,
        bathrooms: true,
        monthlyRent: true,
        availableFrom: true,
        createdAt: true,
      },
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({
    ok: true,
    data: rows,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isOwnerOrAdmin(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const rawBody: unknown = await request.json();
  const parsed = createPropertySchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid property payload" }, { status: 400 });
  }

  const input: CreatePropertyInput = parsed.data;

  const created = await prisma.property.create({
    data: {
      ownerId: session.user.id,
      title: input.title,
      description: input.description,
      city: input.city,
      state: input.state,
      country: input.country,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      postalCode: input.postalCode,
      type: input.type,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      areaSqft: input.areaSqft,
      monthlyRent: input.monthlyRent,
      securityDeposit: input.securityDeposit,
      imageUrls: input.imageUrls,
      availableFrom: input.availableFrom,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}
