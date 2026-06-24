

import {auth} from "@/auth" 
 import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import Vehicle from "@/app/modals/vehicle.modals";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{2})$/

export async function POST(req:NextRequest){
    try {
        await connectDb()
        const session = await auth()
        if(!session){
            return Response.json({message:"Unathorized user", success:false})
        }

        const user = await User.findOne({email:session.user.email})
        if(!user){
            return Response.json({message:"User not found", success:false})
        }

        const {type,number,vehicleModel} = await req.json()
         
        if(!type || !number || !vehicleModel){
            return Response.json({message:"Missing required details", success:false})
        }

      if(!VEHICLE_REGEX.test(number)){
         return Response.json({message:"Invalid vehicle number format", success:false})
      }

      const vehicleNumber = number.toUpperCase()
     let vehicle =await Vehicle.findOne({owner:user._id})
      if(vehicle){
        vehicle.type=type
        vehicle.number=vehicleNumber
        vehicle.vehicleModel=vehicleModel
        vehicle.status="pending"
         if (user.partnerStep === 1) {
    user.partnerStep = 2
  } else if (user.partnerStep >= 3) {
    user.partnerStep = 4  
    user.partnerStatus = "pending"  
    user.rejectionReason = ""
  }
         await user.save()
        await vehicle.save()
        return Response.json({vehicle,success:true})
      }
        
      
      const duplicate = await Vehicle.findOne({number:vehicleNumber})

      if(duplicate){
         return Response.json({message:"Vehicle already registered", success:false})
      }

         vehicle= await Vehicle.create({
            owner:user._id,
        type,
        number:vehicleNumber,
        vehicleModel
      })

        user.partnerStep =2
     

       user.role = "partner"
        user.partnerStatus='pending'
      await user.save()
      return Response.json({vehicle,success:true})

    } catch (error) {
         return Response.json({message:`Vehicle error ${error}`, success:false})
    }
}


export async function GET(req:NextRequest){
    try {
        
    await connectDb()
        const session = await auth()
        if(!session){
            return Response.json({message:"Unathorized user", success:false})
        }

        const user = await User.findOne({email:session.user.email})
        if(!user){
            return Response.json({message:"User not found", success:false})
        }


        let vehicle = await Vehicle.findOne({owner:user._id})
        if(vehicle){
            return Response.json(vehicle,{status:200})
        }
        else return null

    } catch (error) {
        return Response.json({message:`get vehicle error ${error}` , success:false}

        )
    }
}
