import connectDb from "@/app/lib/db";
import PartnerBank from "@/app/modals/partnerBank.modals";
import PartnerDocs from "@/app/modals/partnerDocs.modals";
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

       const partnerId = (await context.params).id 
       const partner = await User.findById(partnerId)

       if(!partner || partner.role !== "partner"){
         return Response.json({message:"Partner not found",success:false})
       }

       const vehicle = await Vehicle.findOne({owner:partnerId})
       const documents = await PartnerDocs.findOne({owner:partnerId})
       const bank = await PartnerBank.findOne({owner:partnerId})

      return Response.json({
        partner,
        vehicle:vehicle || null,
        documents:documents || null,
        bank:bank || null
      },
      {status:200}
    )

    } catch (error) {
         return Response.json({message:`Partner review error ${error}`,success:false}) 
    }
}