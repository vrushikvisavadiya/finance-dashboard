// utils/sendEmail.js
import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password
    },
  });
};

export const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Personal Finance App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Login - Personal Finance Dashboard",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Personal Finance Dashboard</h2>
        <p>Your OTP for login is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4CAF50; padding: 20px; background-color: #f9f9f9; text-align: center; border-radius: 5px;">
          ${otp}
        </div>
        <p style="color: #666;">This OTP is valid for 5 minutes only.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
