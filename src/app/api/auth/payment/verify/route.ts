import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDb from "@/app/lib/db";
import Booking from "@/app/modals/booking.modals";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const {
      bookingId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    if (
      !bookingId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Idempotency: already verified, don't reprocess
    if (booking.paymentStatus === "paid") {
      return NextResponse.json(
        {
          success: true,
          message: "Already verified",
          commission: booking.adminCommision,
          partnerAmount: booking.partnerAmount,
        },
        { status: 200 }
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf-8");

    const isValidSignature =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const commission = booking.fare * 0.1;
    const partnerAmount = booking.fare - commission;

    booking.adminCommision = commission;
    booking.partnerAmount = partnerAmount;
    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";

    await booking.save();

    return NextResponse.json(
      { success: true, commission, partnerAmount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}