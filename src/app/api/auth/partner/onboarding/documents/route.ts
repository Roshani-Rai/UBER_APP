import {auth} from "@/auth" 
import connectDb from "@/app/lib/db";
import User from "@/app/modals/user.modals";
import { NextRequest } from "next/server";
import uploadOnCloudinary from "@/app/lib/cloudinary";
import PartnerDocs from "@/app/modals/partnerDocs.modals";

export async function POST(req: NextRequest) {
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

        const formdata = await req.formData()
        const aadhar = formdata.get("aadhar") as Blob | null
        const license = formdata.get("license") as Blob | null
        const rc = formdata.get("rc") as Blob | null

        const existingDocs = await PartnerDocs.findOne({ owner: user._id })
        const isUpdate = !!existingDocs  // ✅ track if updating

        // ✅ first time: all required | update: at least one required
        if (!isUpdate && (!aadhar || !license || !rc)) {
            return Response.json({ message: "All documents are required", success: false })
        }

        if (isUpdate && !aadhar && !license && !rc) {
            return Response.json({ message: "At least one document is required to update", success: false })
        }

        const updatePayload: any = {
            status: "pending",
            docsUpdated: true  // ✅ track if docs were ever updated
        }

        if (aadhar) {
            const url = await uploadOnCloudinary(aadhar)
            if (!url) return Response.json({ message: "Aadhar upload failed, try again", success: false })
            updatePayload.aadharUrl = url
        }

        if (license) {
            const url = await uploadOnCloudinary(license)
            if (!url) return Response.json({ message: "License upload failed, try again", success: false })
            updatePayload.licenseUrl = url
        }

        if (rc) {
            const url = await uploadOnCloudinary(rc)
            if (!url) return Response.json({ message: "RC upload failed, try again", success: false })
            updatePayload.rcUrl = url
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
        user.partnerStatus = 'pending'
        await user.save()

        return Response.json({
            success: true,
            isUpdate,
            partner
        }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({ message: `Partner documents error ${error}`, success: false })
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

        const docs = await PartnerDocs.findOne({ owner: user._id })
        if (!docs) {
            return Response.json(null, { status: 200 })  // ✅ no docs yet
        }

        return Response.json({
            success: true,
            docsUpdated: docs.docsUpdated ?? false,  // ✅ was it ever submitted
            aadharUrl: docs.aadharUrl ?? null,
            licenseUrl: docs.licenseUrl ?? null,
            rcUrl: docs.rcUrl ?? null,
        }, { status: 200 })

    } catch (error) {
        console.log(error)
        return Response.json({ message: `Get documents error ${error}`, success: false })
    }
}