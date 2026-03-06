import express from'express'
const router=express.Router()
import {loadStartPage,loadHomePage,about,contact,loadProduct,loadSingleProduct,loadcategory,loadNewCollection,searchProducts,loadCategoryProduct}from'../controllers/user/userController.js'
import {userAuth}from'../middlewares/auth.js'

//first page//
router.get('/',loadStartPage);

//home page//
router.get("/home",loadHomePage);

//about page//
router.get('/about',about);

//contact page//
router.get('/contact',contact)

//product//
router.get('/AllProducts',loadProduct)
router.get('/product/:id',loadSingleProduct);

//category//
router.get('/ALLCategories',loadcategory);
router.get("/category/:id", loadCategoryProduct)

//new collection//
router.get('/newArrivals',loadNewCollection)

//search//
router.get('/search-products',searchProducts)

export default router

