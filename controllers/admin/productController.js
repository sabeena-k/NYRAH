const Products = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const Brand = require('../../models/brandSchema');
const User=require('../../models/userSchema')
const path=require('path')
const fs=require('fs')
const sharp=require('sharp')

const productInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const totalCount = await Products.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);

        const products = await Products.find({})
            .populate("category")
            .populate("brand")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.render("admin/products", {
            products,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageError");
    }
};

const productAddPage = async (req, res) => {
    try {
        const cat = await Category.find({});
        const brands = await Brand.find({});
        res.render("admin/productAdd", { cat:cat,brand:brands });
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageError");
    }
};

const productAdd = async (req, res) => {
    try {
        const { name, price, category, brand, description } = req.body;

        if (!name || !price || !category || !brand || !description) {
            console.log("Missing fields");
            return res.redirect("/admin/productAdd?error=missing_fields");
        }
        if (!req.files || req.files.length === 0) {
            console.log("No images uploaded");
            return res.redirect("/admin/productAdd?error=no_images");
        }
        const allImages = req.files.map(file => file.filename);
     const productData = {
    productName: name,    
    productId: "SKU-" + Date.now(),       
    discription: description,  
    regularPrice: price,        
    salesPrice: req.body.offerPrice || price,
    category: category,
    brand: brand,
    color: req.body.color,      
    productImage: allImages
}
        const product = new Products(productData);
        await product.save() 
        res.redirect("/admin/products");
    } catch (error) {
        console.log("ADD PRODUCT ERROR:", error);
        res.redirect("/admin/pageError");
    }
};

const productEditPage = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Products.findById(id)
            .populate('category')
            .populate('brand');

        const cat = await Category.find({});
        const brands = await Brand.find({});

        res.render('admin/productEdit', { product, cat, brands });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/pageError');
    }
};

const productEdit = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, category, brand, description } = req.body;

        await Products.findByIdAndUpdate(id, {
            productName: name,
            discription: description,
            regularPrice: price,
            salesPrice: req.body.offerPrice || price,
            category,
            brand,
            color: req.body.color
        });

        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/pageError');
    }
};
const addOffer = async (req, res) => {
  try {
    const id = req.params.id;
    const offer = parseFloat(req.body.offer); // Make sure it's a number

    const product = await Products.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // calculate salesPrice
    const salesPrice = product.regularPrice - (product.regularPrice * offer / 100);

    product.productOffer = offer;
    product.salesPrice = salesPrice;
    await product.save();

    res.json({ success: true, salesPrice });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const removeOffer = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Products.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.productOffer = null;
    product.salesPrice = product.regularPrice; 
    await product.save();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const productDelete = async (req, res) => {
    try {
        await Products.findByIdAndDelete(req.params.id);
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageError");
    }
};

module.exports = {
    productInfo,
    productAddPage,
    productAdd,
    productEdit,
    productEditPage,
    addOffer,
    removeOffer,
    productDelete
};
