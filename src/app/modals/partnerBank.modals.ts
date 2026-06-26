import mongoose from "mongoose"


interface IPartnerBank{
    accountHolder:string,
    accountNumber:string,
    ifsc:string,
    upi?:string,
    owner:mongoose.Types.ObjectId
    status:"not_added" | "verified" | "added",
    createdAt:Date,
    updatedAt:Date,
    bankUpdated:boolean
    
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>({
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  accountHolder:{
    type:String,
    required:true
  },
    accountNumber:{
    type:String,
    required:true,
    unique:true,
  },
    ifsc:{
    type:String,
    required:true,
    uppercase:true,
  },
    upi:String,

status:{
    type:String,
    enum:["not_added","verified","added"],
    default:"not_added"
  },
 bankUpdated: { type: Boolean, default: false }

},{timestamps:true})

const PartnerBank = mongoose.models.PartnerBank || mongoose.model('PartnerBank',partnerBankSchema)

export default PartnerBank