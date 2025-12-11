const express=require('express')
const router=express.Router()
const {loadStartPage,loadHomePage,about,contact,loadProduct}=require('../controllers/user/userController')

const {userAuth}=require('../middlewares/auth')

router.get("/", loadStartPage);

router.get("/home",userAuth,loadHomePage);
router.get('/about',about);
router.get('/contact',contact)
router.get('/AllProducts',loadProduct)

module.exports = router;

