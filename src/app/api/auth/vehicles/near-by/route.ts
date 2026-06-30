import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import Vehicle from "@/app/modals/vehicle.modals";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    try {
        await connectDb()

        const {latitude,longitude,vehicleType} = await req.json()

console.log('Searching near:', { latitude, longitude, vehicleType })
        if(!latitude || !longitude){
            return NextResponse.json({message:"Coordinates not found",success:false})
        }
       
        const partners = await User.find({
            role:'partner',
            partnerStatus:"approved",
            isOnline:true,
            location:{
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[longitude,latitude]
                    },
                    $maxDistance:8000
                }
            }
        }).select('_id')

        const partnerIds = partners.map(p=>p._id)

        if(partnerIds.length==0){
             return NextResponse.json({message:'Vehicle not found',success:true})
        }
        
      console.log('Partners found:', partners.length)
        const vehicles=await Vehicle.find({
            owner:{$in:partnerIds},
            type:vehicleType,
            status:'approved',
           isActive:true
        }).lean()
console.log('Vehicles found:', vehicles.length) 
console.log('All vehicles for these partners:', vehicles) 

         return NextResponse.json(vehicles,{status:200})

    } catch (error) {
        console.log(error)
         return NextResponse.json({message:`Near-by error ${error}`,success:true})
    }
}