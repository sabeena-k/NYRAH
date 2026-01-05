import express from'express'
const router=express.Router();
import { upload } from "../middlewares/multer.js"
import {loadLogin,login,loadDashBoard,pageerror,logout, ForgetPassword,
    sendOTP,
    loadOtpPage,
    verifyOTP,
    resetPassword}from'../controllers/admin/admincontroller.js'
import{adminAuth}from'../middlewares/auth.js'
import {customerInfo,customerBlocked, customerUnBlocked,viewCustomer} from"../controllers/admin/customerController.js"
import { categoryInfo, addCategory, editCategory, deleteCategory,blockCategory,unblockCategory,addCatOffer,removeCatOffer}from'../controllers/admin/categoryController.js'
import {productInfo,productAddPage, productAdd,
    productEdit,productEditPage,addOffer,
    productDelete,loadProductVariants,
  addVariant,
  editVariantPage,
  updateVariant,
  deleteVariant,
    removeOffer}from'../controllers/admin/productController.js'
import{brandInfo, addBrand, editBrand, deleteBrand}from'../controllers/admin/bandController.js'
import {categoryUpload} from"../middlewares/category.js"




router.get('/pageError',pageerror)
router.get('/login',loadLogin)
router.post('/login',login)
router.get('/',adminAuth,loadDashBoard)
router.get('/logout',logout)

router.get('/forgot-password', ForgetPassword);
router.post('/adminForgotPassword', sendOTP);
router.get('/verify-otp', loadOtpPage);
router.post('/verify-otp', verifyOTP);
router.get('/reset-password',
     (req, res) => res.render("admin/adminResetPass",
         { error: null }));
router.post('/reset-password', resetPassword);

router.get('/customers',adminAuth,customerInfo)
router.get('/blockCustomer',adminAuth,customerBlocked)
router.get('/unblockCustomer',adminAuth,customerUnBlocked)
router.get('/customers/:id',adminAuth,viewCustomer);

router.get('/category', adminAuth, categoryInfo);
router.post('/category', adminAuth,categoryUpload.single("image"),addCategory);
router.put('/category/:id', adminAuth, editCategory);
router.patch('/category/:id/block', adminAuth, blockCategory);
router.patch('/category/:id/unblock', adminAuth, unblockCategory);
router.delete('/category/:id', adminAuth, deleteCategory);
router.post('/category/:id/offer', adminAuth, addCatOffer);
router.post('/category/:id/remove-offer', adminAuth, removeCatOffer);




router.get('/products', adminAuth, productInfo);
router.get('/products/add', adminAuth, productAddPage);
router.post('/products/add', adminAuth, upload.array("images", 4), productAdd);
router.get('/products/edit/:id', adminAuth, productEditPage);
router.post('/products/edit/:id', adminAuth, upload.array("images", 4), productEdit); 
router.post('/products/delete/:id', adminAuth, productDelete);
router.post('/products/add-offer/:id', adminAuth, addOffer);
router.post('/products/remove-offer/:id', adminAuth, removeOffer);
router.get('/productVariants/:id',loadProductVariants)
router.get('/productVariants/:id', adminAuth, loadProductVariants);

router.post('/productVariants/:id/add', adminAuth, upload.single('image'), addVariant);
router.get('/productVariants/:productId/edit/:variantId', adminAuth, editVariantPage);
router.post('/productVariants/:productId/edit/:variantId', adminAuth, upload.single('image'), updateVariant);
router.post('/productVariants/:productId/delete/:variantId', adminAuth, deleteVariant);

router.get("/brand",adminAuth, brandInfo);
router.post("/brand/add",adminAuth, upload.single("brandImage"), addBrand);
router.post("/brand/edit", adminAuth,upload.single("brandImage"), editBrand);
router.post("/brand/delete",adminAuth, deleteBrand)

export default router