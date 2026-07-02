import connectDb from "@/app/lib/db";
import Booking from "@/app/modals/booking.modals";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized user", success: false }, { status: 401 })
    }

    const partner = await User.findOne({ email: session.user.email })
    if (!partner) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 })
    }

    const bookings = await Booking.find({ driver: partner._id }) // <-- confirm field name matches schema
      .populate('user driver vehicle')
      .sort({ createdAt: -1 })

    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    console.error("pending bookings error:", error)
    return NextResponse.json({ message: `pending error ${error}`, success: false }, { status: 500 })
  }
}