const express=require('express')
const router=express.Router();
const upload=require("../middlewars/multer")
const {loadLogin,login,loadDashBoard,pageerror,logout}=require('../controllers/admin/admincontroller')
const {userAuth,adminAuth}=require('../middlewars/auth')
const {customerInfo,customerBlocked,  customerUnBlocked,} = require("../controllers/admin/customerController");
const { categoryInfo, addCategory, editCategory, deleteCategory }=require('../controllers/admin/categoryController')
const {productInfo,productAddPage, productAdd,
    productEditPage,
    productEdit,
    productDelete}=require('../controllers/admin/productController')
const {brandInfo, addBrand, editBrand, deleteBrand}=require('../controllers/admin/bandController')





router.get('/pageError',pageerror)
router.get('/login',loadLogin)
router.post('/login',login)
router.get('/',adminAuth,loadDashBoard)
router.get('/logout',logout)

router.get('/customers',adminAuth,customerInfo)
router.get('/blockCustomer',adminAuth,customerBlocked)
router.get('/unblockCustomer',adminAuth,customerUnBlocked)
router.get ('/category',adminAuth,categoryInfo)
router.post("/category/add", adminAuth, addCategory);
router.post("/category/edit", adminAuth, editCategory);
router.post("/category/delete", adminAuth, deleteCategory);
router.get('/products',adminAuth,productInfo)
router.get('/products/add',adminAuth,productAddPage)
router.post("/products/add", adminAuth, productAdd);
router.get("/products/edit/:id", adminAuth, productEditPage);
router.post("/products/edit/:id", adminAuth, productEdit);
router.post("/products/delete/:id", adminAuth, productDelete);


router.get("/brand", brandInfo);
router.post("/brand/add", upload.single("brandImage"), addBrand);
router.post("/brand/edit", upload.single("brandImage"), editBrand);
router.post("/brand/delete", deleteBrand)
module.exports=router;