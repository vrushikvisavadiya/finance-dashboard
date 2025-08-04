import express from "express";
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  resendOTP,
} from "../controllers/authController.js";

const router = express.Router();

// Traditional authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// OTP-based authentication
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

export default router;
