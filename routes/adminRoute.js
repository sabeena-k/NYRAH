const express=require('express')
const router=express.Router();
const {loadLogin,login,loadDashBoard,pageerror,logout}=require('../controllers/admin/admincontroller')
const {userAuth,adminAuth}=require('../middlewars/auth')
const {customerInfo,customerBlocked,  customerUnBlocked,} = require("../controllers/admin/customerController");
const { categoryInfo, addCategory, editCategory, deleteCategory }=require('../controllers/admin/categoryController')



router.post("/category/edit", editCategory);
router.post("/category/delete", deleteCategory);


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




module.exports=router;