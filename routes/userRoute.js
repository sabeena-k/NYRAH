import express from'express'
const router=express.Router()
import {loadStartPage,loadHomePage,about,contact,loadProduct,loadSingleProduct,loadcategory,loadNewCollection,searchProducts}from'../controllers/user/userController.js'



router.get('/',loadStartPage);
router.get("/home",loadHomePage);
router.get('/about',about);
router.get('/contact',contact)
router.get('/AllProducts',loadProduct)
router.get('/product/:id',loadSingleProduct);
router.get('/AllCategories',loadcategory)
router.get('/newArrivals',loadNewCollection)
router.get('/search-products',searchProducts)

export default router

