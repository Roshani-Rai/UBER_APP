import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";
import { NextRequest } from "next/server";



export async function POST(req:NextRequest){
    try {
        await connectDb()
        const session = await auth()
        if(!session || !session.user?.email || session.user.role !== 'admin'){
            return Response.json({message:"Unuathorized",success:false})
        }

        const {roomId,action,reason} = await req.json()

        if(!roomId){
             return Response.json({message:"RoomId is required",success:false})
        }

        if(!["approved","rejected"].includes(action)){
             return Response.json({message:"Invalid action",success:false})
        }

        const partner = await User.findOne({
            videoKycRoomId:roomId,
            role:"partner"
        })

        if(!partner){
             return Response.json({message:"Partner not found",success:false})
        }

       if(action === 'approved'){
        partner.videoKycStatus="approved"
        partner.videoKycRejectionReason=undefined
        partner.partnerStep=6
       }
       else{
         if(!reason){
             return Response.json({message:"RejectionReason is required",success:false})
         }
         partner.videoKycStatus='rejected'
         partner.videoKycRejectionReason=reason.trim()
       }
       console.log("roomId received:", roomId)
console.log("partner found:", partner)

       await partner.save()

       return   Response.json({status:partner.videoKycStatus},{status:200})

    } catch (error) {
        return Response.json({message:`Complete kyc error ${error}`,success:false})
    }
}