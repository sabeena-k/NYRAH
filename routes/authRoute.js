const express=require('express')
const router=express.Router()
const {
    loadSignUp,
    loadSignIn,
    Signup,
    verifyOtp,
    resendOtp,
       SignIn,
       handleLogout}=require('../controllers/user/authController')
    const passport=require('../config/passport')




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


module.exports = router;