import connectDb from "@/app/lib/db";
import Booking from "@/app/modals/booking.modals";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        await connectDb()
        const session = await auth()
        if(!session || !session.user?.email){
            return NextResponse.json({message:"unathorized user",success:false})
        }

        const user = await User.findOne({email:session.user.email})
        const booking=await Booking.findOne({
            driver:user._id,
            bookingStatus:{$in:["confirmed","started","completed"]}
        }).populate('driver user vehicle')

        return NextResponse.json(booking,{status:200})
    } catch (error) {
        return NextResponse.json({message:`active-ride error ${error}`,success:false})
    }
}