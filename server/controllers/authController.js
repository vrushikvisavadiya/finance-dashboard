import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../config/email.js";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Prevent duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // 2. Create user (but DON'T issue JWT yet)
    const user = new User({ username, email, password });
    await user.save();

    // 3. Create & send OTP
    const otp = generateOTP();
    await OTP.create({ userId: user._id, otp });
    await sendOTPEmail(email, otp);

    // 4. Respond
    res.status(201).json({
      message:
        "Registration successful. OTP sent to your e-mail for verification.",
      email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Traditional login (username/password)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: { id: user._id, username: user.username, email },
      message: "Login successful",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Send OTP for authentication
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete any existing OTP for this user
    await OTP.deleteMany({ userId: user._id });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    const otpDocument = new OTP({
      userId: user._id,
      otp: otp,
    });
    await otpDocument.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({
      message: "OTP sent to your email successfully",
      email: email,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

// Verify OTP and login
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find and verify OTP
    const otpDocument = await OTP.findOne({
      userId: user._id,
      otp: otp,
    });

    if (!otpDocument) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // OTP is valid, delete it from database
    await OTP.deleteOne({ _id: otpDocument._id });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: { id: user._id, username: user.username, email },
      message: "OTP verified successfully. Login successful!",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check rate limiting (optional: prevent spam)
    const recentOTP = await OTP.findOne({
      userId: user._id,
      createdAt: { $gt: new Date(Date.now() - 60000) }, // within last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({
        error: "Please wait 1 minute before requesting a new OTP",
      });
    }

    // Delete existing OTPs and send new one
    await OTP.deleteMany({ userId: user._id });

    const otp = generateOTP();

    const otpDocument = new OTP({
      userId: user._id,
      otp: otp,
    });
    await otpDocument.save();

    await sendOTPEmail(email, otp);

    res.json({ message: "New OTP sent to your email successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
};
