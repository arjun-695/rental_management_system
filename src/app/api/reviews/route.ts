import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TENANT") {
    return NextResponse.json({ ok: false, error: "Only tenants can leave reviews." }, { status: 403 });
  }

  try {
    const { bookingId, rating, comment } = await request.json();

    if (!bookingId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: "Invalid booking ID or rating value." }, { status: 400 });
    }

    // Verify booking belongs to this tenant and is complete/confirmed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true }
    });

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }

    if (booking.tenantId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Forbidden: Not your booking." }, { status: 403 });
    }

    // Upsert the review (prevent duplicate reviews for same booking by same tenant)
    const review = await prisma.review.upsert({
      where: { bookingId },
      update: {
        rating,
        comment,
      },
      create: {
        bookingId,
        propertyId: booking.propertyId,
        tenantId: session.user.id,
        rating,
        comment,
      },
    });

    // Recalculate average rating for the property
    const allReviews = await prisma.review.aggregate({
      where: { propertyId: booking.propertyId },
      _avg: { rating: true },
    });

    if (allReviews._avg.rating !== null) {
      await prisma.property.update({
        where: { id: booking.propertyId },
        data: { averageRating: allReviews._avg.rating },
      });
    }

    return NextResponse.json({ ok: true, data: review }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
