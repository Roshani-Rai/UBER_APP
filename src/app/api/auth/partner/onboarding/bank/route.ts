import { NextRequest } from "next/server";
import {auth} from "@/auth" 
 import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import PartnerBank from "@/app/modals/partnerBank.modals";


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

        const {accountHolder , accountNumber,upi,ifsc,mobileNumber} = await req.json()
        if(!accountHolder || !accountNumber || !ifsc || !mobileNumber){
             return Response.json({message:"Missing bank details", success:false})
        }

        const partnerBank = await PartnerBank.findOneAndUpdate(
            {owner:user._id},
            {accountHolder,
                accountNumber,
                ifsc,
                upi,
                status:"added"
            },
            {upsert:true,new:true}
        )

        user.mobileNumber=mobileNumber
       
            user.partnerStep =4
        
         
        user.partnerStatus='pending'
        await user.save()

       return Response.json(partnerBank,{status:200})        

    } catch (error) {
        return Response.json({message:`Partner bank error ${error}` , success:false})

    }
}




export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const session = await auth()
    if (!session) {
      return Response.json({ message: "Unauthorized user", success: false })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return Response.json({ message: "User not found", success: false })
    }

    const partnerBank = await PartnerBank.findOne({ owner: user._id })
    return Response.json({ partnerBank: partnerBank || null, success: true })
  } catch (error) {
    return Response.json({ message: `get partner error ${error}`, success: false })
  }
}