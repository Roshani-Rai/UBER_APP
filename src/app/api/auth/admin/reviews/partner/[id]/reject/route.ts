import connectDb from "@/app/lib/db";
import PartnerBank from "@/app/modals/partnerBank.modals";
import PartnerDocs from "@/app/modals/partnerDocs.modals";
import User from "@/app/modals/user.modals";
import Vehicle from "@/app/modals/vehicle.modals";
import { auth } from "@/auth";
import { NextRequest } from "next/server";



export async function POST
(
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
               const {reason } = await req.json()

               if(!partner || partner.role !== "partner"){
                 return Response.json({message:"Partner not found",success:false})
               }

await User.findByIdAndUpdate(partnerId, {
  $set: {
    partnerStatus: 'rejected',
    partnerStep: 4,
    rejectionReason: reason
  }
})



         return Response.json({message:"Partner rejected successfully!!",success:true})
    } catch (error) {
         return Response.json({message:`Partner rejection error ${error}`,success:false}) 
    }
}