import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { generateOTP } from "../utils/helper.js";

/* uniform helpers -------------------------------------------------------- */
const ok = (res, message, data, status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

/* 1) GET /users/me ------------------------------------------------------- */
export const getMe = async (req, res) => {
  // `req.user` is set by your auth middleware
  const user = await User.findById(req.user._id).select("-password");
  return ok(res, "Profile fetched", { user });
};

/* 2) PATCH /users/change-password --------------------------------------- */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return fail(res, 400, "Current and new passwords are required");

  const user = await User.findById(req.user._id);
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return fail(res, 401, "Current password is incorrect");

  // update + hash (pre-save hook)
  user.password = newPassword;
  await user.save();

  return ok(res, "Password updated successfully");
};
