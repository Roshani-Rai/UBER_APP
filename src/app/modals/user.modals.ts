import mongoose, { Schema, Document } from "mongoose"  // ✅ Document from mongoose

interface IUser extends Document {
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
    role:"user" | "partner" | "admin"
    isEmailVerified:boolean,
    otp?:string,
    otpExpiresAt?:Date
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role:{
     type:String,
     default:"user",
     enum:["user","partner","admin"]
    },
     isEmailVerified: {
      type:Boolean,
      default:false
    },
    otp:{
        type:String,

    },
    otpExpiresAt:{
      type:Date
    }

}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
export default User