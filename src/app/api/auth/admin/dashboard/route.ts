import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import Vehicle from "@/app/modals/vehicle.modals";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";




export async function GET(req:NextRequest){
    try {
        connectDb()
        const session = await auth()
        if(!session || !session.user?.email || session.user.role !== "admin"){
            return Response.json({message:"Unathorized",success:false})
        }

        const totalPartners= await User.countDocuments({role:"partner"})
        const totalApprovedPartners = await User.countDocuments({role:"partner",partnerStatus:"approved"})
        const totalPendingPartners = await User.countDocuments({role:"partner",partnerStatus:"pending"})
        const totalRejectedPartners = await User.countDocuments({role:"partner",partnerStatus:"rejected"})    
        
        const PendingReview = await User.find({
            role:"partner",
            partnerStatus:"pending",
            partnerStep:{$gte:3}
        })

        const partnerIds = PendingReview.map((p)=>p._id)
        const partnerVehicles = await Vehicle.find({
            owner:{$in:partnerIds}
        })

        const vehicleTypeMap = new Map(
            partnerVehicles.map((v)=>[String(v.owner),v.type])
        )

        const pendingPartnerForReviews = PendingReview.map((p)=>({
            _id:p._id,
            name:p.name,
            email:p.email,
            vehicleType:vehicleTypeMap.get(String(p._id))
        }))

          const pendingVehicles = await Vehicle.find({
            status:'pending'
          }).populate('owner')

        return NextResponse.json({
          stats:{
               totalPartners,
            totalApprovedPartners,
            totalPendingPartners,
            totalRejectedPartners,
          } ,
          pendingVehicles,
            pendingPartnerForReviews
        },{status:200})

    } catch (error) {
       return Response.json({message:`Admin dashboard error ${error}`,success:false}) 
    }
}