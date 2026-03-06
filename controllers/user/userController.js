import mongoose from "mongoose";
import { findUserById} from "../../services/user/userService.js"
import {getProducts,countProducts,getProductById,getRelatedProducts,productByCategory,searchProduct,getNewCollections} from "../../services/user/productService.js"
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
   let user = null;
if (req.session.user) {
  user = await findUserById(req.session.user._id || req.session.user);
}
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    let {
      category,
      brand,
      sort,
      size,
      color,
      priceRange
    } = req.query;

    const filter = {};
    let sortOption = {};

    if (category) {
      filter.category = new mongoose.Types.ObjectId(category);
    }

    if (brand) {
      filter.brand = new mongoose.Types.ObjectId(brand);
    }
    if (size || color) {

  filter.variants = { $elemMatch: {} };

  if (size) {
    filter.variants.$elemMatch.size = size;
  }

  if (color) {
    filter.variants.$elemMatch.color = {
      $regex: new RegExp(`^${color}$`, "i")
    };
  }

}
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      filter.salesPrice = {
        $gte: Number(min),
        $lte: Number(max)
      };
    }
     if (sort === "priceLowHigh") {
      sortOption.salesPrice = 1;
    }
    else if (sort === "priceHighLow") {
      sortOption.salesPrice = -1;
    }
    else if (sort === "aToZ") {
      sortOption.productName = 1;
    }
    else if (sort === "zToA") {
      sortOption.productName = -1;
    }
    else if (sort === "newest") {
      sortOption.createdAt = -1;
    }
    else {
      sortOption.createdAt = -1; // default
    }


    const totalProducts = await countProducts(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await getProducts(filter,sortOption, skip, limit);

    const newProducts = products.filter(p => p.isNew && p.totalStock > 0);
    const categories = await Category.find();
    const brands = await Brand.find();

     const allProducts = await getProducts();

const sizes = [...new Set(
  allProducts.flatMap(p => p.variants?.map(v => v.size))
)];

const colors = [...new Set(
  allProducts.flatMap(p => p.variants?.map(v => v.color))
)];
    res.render("user/AllProducts", {
      user,
      products,
      newProducts,
      categories,
      brands,
      sizes,
      colors,
      currentPage: page,
      totalPages,
      selected: req.query,
      
    });

  } catch (err) {
    console.log(err);
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

    // Validate MongoDB ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).render("user/404");
    }

    // Fetch product with variants fallback
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).render("user/404");
    }

    // Calculate stock for display
    const variants = product.variants || [];
    let totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const productHasStock = totalStock > 0;

    // Collect unique colors
    const colors = [...new Set(variants.map(v => v.color).filter(c => c))];

    // Collect unique sizes
    const uniqueSizes = [...new Set(variants.map(v => v.size).filter(s => s))];

    // Default price for display
    const defaultPrice = variants[0]?.price || product.salesPrice || product.regularPrice || 0;

    // Related products
    const relatedProducts = await getRelatedProducts(product.category._id, product._id);

    // Reviews
    const reviews = await Review.find({ product: product._id });

    // Render product detail page
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
    loadCategoryProduct,
    loadNewCollection,searchProducts
};
