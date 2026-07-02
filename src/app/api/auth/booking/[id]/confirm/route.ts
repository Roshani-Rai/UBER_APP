import connectDb from "@/app/lib/db";
import Booking from "@/app/modals/booking.modals";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest,context:{params:Promise<{id:string}>}){
    try {
        await connectDb()
        const id = (await context.params).id
        const booking = await Booking.findById(id)
        if(!booking ){
            return NextResponse.json({messgae:"booking not found",success:false})
        }

      
    booking.paymentStatus = "cash";
    booking.bookingStatus = "confirmed";

    await booking.save();

        return NextResponse.json({success:true})

    } catch (error) {
        console.log(error)
        return NextResponse.json({messgae:`confirm booking ${error}`,success:false})
    }
}