import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";



export async function GET(){
    try {
        await connectDb()
        const session = await auth()
        if(!session || !session.user?.email || session.user.role !== 'admin'){
            return Response.json({message:"Anuathorized",success:false})
        }

        const partner = await User.find({
            role:"partner",
            videoKycStatus:{$in:["pending","in_progress"]}
        })
        return Response.json(partner,{status:200})

    } catch (error) {
        return Response.json({message:`Partner kyc get error ${error}`,success:false})
    }
}