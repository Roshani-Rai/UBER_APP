import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";




export async function GET(
    req:NextRequest,
           context:{params:Promise<{id:string}>}
){
    try {
         await  connectDb()
                     const session = await auth()

                     if(!session || !session.user?.email || session.user.role !== "admin"){
                         return Response.json({message:"Unathorized",success:false})
                     }
        
               const partnerId = (await context.params).id 
               const partner = await User.findById(partnerId)
            

               if(!partner || partner.role !== "partner"){
                 return Response.json({message:"Partner not found",success:false})
               }

               const roomId = `kyc-${partner._id}-${Date.now()}`
               partner.videoKycRoomId = roomId
               partner.videoKycStatus = "in_progress"
               partner.partnerStep=5

               await partner.save()

               return NextResponse.json({roomId})

    } catch (error) {
         return Response.json({message:`Video KYC start error ${error}`,success:false}) 
    }
}