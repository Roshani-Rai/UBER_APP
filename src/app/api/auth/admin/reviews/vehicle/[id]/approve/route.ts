


import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import Vehicle from "@/app/modals/vehicle.modals";
import { auth } from "@/auth";
import { NextRequest } from "next/server";



export async function GET (
    req:NextRequest,
    context:{params:Promise<{id:string}>}
){
    try {
        
    await  connectDb()
             const session = await auth()
             if(!session || !session.user?.email || session.user.role !== "admin"){
                 return Response.json({message:"Unathorized",success:false})
             }

       const vehicleId = (await context.params).id 
       const vehicle = await Vehicle.findById(vehicleId)

       if(!vehicle ){
         return Response.json({message:"Vehicle not found",success:false})
       }

       vehicle.status='approved'
       vehicle.isActive=true
       vehicle.rejectionReason=undefined

       await vehicle.save()

      const partner = await User.findById(vehicle.owner)

       if(!partner ){
         return Response.json({message:"Partner not found",success:false})
       }


       if(partner.partnerStep < 8)
       partner.partnerStep=8

       await partner.save()

       return Response.json({message:"Vehicle approved successfully!!" ,success:true})

    } catch (error) {
         return Response.json({message:`Vehicle approve error ${error}`,success:false}) 
    }
}