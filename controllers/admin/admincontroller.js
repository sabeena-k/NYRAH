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
    if (!admin) {
      return res.render("admin/login", { message: "Email not found" });
    }

    const match = await checkPassword(password, admin.password);
    if (!match) {
      return res.render("admin/login", { message: "Password incorrect" });
    }

    // ✅ Just set the admin key, don't regenerate
    req.session.admin = {
      id: admin._id,
      role: "admin"
    };

    req.session.save((err) => {
      if (err) return res.render("admin/login", { message: "Session error" });
      res.redirect("/admin");
    });

  } catch (error) {
    console.log("Login Failed", error);
    res.render("admin/login", { message: "Something went wrong" });
  }
};
const loadDashBoard = async (req, res) => {
  try {
    res.render("admin/dashboard", { page: "dashboard" });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/login");
  }
};

const adminLogout = async (req, res) => {
  req.session.admin = null;
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    res.redirect('/admin/login');
  });
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

    req.session.otp = String(otp);
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


   if (!req.session.otp || !req.session.otpExpires) {
    return res.render("admin/adminOtpPage", {
      error: "Session expired. Please request a new OTP.",
      success: null,
    });
  }

  if (Date.now() > req.session.otpExpires) {
    return res.render("admin/adminOtpPage", {
      error: "OTP expired",
      success: null,
    });
  }

  if (otp.trim() !== req.session.otp) { 
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
  adminLogout,
  ForgetPassword,
  sendOTP,
  loadOtpPage,
  verifyOTP,
  resetPassword,
};