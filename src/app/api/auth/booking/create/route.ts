import connectDb from "@/app/lib/db";
import Booking from "@/app/modals/booking.modals";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req:NextRequest){
    try {
        await connectDb()
        const session=await auth()
        if(!session?.user?.id){
            return NextResponse.json({message:"unathorized",success:false})
        }

        const {driverId,vehicleId,pickUpAddress,dropAddress,pickUpLocation,dropLocation,fare,mobileNumber}=
          await req.json()

          if(!driverId || !vehicleId || !pickUpLocation.coordinates || !dropLocation.coordinates){
           return NextResponse.json({message:"missing required details",success:false})
          }

          const driver = await User.findById(driverId)
         const userId = new mongoose.Types.ObjectId(session.user.id)
          if(!driver){
            return NextResponse.json({message:"Driver not found",success:false})
          }

          const existing = await Booking.findOne({
            user:userId,
            bookingStatus:{
                $in:["requested","awaiting_payment","confirmed","started"]
            }
          })

          if(existing){
            return NextResponse.json(existing)
          }

          const booking = await Booking.create({
             user: userId,
               driver,
               vehicle: vehicleId,
               pickUpAddress,
               dropAddress,
               pickUpLocation,
               dropLocation,
               fare,
               userMobileNumber:mobileNumber,
               driverMobileNumber:driver.mobileNumber,
               bookingStatus:"requested"
            
          })

        return NextResponse.json(booking,{status:200})

    } catch (error) {
         return NextResponse.json({message:`booking create ${error}`,success:false})
    }
}