import connectDb from "@/app/lib/db"
import User from "@/app/modals/user.modals"
import { auth } from "@/auth"


export async function GET(){
    try {
         await connectDb()
        const session = await auth()
        if(!session || !session.user?.email){
            return Response.json({message:"Unathorized user", success:false})
        }

        const partner = await User.findOne({email:session.user.email})
        if(!partner){
            return Response.json({message:"User not found", success:false})
        }

     if(partner.videoKycStatus === 'in_progress' || partner.videoKycStatus === 'pending'){
    return Response.json({message:"Request already pending", success:false})
}

if(partner.videoKycStatus === 'approved'){
    return Response.json({message:"KYC already approved", success:false})
}

     partner.videoKycStatus='pending'
     partner.videoKycRejectionReason=undefined
     partner.videoKycRoomId=undefined

     await partner.save()

       return Response.json({message:"request send", success:true})     

    } catch (error) {
          return Response.json({message:`request error ${error}`, success:false})
    }
}