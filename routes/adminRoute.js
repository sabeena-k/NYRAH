const express=require('express')
const router=express.Router();
const upload=require('../middlewares/multer')
const {loadLogin,login,loadDashBoard,pageerror,logout}=require('../controllers/admin/admincontroller')
const {userAuth,adminAuth}=require('../middlewares/auth')
const {customerInfo,customerBlocked,  customerUnBlocked,} = require("../controllers/admin/customerController");
const { categoryInfo, addCategory, editCategory, deleteCategory,blockCategory,unblockCategory}=require('../controllers/admin/categoryController')
const {productInfo,productAddPage, productAdd,
    productEdit,productEditPage,addOffer,removeOfferOffer,
    productDelete,
    removeOffer}=require('../controllers/admin/productController')
const {brandInfo, addBrand, editBrand, deleteBrand}=require('../controllers/admin/bandController')





router.get('/pageError',pageerror)
router.get('/login',loadLogin)
router.post('/login',login)
router.get('/',adminAuth,loadDashBoard)
router.get('/logout',logout)

router.get('/customers',adminAuth,customerInfo)
router.get('/blockCustomer',adminAuth,customerBlocked)
router.get('/unblockCustomer',adminAuth,customerUnBlocked)


router.get('/category', adminAuth, categoryInfo);
router.post('/category', adminAuth, addCategory);
router.put('/category/:id', adminAuth, editCategory);
router.patch('/category/:id/block', adminAuth, blockCategory);
router.patch('/category/:id/unblock', adminAuth, unblockCategory);
router.delete('/category/:id', adminAuth, deleteCategory);


router.get('/products',adminAuth,productInfo)
router.get('/products/add',adminAuth,productAddPage)
router.post("/products/add", upload.array("images", 4),adminAuth, productAdd);
router.get("/products/edit/:id", adminAuth, productEditPage);
router.post("/products/edit/:id", adminAuth, productEdit);
router.post("/products/delete/:id", adminAuth, productDelete);
router.get('/products/:id/add-offer', adminAuth,addOffer);
router.post('/products/:id/add-offer', adminAuth,removeOffer);




router.get("/brand",adminAuth, brandInfo);
router.post("/brand/add",adminAuth, upload.single("brandImage"), addBrand);
router.post("/brand/edit", adminAuth,upload.single("brandImage"), editBrand);
router.post("/brand/delete",adminAuth, deleteBrand)

module.exports=router;