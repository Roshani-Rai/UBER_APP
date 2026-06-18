import connectDb from "@/app/lib/db";
import { sendMail } from "@/app/lib/sendMail";
import User from "@/app/modals/user.modals";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb()
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    let user = await User.findOne({ email })

    if (user && user.isEmailVerified) {
      return NextResponse.json(
        { success: false, message: "Email already exists!" },
        { status: 400 }
      )
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000)

    const hashedPassword = await bcrypt.hash(password, 10)

    if (user && !user.isEmailVerified) {
      user.otp = otp
      user.otpExpiresAt = otpExpire
      user.name = name
      user.password = hashedPassword
      await user.save()
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt: otpExpire,
      })
    }

    await sendMail(
      email,
      "Your OTP for Email Verification",
      `<h2>Your Email Verification OTP is <strong>${otp}</strong></h2>`
    )

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: { name: user.name, email: user.email },
    })

  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return NextResponse.json(
      { success: false, message: `register error ${error}` },
      { status: 500 }
    )
  }
}