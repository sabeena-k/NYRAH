import {createUser,findUserByEmail,updateUserPassword,saveResetOtp,verifyResetOtp,isPhoneExists } from '../../services/user/userService.js';
import nodeMailer from 'nodemailer'
import bcrypt from 'bcrypt'
import env from 'dotenv'
env.config()

function genarateOtp(){
    return Math.floor(1000+Math.random()*9000).toString();
}

//otp  verification//
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
const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await findUserByEmail(email);
    if (!findUser) return res.render('user/signin', { message: 'User not found' });
    if (findUser.isBlocked) return res.render('user/signin', { message: 'User is blocked by admin' });

    const passwordMatch = await bcrypt.compare(password, findUser.password);
    if (!passwordMatch) return res.render('user/signin', { message: 'Incorrect password' });

    // ✅ Remove regenerate() — just set the session directly
    req.session.user = {
      id: findUser._id,
      role: "user"
    };

    req.session.save((err) => {
      if (err) return res.render('user/signin', { message: 'Session error' });
      res.redirect('/home');
    });

  } catch (error) {
    console.error('Login error', error);
    res.render('user/signin', { message: 'Login failed. Please try again later' });
  }
};
const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect('/signin');
    }

    if (user.isBlocked) {
      req.logout(err => {
        if (err) console.error(err);
      });

      return res.send(`
        <script>
          window.opener.postMessage('google-login-blocked', window.origin);
          window.close();
        </script>
      `);
    }

    // 🔥 IMPORTANT FIX
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.redirect('/signin');
      }

     if (user.role === "admin") {
  req.session.admin = {
    id: user._id,
    role: "admin"
  };
} else {
  req.session.user = {
    id: user._id,
    role: "user"
  };
}
      req.session.save(() => {
        res.send(`
          <script>
            window.opener.postMessage('google-login-success', window.origin);
            window.close();
          </script>
        `);
      });
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.redirect('/signin');
  }
};
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
const Signup = async (req, res) => {
  try {
    const { name, email, phone, password, cPassword } = req.body;

    //Required fields
    if (!name || !email || !phone || !password || !cPassword) {
      return res.render('user/signup', { message: 'All fields are required' });
    }

    //Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render('user/signup', { message: 'Invalid email format' });
    }

    //Password match
    if (password !== cPassword) {
      return res.render('user/signup', { message: 'Passwords do not match' });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.render('user/signup', { message: 'Invalid phone number (must be 10 digits)' });
    }

    //Email exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.render('user/signup', { message: 'Email already exists' });
    }

    // Phone exists
    const phoneExists = await isPhoneExists(phone);
    if (phoneExists) {
      return res.render('user/signup', { message: 'Mobile number already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

  

    //Generate OTP
    const otp = genarateOtp();

    const emailSend = await sendVerificationEmail(email, otp);
    if (!emailSend) {
      return res.render('user/signup', { message: 'Failed to send OTP' });
    }

    // Store in session (CLEAN STRUCTURE)
    req.session.userOtpData = {
      otp,
      expiresAt: Date.now() + 1 * 60 * 1000, // 1 min (aligns with front-end timer)
      user: {
        name,
        email,
        phone,
       password:hashedPassword
      }
    };

    console.log('OTP sent:', otp);

    res.render('user/Verify-otp', { email });

  } catch (error) {
    console.error('Signup error', error);
    res.status(500).send('Server Error');
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;  
     const otpData=req.session.userOtpData;
    if (!otpData) {
      return res.json({
        success: false,
        message: "Session expired"
      });
    }
     if(Date.now()>otpData.expiresAt){
      return res.json({
        success:false,
        message:'OTP Expired'
      })
     }
    if (otp !== otpData.otp) {
      return res.json({
        success: false,
        message: "Invalid OTP"
      });
    }

    await createUser(otpData.user);

    req.session.userOtpData = null;
    
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
    const otpData = req.session.userOtpData;

    //  Check session properly
    if (!otpData) {
      return res.json({
        success: false,
        message: "Session expired. Please signup again."
      });
    }

    const email = otpData.user.email;

    //  Generate new OTP
    const otp =genarateOtp();

    //  Send email
    await sendVerificationEmail(email, otp);

    // Update session Without losing user data
    req.session.userOtpData = {
      ...otpData,
      otp,
      expiresAt: Date.now() + 1 * 60 * 1000
    };

    // Save session
    req.session.save();

    console.log("Resent OTP:", otp);

    res.json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Failed to resend OTP"
    });
  }
};
const handleLogout = (req, res) => {
    if (!req.session.user) return res.redirect('/signin');
  res.render('user/logout');
};
const userLogout=async(req,res)=>{
  if (req.session.user) {
    req.session.user = null;
  }
  res.redirect('/signin');
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
    console.log("🔥 RESEND CALLED");
 console.log("BODY:", req.body); //
    const { email } = req.body;
    if (!email) {
      return res.json({
        success: false,
        message: "Email missing"
      });
    }

    const otp = genarateOtp();

    await saveResetOtp(email, otp);
    await sendVerificationEmail(email, otp);

    console.log("Resent OTP:", otp);

    res.json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Failed to resend OTP"
    });
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

    // ✅ SUCCESS
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
    googleCallback,
    handleLogout,userLogout,sendOtp,
    passverifyOtp,resendForgotOtp,resetPassword,
    loadForgotPassword,loadOtpPage,loadResetPasswordPage
};
