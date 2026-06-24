import mongoose from "mongoose"


interface IPartnerDocs{
    aadharUrl :string,
    rcUrl:string,
    licenseUrl:string,
    owner:mongoose.Types.ObjectId
    status:"approved" | "pending" | "rejected",
    rejectionReason?:string,
    createdAt:Date,
    updatedAt:Date,
}

const partnerDocsSchema = new mongoose.Schema<IPartnerDocs>({
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
 
  rejectionReason:{
    type:String,
  },
  status:{
    type:String,
    enum:["approved","rejected","pending"],
    default:"pending"
  },
  aadharUrl:String,
  rcUrl:String,
  licenseUrl:String
},{timestamps:true})

const PartnerDocs = mongoose.models.PartnerDocs || mongoose.model('PartnerDocs',partnerDocsSchema)

export default PartnerDocs