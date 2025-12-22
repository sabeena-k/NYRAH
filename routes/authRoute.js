import express from 'express'
const router=express.Router()
import {
    loadSignUp,
    loadSignIn,
    Signup,
    verifyOtp,
    resendOtp,
       SignIn,
       handleLogout,logout,sendOtp,passverifyOtp,resendForgotOtp,resetPassword,
    loadForgotPassword,loadOtpPage,loadResetPasswordPage}from'../controllers/user/authController.js'
    import passport from'../config/passport.js'
import {userAuth}from'../middlewares/auth.js'



router.get("/signup",loadSignUp);
router.get("/signin",loadSignIn);
router.post("/signup",Signup);
router.post("/signin",SignIn);
router.post("/verify-otp",verifyOtp)

router.post('/resend-otp',resendOtp)
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signin'}),
(req,res)=>{
    res.redirect('/')
});
router.get('/logout',handleLogout)
router.post("/logout",logout);
router.get("/forgot-password", loadForgotPassword)
router.post('/forgot-password',sendOtp)
router.get("/passVerify", loadOtpPage);
router.post('/passVerify',passverifyOtp)
router.post("/resend-forgot-otp", resendForgotOtp);
router.get("/resetPass", loadResetPasswordPage);
router.post('/resetPass',resetPassword)

export default router