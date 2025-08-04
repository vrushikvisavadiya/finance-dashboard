import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // expires in 5 minutes (300 seconds)
  },
});

// Index for faster queries
OTPSchema.index({ userId: 1 });
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model("OTP", OTPSchema);
