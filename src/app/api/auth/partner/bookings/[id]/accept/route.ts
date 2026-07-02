import connectDb from "@/app/lib/db";
import Booking from "@/app/modals/booking.modals";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest,context:{params:Promise<{id:string}>}){
    try {
        await connectDb()
        const id = (await context.params).id
        const booking = await Booking.findById(id)
        if(!booking || booking.bookingStatus !=='requested'){
            return NextResponse.json({messgae:"Invalid",success:false})
        }

        booking.bookingStatus="awaiting_payment"

        booking.paymentDeadline=new Date(Date.now()+5*60*1000)

        await booking.save()
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`,{
                    event:'accept-booking',
                    userId:booking.user,
                    data:booking.bookingStatus
                  })
        return NextResponse.json({success:true})

    } catch (error) {
        return NextResponse.json({messgae:`accept booking ${error}`,success:false})
    }
}