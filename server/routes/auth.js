import express from "express";
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Traditional authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// OTP-based authentication
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.post("/forgot-password", forgotPassword); // NEW
router.post("/reset-password", resetPassword); // NEW

export default router;
