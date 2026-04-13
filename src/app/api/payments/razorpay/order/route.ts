import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db";

let razorpayInstance: any;

function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay environment variables missing");
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId } = await request.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.tenantId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { ok: false, error: "Booking is not CONFIRMED" },
        { status: 400 }
      );
    }

    // Razorpay requires amount in subunits (paise for INR)
    const amountInPaise = Math.round(Number(booking.totalAmount) * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${booking.id}`,
    };

    const order = await getRazorpay().orders.create(orderOptions);

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order creation failed" }, { status: 500 });
    }

    // Save initial Payment record in PENDING state
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: "INR",
        razorpayOrderId: order.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, data: { orderId: order.id, amount: amountInPaise } });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create order" }, { status: 500 });
  }
}
