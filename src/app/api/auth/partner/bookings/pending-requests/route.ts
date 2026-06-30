import connectDb from "@/app/lib/db"
import Booking from "@/app/modals/booking.modals"
import User from "@/app/modals/user.modals"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"


export async function GET(req:NextRequest){
    try {
          await connectDb()
        const session = await auth()
        if(!session || !session.user?.email){
            return Response.json({message:"Unathorized user", success:false})
        }

        const partner = await User.findOne({email:session.user.email})
        if(!partner){
            return NextResponse.json({message:"User not found", success:false})
        }

        const count = await Booking.countDocuments({
            driver:partner._id,
            bookingStatus:"requested"
        })

       
        return NextResponse.json(count,{status:200})

    } catch (error) {
        return NextResponse.json({message:`count error ${error}`, success:false})
    }
}