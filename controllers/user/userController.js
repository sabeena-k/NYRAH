import mongoose from "mongoose";
import { findUserById} from "../../services/user/userService.js"
import {getProducts,countProducts,getProductById,getRelatedProducts,productByCategory,searchProduct,getNewCollections,getColors,getSizes} from "../../services/user/productService.js"
import {getAllCategories,homeCategories} from"../../services/user/categoryService.js"
import Review from'../../models/reviewSchema.js'
import Category from "../../models/categorySchema.js"
import{getAllBrands}from'../../services/user/brandService.js'

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

    if (req.isAuthenticated()) {
      user = req.user;
    } else if (req.session && req.session.user) {
      user = await findUserById(req.session.user);
    }

    const page = Number(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.category) {
      filter.category = new mongoose.Types.ObjectId(req.query.category);
    }
     let sortOption = { createdAt: -1 };
    const products = await getProducts(filter,sortOption, skip, limit);
    const totalProducts = await countProducts(filter);
    const newCollections = await getNewCollections(4);
    const categories = await homeCategories();
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
    const user = req.session?.user
      ? await findUserById(req.session.user)
      : null;

    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    const { category, brand, sort, size, color, priceRange, search } = req.query;

    const filter = {};

    if (search) {
      filter.productName = {
        $regex: search.trim(),
        $options: "i"
      };
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (size || color) {
      filter.variants = { $elemMatch: {} };

      if (size) filter.variants.$elemMatch.size = size;
      if (color) filter.variants.$elemMatch.color = color;
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-");
      filter.salesPrice = {
        $gte: Number(min),
        $lte: Number(max)
      };
    }
    const sortMap = {
      priceLowHigh: { salesPrice: 1 },
      priceHighLow: { salesPrice: -1 },
      aToZ: { productName: 1 },
      zToA: { productName: -1 },
      newest: { createdAt: -1 }
    };

    const sortOption = sortMap[sort] || { createdAt: -1 };

   
    const [
      products,
      totalProducts,
      categories,
      brands,
      sizes,
      colors
    ] = await Promise.all([
      getProducts(filter, sortOption, skip, limit),
      countProducts(filter),
      getAllCategories(),   
      getAllBrands(),       
      getSizes(),          
      getColors()          
      
    ]);

    res.render("user/AllProducts", {
      user,
      products,
      categories,
      brands,
      sizes,
      colors,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      selected: req.query
    });

  } catch (error) {
    console.error("Load Product Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const loadSingleProduct = async (req, res) => {
  try {
    let user = null;
    if (req.session?.user) {
      user = await findUserById(req.session.user);
    }

    const productId = req.params.id;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).render("user/404");
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).render("user/404");
    }

    const variants = product.variants || [];
    let totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const productHasStock = totalStock > 0;

    const colors = [...new Set(variants.map(v => v.color).filter(c => c))];

    
    const uniqueSizes = [...new Set(variants.map(v => v.size).filter(s => s))];

    const defaultPrice = variants[0]?.price || product.salesPrice || product.regularPrice || 0;

    const relatedProducts = await getRelatedProducts(product.category._id, product._id);

    const reviews = await Review.find({ product: product._id });

  
    res.render("user/product-detail", {
      product,
      variants,
      colors,
      uniqueSizes,
      productHasStock,
      defaultPrice,
      relatedProducts,
      reviews,
      user
    });

  } catch (error) {
    console.error(error);
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
 const loadCategoryProduct = async (req, res) => {
  try {

    let user = null;

    if (req.session?.user) {
      user = await findUserById(req.session.user);
    }

    const categoryId = req.params.id;

    const products = await productByCategory(categoryId);

    res.render("user/category", {
      user,
      products
    });

  } catch (error) {
    console.log("Category products error:", error);
    res.redirect("/pageError");
  }
};
const loadNewCollection = async (req, res) => {
  try {
    let user = null;
    if (req.session?.user) {
      user = await findUserById(req.session.user);
    }

    const newArrivals = await getNewCollections(10); 
    res.render("user/newArrivals", {
       newArrivals,
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
    loadCategoryProduct,
    loadNewCollection,searchProducts
};
