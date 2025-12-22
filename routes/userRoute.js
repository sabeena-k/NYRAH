import express from'express'
const router=express.Router()
import {loadStartPage,loadHomePage,about,contact,loadProduct,loadSingleProduct}from'../controllers/user/userController.js'



router.get('/',loadStartPage);
router.get("/home",loadHomePage);
router.get('/about',about);
router.get('/contact',contact)
router.get('/AllProducts',loadProduct)
router.get('/product/:id',loadSingleProduct);

export default router

