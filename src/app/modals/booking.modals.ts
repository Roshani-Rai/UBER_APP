import mongoose, { Document, Schema, Model } from "mongoose";

type BookingStatus ="idle"
  | "requested"
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

type PaymentStatus =
  | "pending"
  | "paid"
  | "cash"
  | "failed";

interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  pickUpAddress: string;
  dropAddress: string;
  pickUpLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  dropLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  paymentDeadline:Date,
  fare: number;
  userMobileNumber: string;
  driverMobileNumber: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  adminCommision: number;
  partnerAmount: number;
  pickUpOtp: string;
  pickUpOtpExpires: Date;
  dropOtp: string;
  dropOtpExpires: Date;
  distanceKm: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    pickUpAddress: {
      type: String,
      required: true,
    },
    dropAddress: {
      type: String,
      required: true,
    },
    pickUpLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    dropLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    fare: {
      type: Number,
      required: true,
    },
    userMobileNumber: {
      type: String,
      required: true,
    },
    driverMobileNumber: {
      type: String,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: [
        "requested","idle",
        "awaiting_payment",
        "confirmed",
        "started",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "idle",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash", "failed"],
      default: "pending",
    },
    adminCommision: {
      type: Number,
      default: 0,
    },
    partnerAmount: {
      type: Number,
      default: 0,
    },
    pickUpOtp: {
      type: String,
    },
    pickUpOtpExpires: {
      type: Date,
    },
     paymentDeadline: {
      type: Date,
    },
    dropOtp: {
      type: String,
    },
    dropOtpExpires: {
      type: Date,
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ pickUpLocation: "2dsphere" })
BookingSchema.index({ dropLocation: "2dsphere" })
BookingSchema.index({ user: 1, bookingStatus: 1 })
BookingSchema.index({ driver: 1, bookingStatus: 1 })

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
export type { IBooking, BookingStatus, PaymentStatus };