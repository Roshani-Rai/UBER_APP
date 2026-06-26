import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import Vehicle from "@/app/modals/vehicle.modals";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import uploadOnCloudinary from "@/app/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        if (!session || !session.user?.email) {
            return Response.json({ message: "Unauthorized user", success: false })
        }

        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json({ message: "User not found", success: false })
        }

        const vehicle = await Vehicle.findOne({ owner: user._id })
        if (!vehicle) {
            return Response.json({ message: "Vehicle not found", success: false })
        }

        const formData = await req.formData()
        const image = formData.get('image') as Blob | null
        const baseFare = formData.get('baseFare') as string | null
        const pricePerKm = formData.get('pricePerKm') as string | null
        const waitingCharge = formData.get('waitingCharge') as string | null

        const isUpdate = vehicle.pricingUpdated  // ✅ check if already submitted

        // ✅ first time: all required | update: at least one required
        if (!isUpdate && (!image || !baseFare || !pricePerKm || !waitingCharge)) {
            return Response.json({ message: "All fields are required for first submission", success: false })
        }

        if (isUpdate && !image && !baseFare && !pricePerKm && !waitingCharge) {
            return Response.json({ message: "At least one field is required to update", success: false })
        }

        // ✅ only upload image if new one provided
        if (image) {
            const imageUrl = await uploadOnCloudinary(image)
            if (!imageUrl) {
                return Response.json({ message: "Image upload failed, try again", success: false })
            }
            vehicle.imageUrl = imageUrl
        }

        // ✅ only update fields that were sent
        if (baseFare) vehicle.baseFare = Number(baseFare)
        if (pricePerKm) vehicle.pricePerKm = Number(pricePerKm)
        if (waitingCharge) vehicle.waitingCharge = Number(waitingCharge)

        vehicle.pricingUpdated = true
        vehicle.status = "pending"

        await vehicle.save()

        if (user.partnerStep < 7) {
            user.partnerStep = 7
            await user.save()
        }

        return Response.json({ vehicle, success: true }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({ message: `Pricing error ${error}`, success: false })
    }
}
export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        if (!session || !session.user?.email) {
            return Response.json({ message: "Unauthorized user", success: false })
        }

        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json({ message: "User not found", success: false })
        }

        const vehicle = await Vehicle.findOne({ owner: user._id })
        if (!vehicle) {
            return Response.json({ message: "Vehicle not found", success: false })
        }

        return Response.json({ vehicle, success: true }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({ message: `Get pricing error ${error}`, success: false })
    }
}