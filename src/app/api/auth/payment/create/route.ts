import connectDb from "@/app/lib/db"
import razorpay from "@/app/lib/razorpay"
import Booking from "@/app/modals/booking.modals"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDb()
    const { bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json(
        { message: "bookingId is required", success: false },
        { status: 400 }
      )
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return NextResponse.json(
        { message: "Booking is not found", success: false },
        { status: 404 }
      )
    }

    if (booking.paymentStatus === 'paid') {
      return NextResponse.json(
        { message: "Booking already paid", success: false },
        { status: 400 }
      )
    }

    const amountInPaise = Math.round(Number(booking.fare) * 100)
    if (!amountInPaise || amountInPaise <= 0) {
      return NextResponse.json(
        { message: "Invalid booking fare", success: false },
        { status: 400 }
      )
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: booking._id.toString(),
    })

    booking.bookingStatus = 'awaiting_payment'
    await booking.save()

   return NextResponse.json(
  { success: true, orderId: order.id, amount: order.amount, currency: order.currency },
  { status: 200 }
)

  } catch (error) {
    console.error("payment create error:", error)
    return NextResponse.json(
      { message: `payment error ${error}`, success: false },
      { status: 500 }
    )
  }
}