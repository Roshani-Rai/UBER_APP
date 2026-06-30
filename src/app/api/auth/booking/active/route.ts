import connectDb from "@/app/lib/db";
import Booking from "@/app/modals/booking.modals";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req:NextRequest){
    try {
        await connectDb()
        const session=await auth()
        if(!session?.user?.id){
            return NextResponse.json({booking:null})
        }

       const user = await User.findOne({email:session.user.email})
       const booking = await Booking.findOne({
        user:user._id,
        bookingStatus:{$in:["requested","awaiting_payment","confirmed","started"]}
       })
      
        return NextResponse.json({booking})

    } catch (error) {
         return NextResponse.json({message:`booking active ${error}`,success:false})
    }
}