import mongoose from "mongoose"


type vehicleType= "bike" | "car" | "loading" | "truck" | "auto"


interface IVehicle{
    owner:mongoose.Types.ObjectId
    type:vehicleType,
    vehicleModel:string,
    number:string,
    imageUrl ? :string,
    baseFare?:number,
    pricePerKm?:number,
    waitingCharge?:number,
    status:"approved" | "pending" | "rejected",
    rejectionReason?:string,
    isActive:boolean,
    createdAt:Date,
    updatedAt:Date,
}

const vehicleSchema = new mongoose.Schema<IVehicle>({
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  type:{
    type:String,
    enum:["bike" , "car" , "loading" , "truck" , "auto"],
    required:true
  },
  number:{
    type:String,
   required:true,
   unique:true,
  },
  vehicleModel:{
    type:String,
    required:true,
  },
  imageUrl:{
   type:String,
  },
  baseFare:{
    type:Number,
  },
  pricePerKm:{
    type:Number,
  },
  waitingCharge:{
    type:Number,
  },
  status:{
    type:String,
    enum:["approved" ,"rejected" ,"pending"],
    default:"pending",
  },
  rejectionReason:{
    type:String,
  },
  isActive:{
    type:Boolean,
    deafult:true
  }
},{timestamps:true})

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle',vehicleSchema)

export default Vehicle