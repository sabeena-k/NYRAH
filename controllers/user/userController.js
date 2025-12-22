import mongoose from "mongoose";
import { findUserById} from "../../services/userService.js"
import {getProducts,countProducts,getProductById,getRelatedProducts} from "../../services/productService.js"
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
     try { if (!req.session.user) {
      return res.redirect('/signin'); }
        const user = await findUserById(req.session.user); 
        if (!user) { req.session.user = null; 
        return res.redirect('/signin');
         } 
            res.render('user/home', { user });
            } catch (error) { console.error('Error loading home page', error);
              res.status(500).send('Server Error'); 
            } 
    };
const about = async (req, res) => {
    res.render('user/about');
};

const contact = async (req, res) => {
    res.render('user/contact');
};

const loadProduct = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/signin");
    }

    const userId = req.session.user._id || req.session.user;
    const user = await findUserById(userId);

    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    const filter = {};

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
      reviews = await Review.find({ productId: product._id });
    }

    res.render("user/product-detail", {
      product,
      relatedProducts,
      reviews
    });

  } catch (error) {
    console.error("Error loading single product:", error);
    res.status(500).send("Internal Server Error");
  }
};

export{
  loadStartPage,
    loadHomePage,
    pageNotFound,
    about,
    contact,
    loadProduct,loadSingleProduct
};
