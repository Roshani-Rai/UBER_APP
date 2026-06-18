import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import { NextResponse } from "next/server";

export async function POST(req:Request){
  try {

    await connectDb()

    const {email,otp} = await req.json()

    if(!email && !otp){
        return Response.json({success:false,message:"Email and otp is required"})
    }

     let user = await User.findOne({email})

    if(!user){
        return Response.json({success:false,message:"User not found"})
    }

    if(user.isEmailVerified){
        return Response.json({success:false,message:"Email is already verified"})
    }

    if(!user.otpExpiresAt || user.otpExpiresAt<new Date()){
        return Response.json({success:false,message:"OTP has been expired"})
    }

    if(!user.otp || user.otp != otp){
        return Response.json({success:false,message:"Invalid otp"})
    }


    user.isEmailVerified=true
    user.otp=undefined
    user.otpExpiresAt=undefined

    await user.save()

    return Response.json({success:true,message:"Email verified successfully!!"})

  } catch (error) {
     console.error("REGISTER ERROR:", error)
            return NextResponse.json(
                {success:false ,message:`register error ${error}`},
               
  )}
}