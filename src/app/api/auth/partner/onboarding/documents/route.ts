
import {auth} from "@/auth" 
 import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import { NextRequest } from "next/server";
import uploadOnCloudinary from "@/app/lib/cloudinary";
import PartnerDocs from "@/app/modals/partnerDocs.modals";



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

        const formdata = await req.formData()
        const aadhar=formdata.get("aadhar") as Blob | null
        const license=formdata.get("license") as Blob | null
        const rc = formdata.get("rc") as Blob | null

       // console.log("aadhar:", aadhar, "license:", license, "rc:", rc)

        if(!aadhar || !license || !rc){
             return Response.json({message:"All documents are required", success:false})
        }

        const updatePayload:any={
            status:"pending"
        }
       
        if(aadhar){
            const url = await uploadOnCloudinary(aadhar)
            if(!url){
                 return Response.json({message:"Aadhar upload failed ! Try again", success:false})
            }
            updatePayload.aadharUrl=url
        }

         if(license){
            const url = await uploadOnCloudinary(license)
            if(!url){
                 return Response.json({message:"License upload failed ! Try again", success:false})
            }
            updatePayload.licenseUrl=url
        }

         if(rc){
            const url = await uploadOnCloudinary(rc)
            if(!url){
                 return Response.json({message:"Rc upload failed ! Try again", success:false})
            }
            updatePayload.rcUrl=url
        }

       const partner = await PartnerDocs.findOneAndUpdate(
  { owner: user._id },
  { $set: { ...updatePayload, owner: user._id } },
  { upsert: true, new: true }
)

if (user.partnerStep < 3) {
  user.partnerStep = 3        
} else if (user.partnerStep >= 3) {
  user.partnerStep = 4        
}
           user.partnerStatus='pending'
        await user.save()

     return Response.json(partner, { status:200})

    }
     catch (error) {
        console.log(error)
        return Response.json({message:`Partner documents error ${error}` , success:false}

        )
    }

}










