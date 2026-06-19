import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import { auth } from "@/auth";


export async function GET(req:Request){
    try {

        await connectDb()

        const session = await auth()

        if(!session || !session.user){
            return Response.json({success:false,message:"User not found"})
        }

        const user = await User.findOne({email:session.user.email})

        if(!user){
            return Response.json({success:false,message:"User not found"})
        }

        return  Response.json({success:true,user})
        
    } catch (error) {
        return Response.json({success:false,message:`Error ${error}`})
    }
}