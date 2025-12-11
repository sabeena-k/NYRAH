const express=require('express')
const router=express.Router()
const {
    loadSignUp,
    loadSignIn,
    Signup,
    verifyOtp,
    resendOtp,
       SignIn,
       handleLogout,sendOtp,passverifyOtp,resetPassword,
    loadForgotPassword,loadOtpPage}=require('../controllers/user/authController')
    const passport=require('../config/passport')
const {userAuth}=require('../middlewares/auth')



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
router.get("/forgot-password", loadForgotPassword)
router.post('/forgot-password',sendOtp)
router.get("/passVerify", loadOtpPage);
router.post('/passVerify',passverifyOtp)
router.post('/resetPass',resetPassword)

module.exports = router;