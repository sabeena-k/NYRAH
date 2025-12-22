import {createUser,findUserByEmail,updateUserPassword,saveResetOtp,verifyResetOtp } from '../../services/userService.js';
import nodeMailer from 'nodemailer'
import bcrypt from 'bcrypt'
import env from 'dotenv'
env.config()

function genarateOtp(){
    return Math.floor(1000+Math.random()*9000).toString();
}
async function sendVerificationEmail(email,otp){
   try{
    const transporter= nodeMailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.NODEMAILER_EMAIL,
            pass:process.env.NODEMAILER_PASSWORD
        }
    })

    const info=await transporter.sendMail({
        from:process.env.NODEMAILER_EMAIL,
        to:email,
        subject:'Verify your account',
        text:`Your OTP is ${otp}`,
        html:`<b>Your OTP : ${otp}</b>`

    })
         console.log('Email sent:', info.response);
        return true; 

   }catch(error){
      console.error('Error sending email',error);
      return false
   }
}
async function securePassword(password){
    try{
      const passwordHash=await bcrypt.hash(password,8)
      return passwordHash;
    }catch(error){
   console.error("Error hashing password:", error);
        throw error;
    }
}
const loadSignIn = async (req, res) => {
   try{
    if(!req.session.user){
        return res.render('user/signin')
    }else{
        res.redirect('/home')}
   }catch(error){
    res.redirect('pageNotFound')
   }
};
const SignIn=async(req,res)=>{
    try{
        const {email,password}=req.body
        
        const findUser=await findUserByEmail(email);
       
        if(!findUser){
            return res.render('user/signin',{message:'User not found'})

        }
        if(findUser.isBlocked){
            return res.render('user/signin',{message:'User is blocked by admin'})
        }
        const passwordMatch=await bcrypt.compare(password,findUser.password)
        if(!passwordMatch){
            return res.render('user/signin',{message:'incorrect Password'})
        }
         req.session.regenerate(err => {
      if (err) {
        console.error(err);
        return res.render('user/signin', { message: 'Session error' });
      }

      req.session.user = findUser._id;
      res.redirect('/home');
    });

    }catch(error){
console.error('login error',error)
res.render('user/signin',{message:'login failed . Please try again later'})
    }
}


const loadSignUp = async (req, res) => {
    try{
        if(req.session.user){  
            return res.redirect('/'); 
        }
        res.render("user/signup"); 
    } catch(error){
        res.redirect('/pageNotFound');
    }
}
const Signup=async(req,res)=>{
    try{
      const {name,email,phone,password,cPassword}=req.body;
      console.log("User email received:", email);

        if(password!==cPassword){
            return res.render('user/signup',{message:'Password do not match'})

        }
        const findUser=await findUserByEmail(email);
        if(findUser){
            return res.render('user/signup',{message:'User with this email already exists'})
        }
        const otp=genarateOtp();

        const emailSend=await sendVerificationEmail(email,otp);
        if(!emailSend){
            return res.json('Email error')
        }
       req.session.userOtp = otp;
      req.session.signupEmail = email; 
      req.session.userData = {name,email,phone,password };
        console.log('OTP send',otp);
        res.render('user/Verify-otp',{email})
    }
    catch(error){
        console.error('Signup error',error)
        res.status(500).send('/pageNotFound')
    }
}
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;  

    if (!req.session.userOtp || !req.session.signupEmail) {
      return res.json({
        success: false,
        message: "Session expired"
      });
    }

    if (otp !== req.session.userOtp) {
      return res.json({
        success: false,
        message: "Invalid OTP"
      });
    }

    await createUser(req.session.userData);

    req.session.userOtp = null;
    req.session.userData = null;
    req.session.signupEmail = null;

    res.json({
      success: true,
      redirectUrl: "/signin"
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "OTP verification failed"
    });
  }
};
const resendOtp = async (req, res) => {
  try {
    const email = req.session.signupEmail;

    if (!email) {
      return res.json({
        success: false,
        message: "Session expired. Please signup again."
      });
    }

    const otp = genarateOtp();
    req.session.userOtp = otp;

    await sendVerificationEmail(email, otp);

    console.log("Resent OTP:", otp);
    res.json({ success: true, message: "OTP resent successfully" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to resend OTP" });
  }
};

const handleLogout = (req, res) => {
    if (!req.session.user) return res.redirect('/signin');
  res.render('user/logout');
};
const logout=async(req,res)=>{
   req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/home');
    }
    res.clearCookie('connect.sid'); 
    res.redirect('/signin'); 
  });
};
const loadForgotPassword = async (req, res) => {
    try {
        res.render("user/forgot-password", { error: null });
    } catch (err) {
        res.send("Error loading forgot page");
    }
};
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = genarateOtp();

    const user = await saveResetOtp(email, otp);
    if (!user) {
      return res.render("user/forgot-password", { error: "Email not found" });
    }
    
    await sendVerificationEmail(email, otp);
    console.log("OTP sent:", otp);

    req.session.resetEmail = email; 
req.session.save(() => {
  res.render("user/passVerify", { email, error: null });
});

  } catch (err) {
    console.error(err);
    res.render("user/forgot-password", { error: "Something went wrong" });
  }
};
const resendForgotOtp = async (req, res) => {
  try {
    const email = req.session.resetEmail;   // ✅ CORRECT KEY

    if (!email) {
      return res.json({
        success: false,
        message: "Session expired. Please try again"
      });
    }

    const otp = genarateOtp();

    await saveResetOtp(email, otp);
    await sendVerificationEmail(email, otp);

    console.log("Resent forgot OTP:", otp);

    res.json({ success: true, message: "OTP resent successfully" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to resend OTP" });
  }
};


const loadOtpPage = async (req, res) => {
    try {
        res.render("user/passVerify", { 
            email: req.query.email, 
            error: null 
        });
    } catch (err) {
        console.log(err);
        res.redirect("/forgot-password");
    }
};


const passverifyOtp = async (req, res) => {
  try {
    const { email, d1, d2, d3, d4 } = req.body;
    const enteredOtp = d1 + d2 + d3 + d4;

    const result = await verifyResetOtp(email, enteredOtp);

    if (result.status === "notfound")
      return res.render("user/passVerify", { email, error: "User not found" });

    if (result.status === "invalid")
      return res.render("user/passVerify", { email, error: "Invalid OTP" });

    if (result.status === "expired")
      return res.render("user/passVerify", { email, error: "OTP expired" });
     req.session.resetAllowed = true;
    res.redirect(`/resetPass?email=${email}`);

  } catch (err) {
    console.error(err);
    res.redirect("/forgot-password");
  }
};

const loadResetPasswordPage = (req, res) => {
  if (!req.session.resetAllowed) {
    return res.redirect("/forgot-password");
  }
  const email = req.query.email;
  if (!email) {
    return res.redirect("/forgot-password");
  }
  res.render("user/resetPass", { email, error: null });
};

const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email) {
      return res.redirect("/forgot-password");
    }

    if (password !== confirmPassword) {
      return res.render("user/resetPass", {
        email,                  
        error: "Passwords do not match"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const updated = await updateUserPassword(email, hashedPassword);

    if (!updated) {
      return res.render("user/resetPass", {
        email,
        error: "User not found"
      });
    }
    req.session.resetAllowed = false;
req.session.passwordResetDone = true;
res.redirect("/signin");
  } catch (err) {
    console.error(err);
    res.render("user/resetPass", {
      email: req.body.email,       
      error: "Failed to reset password"
    });
  }
};


export {
    loadSignUp,
    loadSignIn,
    Signup,
    verifyOtp,
    resendOtp,
    SignIn,
    handleLogout,logout,sendOtp,
    passverifyOtp,resendForgotOtp,resetPassword,
    loadForgotPassword,loadOtpPage,loadResetPasswordPage
};
