import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const findAdmin = async (email) => {
  return await User.findOne({ email, isAdmin: true });
};

const checkPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "Admin Password Reset OTP",
    text: `Your OTP is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

const updatePassword = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne(
    { email },
    { $set: { password: hashedPassword } }
  );
};

export {
  findAdmin,
  checkPassword,
  generateOTP,
  sendOTPEmail,
  updatePassword,
};
