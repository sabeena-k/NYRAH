import env from "dotenv";
env.config();

import {
  findAdmin,
  checkPassword,
  generateOTP,
  sendOTPEmail,
  updatePassword,
} from "../../services/admin/adminServices.js";

const pageerror = async (req, res) => {
  res.render("admin/pageError");
};

const loadLogin = async (req, res) => {
  try {
    if (req.session.admin) return res.redirect("/admin");
    res.render("admin/login", { message: null });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/pageError");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await findAdmin(email);
    if (!admin) return res.redirect("/admin/login");

    const match = await checkPassword(password, admin.password);
    if (!match) return res.redirect("/admin/login");

    req.session.admin = admin._id;
    res.redirect("/admin");
  } catch (error) {
    console.log("Login Failed", error);
    res.redirect("/admin/pageError");
  }
};

const loadDashBoard = async (req, res) => {
  try {
    if (!req.session.admin) return res.redirect("/admin/login");
    res.render("admin/dashboard", { page: "dashboard" });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/login");
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/admin/login");
    });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/pageError");
  }
};

const ForgetPassword = async (req, res) => {
  res.render("admin/adminForgotPass", { error: null, success: null });
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await findAdmin(email);
    
    if (!admin) {
      return res.render("admin/adminForgotPass", {
        error: "Admin not found",
        success: null,
      });
    }

    const otp = generateOTP();

    req.session.otp = otp;
    req.session.adminEmail = email;
    req.session.otpExpires = Date.now() + 10 * 60 * 1000;
console.log("Generated OTP:", otp);
    await sendOTPEmail(email, otp);

    res.render("admin/adminOtpPage", {
      error: null,
      success: "OTP sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.render("admin/adminForgotPass", {
      error: "Something went wrong",
      success: null,
    });
  }
};

const loadOtpPage = (req, res) => {
  res.render("admin/adminOtpPage", { error: null, success: null });
};

const verifyOTP = (req, res) => {
  const { otp } = req.body;

  if (Date.now() > req.session.otpExpires) {
    return res.render("admin/adminOtpPage", {
      error: "OTP expired",
      success: null,
    });
  }

  if (parseInt(otp) !== req.session.otp) {
    return res.render("admin/adminOtpPage", {
      error: "Invalid OTP",
      success: null,
    });
  }

  res.render("admin/adminResetPass", { error: null });
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render("admin/adminResetPass", {
        error: "Passwords do not match",
      });
    }

    await updatePassword(req.session.adminEmail, password);

    req.session.otp = null;
    req.session.adminEmail = null;
    req.session.otpExpires = null;

    res.redirect("/admin/login");
  } catch (error) {
    console.log(error);
    res.render("admin/adminResetPass", {
      error: "Something went wrong",
    });
  }
};

export {
  loadLogin,
  login,
  loadDashBoard,
  pageerror,
  logout,
  ForgetPassword,
  sendOTP,
  loadOtpPage,
  verifyOTP,
  resetPassword,
};