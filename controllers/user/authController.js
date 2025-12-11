const User=require('../../models/userSchema')
const nodeMailer=require('nodemailer')
const bcrypt=require('bcrypt')
const env=require('dotenv').config()


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
        
        const findUser=await User.findOne({email:email});
       
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
        req.session.user=findUser.id
        res.redirect('/home')
    }catch(error){
console.error('login error',error)
res.render('user/signin',{message:'login failed . Please try again later'})
    }
}

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
const loadSignUp = async (req, res) => {
    try{
        if(req.session.user){  // user already logged in
            return res.redirect('/home'); 
        }
        res.render("user/signup"); // signup page render
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
        const findUser=await User.findOne({email});
        if(findUser){
            return res.render('user/signup',{message:'User with this email already exists'})
        }
        const otp=genarateOtp();

        const emailSend=await sendVerificationEmail(email,otp);
        if(!emailSend){
            return res.json('Email error')
        }
        req.session.userOtp=otp;
        req.session.userData={name,email,phone,password};
        console.log('OTP send',otp);
        res.render('user/Verify-otp',{email})
    }
    catch(error){
        console.error('Signup error',error)
        res.status(500).send('/pageNotFound')
    }
}
 const verifyOtp=async(req,res)=>{
    try{
        const {otp}=req.body
        if(otp===req.session.userOtp){
            const user=req.session.userData
            const passwordHash=await securePassword(user.password)
        
           const saveUserData=new User({
            name:user.name,
            email:user.email,
            phone:user.phone,
            password:passwordHash
           })
           await saveUserData.save();
           res.json({
                success: true,
                redirectUrl: "/signin?msg=account_created"
           })
        }else{
            res.status(400).json({success:false,message:'Invalid OTP , Please try again'})
        }
        
    }catch(error){
      console.error('Error verifying OTP',error)
      res.status(500).json({success:false,message:"An error occured"})
    }
 }

const handleSignUp = async (req, res) => {
   
    req.session.loggedIn = true;
    res.redirect("/home");
};

const handleSignIn = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.render('user/signin', { message: 'User not found' });
        if (user.isBlocked) return res.render('user/signin', { message: 'User is blocked' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.render('user/signin', { message: 'Incorrect password' });

        req.session.user = user._id;  
        res.redirect('/home');         
    } catch (error) {
        console.error('Login error', error);
        res.render('user/signin', { message: 'Login failed. Try again later.' });
    }
};

const resendOtp=async(req,res)=>{
    try{
        const {email}=req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:'Email not find in session'})
        }
        const otp=genarateOtp();
        req.session.userOtp=otp;
        const emailSend=await sendVerificationEmail(email,otp);
        if(emailSend){
            console.log('Resend OTP:',otp)
            res.status(200).json({success:true,message:'OTP Resend successsfully'})
        }else{
            res.status(500).json({success:false,message:'Filed resend OTP, Please try again'})
        }
    }catch(error){
       console.error('Error resending otp',error)
       res.status(500).json({success:false,message:'Internal server error'})
    }
}
const handleLogout = (req, res) => {
    req.session.destroy(err => {
        if(err) console.error(err);
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
const sendOtp =async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.render("user/forgot-password", { error: "Email not found" });
        }

        const otp = generateOtp();

        user.resetOtp = otp;
        user.otpExpire = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendOtpMail(email, otp);

        res.render("resetPas", { email, error: null });

    } catch (err) {
        console.log(err);
        res.render("user/forgot-password", { error: "Something went wrong" });
    }
};
const loadOtpPage=async(req,res)=>{
     try {
        res.render("user/passVerify", { error: null });
    } catch (err) {
        res.send("Error loading forgot page");
    }
}
const passverifyOtp = async (req, res) => {
    try {
        const { email, d1, d2, d3, d4 } = req.body;

        const enteredOtp = d1 + d2 + d3 + d4;

        const user = await User.findOne({ email });

        if (!user || user.resetOtp !== enteredOtp) {
            return res.render("otp-page", { email, error: "Invalid OTP" });
        }

        if (user.otpExpire < Date.now()) {
            return res.render("otp-page", { email, error: "OTP expired" });
        }

        res.render("resetPass", { email, error: null });

    } catch (err) {
        console.log(err);
        res.redirect("/forgot-password");
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        await User.updateOne(
            { email },
            {
                $set: {
                    password: hashed,
                    resetOtp: null,
                    otpExpire: null
                }
            }
        );

        res.redirect("/login");

    } catch (err) {
        console.log(err);
        res.render("reset-password", { error: "Failed to reset password" });
    }

};
module.exports = {
    loadSignUp,
    loadSignIn,
    handleSignUp,
    handleSignIn,
    Signup,
    verifyOtp,
    resendOtp,
    SignIn,
    handleLogout,sendOtp,
    passverifyOtp,resetPassword,
    loadForgotPassword,loadOtpPage
};
