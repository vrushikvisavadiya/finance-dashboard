import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../config/email.js";
import { generateOTP } from "../utils/helper.js";

/* Helper: uniform success response */
const ok = (res, message, data) => res.json({ success: true, message, data });

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Prevent duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return fail(res, 409, "User already exists");
    }

    // 2. Create user (but DON'T issue JWT yet)
    const user = new User({ username, email, password });
    await user.save();

    // 3. Create & send OTP
    const otp = generateOTP();
    await OTP.create({ userId: user._id, otp });
    await sendOTPEmail(email, otp);

    // 4. Respond
    return ok(
      res,
      "Registration successful. OTP sent to your email for verification.",
      { email }
    );
  } catch (error) {
    console.error("Register user error:", error);
    return fail(
      res,
      400,
      error.message || "Registration failed. Please try again."
    );
  }
};

// Traditional login (username/password)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return fail(res, 401, "Invalid credentials");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    return ok(res, "Login successful", {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login user error:", error);
    return fail(res, 500, "Login failed. Please try again.");
  }
};

// Send OTP for authentication
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return fail(res, 400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return fail(res, 404, "User not found");
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

    return ok(res, "OTP sent to your email successfully", { email });
  } catch (error) {
    console.error("Send OTP error:", error);
    return fail(res, 500, "Failed to send OTP. Please try again.");
  }
};

// Verify OTP and login
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return fail(res, 400, "Email and OTP are required");
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return fail(res, 404, "User not found");
    }

    // Find and verify OTP
    const otpDocument = await OTP.findOne({
      userId: user._id,
      otp: otp,
    });

    if (!otpDocument) {
      return fail(res, 401, "Invalid or expired OTP");
    }

    // OTP is valid, delete it from database
    await OTP.deleteOne({ _id: otpDocument._id });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    return ok(res, "OTP verified successfully. Login successful!", {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return fail(res, 500, "Failed to verify OTP. Please try again.");
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return fail(res, 400, "Email is required");
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return fail(res, 404, "User not found");
    }

    // Check rate limiting (optional: prevent spam)
    const recentOTP = await OTP.findOne({
      userId: user._id,
      createdAt: { $gt: new Date(Date.now() - 60000) }, // within last 1 minute
    });

    if (recentOTP) {
      return fail(res, 429, "Please wait 1 minute before requesting a new OTP");
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

    return ok(res, "New OTP sent to your email successfully", { email });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return fail(res, 500, "Failed to resend OTP. Please try again.");
  }
};

// ? POST Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return fail(res, 400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) return fail(res, 404, "User not found");

  // remove old tokens & create new OTP
  await OTP.deleteMany({ userId: user._id });
  const otp = generateOTP();
  await OTP.create({ userId: user._id, otp });

  // sendOTPEmail is already implemented in your project
  await sendOTPEmail(email, otp);

  return ok(res, "OTP sent to your email", { email });
};

// ? POST /auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return fail(res, 400, "Email, OTP and new password are required");

  const user = await User.findOne({ email });
  if (!user) return fail(res, 404, "User not found");

  const otpDoc = await OTP.findOne({ userId: user._id, otp });
  if (!otpDoc) return fail(res, 401, "Invalid or expired OTP");

  // OTP valid – delete & update password
  await OTP.deleteOne({ _id: otpDoc._id });
  user.password = newPassword;
  await user.save();

  return ok(res, "Password reset successfully");
};
