import mongoose from "mongoose";
import { findUserById,getNewCollections} from "../../services/user/userService.js"
import {getProducts,countProducts,getProductById,getRelatedProducts,productByCategory,searchProduct} from "../../services/user/productService.js"
import {getAllCategories,homeCategories} from"../../services/user/categoryService.js"
import Review from'../../models/reviewSchema.js'
import Category from "../../models/categorySchema.js"
import Brand from "../../models/brandSchema.js"

const pageNotFound = (req, res) => {
     res.status(404).render('user/404');
     }; 
const loadStartPage=async(req,res)=>{
     try{
         if(req.session&&req.session.user){
             return res.redirect("/home") 
            } 
             return res.render("user/start",{user:null}); 
            }catch(error){
                 console.log('Error on loading')
                 res.status(500).send('Server Error') 
                } 
                };
const loadHomePage = async (req, res) => { 
  try {
    let user = null;

    if (req.session && req.session.user) {
      user = await findUserById(req.session.user);
    }

    const page = Number(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const filter = { isBlock: false };
    if(req.query.category){
      filter.category=req.query.category;  
    }

    const products = await getProducts(filter, skip, limit);
    const totalProducts = await countProducts(filter);
    const newCollections = await getNewCollections(4);
    const categories = await  homeCategories();
    res.render("user/home", {
      user,
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      newCollections,
      categories,
      selectedCategory: req.query.category || null,
    });

  } catch (error) {
    console.error("Home page error", error);
    res.status(500).send("Server Error");
  }};
const about = async (req, res) => {
    res.render('user/about');
};

const contact = async (req, res) => {
    res.render('user/contact');
};

const loadProduct = async (req, res) => {
  try {
   let user = null;
if (req.session.user) {
  user = await findUserById(req.session.user._id || req.session.user);
}
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    const filter = {isBlock: false};

    if (req.query.category) {
      filter.category = new mongoose.Types.ObjectId(req.query.category);
    }

    if (req.query.brand) {
      filter.brand = new mongoose.Types.ObjectId(req.query.brand);
    }

    const totalProducts = await countProducts(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await getProducts(filter, skip, limit)
    const categories = await Category.find();
    const brands = await Brand.find();

    res.render("user/AllProducts", {
      user,
      products,
      categories,
      brands,
      currentPage: page,
      totalPages,
      selected: req.query
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

const loadSingleProduct = async (req, res) => {
  try {
    const user = req.session.user;
    const productId = req.params.id;
    
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).render("user/404");
    }

    const product = await getProductById(productId)
      

    if (!product) {
      return res.status(404).render("user/404");
    }

    const relatedProducts = await getRelatedProducts(
      product.category,
       product._id);

    let reviews = [];
    if (typeof Review !== "undefined") {
      reviews = await Review.find({ product: product._id });
    }

    res.render("user/product-detail", {
      user,
      product,
      relatedProducts,
      reviews
    });

  } catch (error) {
    console.error("Error loading single product:", error);
    res.status(500).send("Internal Server Error");
  }
};

const loadcategory=async(req,res)=>{
     try {
    let user = null;

    if (req.session?.user) {
      user = await findUserById(req.session.user);
    }

    const categories = await getAllCategories(); 

    res.render("user/categories", {
      user,
      categories
    });

  } catch (err) {
    console.log("Load categories error:", err);
    res.redirect("/pageError");
  }
};
const loadNewCollection= async (req, res) => {
  try {
    let user = null;

    if (req.session?.user) {
      user = await findUserById(req.session.user);}

    const products = await getNewCollections(10); 
    res.render("user/newArrivals", {
       products,
       user
       });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
const searchProducts=async(req,res)=>{
  try{
  const query = req.query.q || ""; 
   if (!query) return res.json([]);
   const products = await searchProduct(query, 10);  
    res.json(products);
  }catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });

  }

};
export{
  loadStartPage,
    loadHomePage,
    pageNotFound,
    about,
    contact,
    loadProduct,loadSingleProduct,loadcategory,
    loadNewCollection,searchProducts
};
