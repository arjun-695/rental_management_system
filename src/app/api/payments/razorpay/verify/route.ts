import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
    }

    // Update payment record
    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "SUCCESS",
      },
    });

    // Optionally update booking status if you want it explicitly marked (e.g. PAID)
    // Though usually it remains CONFIRMED but tied to a SUCCESS payment

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to verify signature" }, { status: 500 });
  }
}
