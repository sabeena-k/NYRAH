import express from'express'
const router=express.Router();
import { upload } from "../middlewares/multer.js"
import {loadLogin,login,loadDashBoard,pageerror,adminLogout, ForgetPassword,sendOTP, loadOtpPage, verifyOTP,resetPassword}from'../controllers/admin/admincontroller.js'
import{adminAuth}from'../middlewares/auth.js'
import {customerInfo,customerBlocked, customerUnBlocked,viewCustomer} from"../controllers/admin/customerController.js"
import { categoryInfo, addCategory, editCategory, deleteCategory,blockCategory,unblockCategory,addCatOffer,removeCatOffer}from'../controllers/admin/categoryController.js'
import {productInfo,productAddPage, productAdd, productEdit,productEditPage,addOffer, blockProduct,unblockProduct,loadProductVariants,addVariant,  editVariantPage, updateVariant, deleteVariant, removeOffer,searchProducts}from'../controllers/admin/productController.js'
import{brandInfo, addBrand, editBrand, deleteBrand}from'../controllers/admin/bandController.js'
import {categoryUpload} from"../middlewares/category.js"



//error page//
router.get('/pageError',pageerror)

//login//
router.get('/login',loadLogin)
router.post('/login',login)

//dashBoard//
router.get('/',adminAuth,loadDashBoard)

//logOut//
router.get('/logout',adminLogout)

//password & Otp//
router.get('/forgot-password', ForgetPassword);
router.post('/adminForgotPassword', sendOTP);
router.get('/verify-otp', loadOtpPage);
router.post('/verify-otp', verifyOTP);
router.get('/reset-password', (req, res) => res.render("admin/adminResetPass",{ error: null }));
router.post('/reset-password', resetPassword);


//customer//
router.get('/customers',adminAuth,customerInfo)
router.get('/blockCustomer',adminAuth,customerBlocked)
router.get('/unblockCustomer',adminAuth,customerUnBlocked)
router.get('/customers/:id',adminAuth,viewCustomer);

//category//
router.get('/category', adminAuth, categoryInfo);
router.post('/category', adminAuth,categoryUpload.single("image"),addCategory);
router.put('/category/:id', adminAuth, categoryUpload.single("image"), editCategory);
router.patch('/category/:id/block', adminAuth, blockCategory);
router.patch('/category/:id/unblock', adminAuth, unblockCategory);
router.delete('/category/:id', adminAuth, deleteCategory);
router.post('/category/:id/offer', adminAuth, addCatOffer);
router.post('/category/:id/remove-offer', adminAuth, removeCatOffer);


//product//
router.get('/products', adminAuth, productInfo);
router.get('/products/add', adminAuth, productAddPage);
router.post('/products/add', adminAuth, upload.array("images", 4), productAdd);
router.get('/products/edit/:id', adminAuth, productEditPage);
router.post('/products/edit/:id', adminAuth, upload.array("images", 4), productEdit); 
router.post('/products/block/:id', adminAuth, blockProduct);
router.post('/products/unblock/:id', adminAuth, unblockProduct);
router.post('/products/add-offer/:id', adminAuth, addOffer);
router.post('/products/remove-offer/:id', adminAuth, removeOffer);
router.get('/productVariants/:id', adminAuth, loadProductVariants);
router.get('/products/search', adminAuth, searchProducts);

//variant//
router.post('/productVariants/:id/add', adminAuth, upload.single('image'), addVariant);
router.get('/productVariants/:productId/edit/:variantId', adminAuth, editVariantPage);
router.post('/productVariants/:productId/edit/:variantId', adminAuth, upload.single('image'), updateVariant);
router.post('/productVariants/:productId/delete/:variantId', adminAuth, deleteVariant);

//brand//
router.get("/brand",adminAuth, brandInfo);
router.post("/brand/add",adminAuth, upload.single("brandImage"), addBrand);
router.post("/brand/edit", adminAuth,upload.single("brandImage"), editBrand);
router.post("/brand/delete",adminAuth, deleteBrand)

export default router