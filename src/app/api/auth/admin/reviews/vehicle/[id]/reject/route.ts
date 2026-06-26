


import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import Vehicle from "@/app/modals/vehicle.modals";
import { auth } from "@/auth";
import { NextRequest } from "next/server";



export async function POST (
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
       
       const {reason} = await req.json()

       vehicle.status='rejected'
       vehicle.rejectionReason=reason

       await vehicle.save()

       return Response.json({message:"Vehicle rejected successfully!!" ,success:true})

    } catch (error) {
         return Response.json({message:`Vehicle reject error ${error}`,success:false}) 
    }
}