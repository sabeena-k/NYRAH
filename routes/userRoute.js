const express=require('express')
const router=express.Router()
const {loadStartPage,loadHomePage}=require('../controllers/user/userController')



router.get("/", loadStartPage);

router.get("/home",loadHomePage);

module.exports = router;

