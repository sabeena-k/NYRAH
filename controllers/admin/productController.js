const Products=require('../../models/productSchema')
const Category=require('../../models/categorySchema')
const Brand=require('../../models/brandSchema')
const User=require('../../models/userSchema')
const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const productInfo = async (req, res) => {
    try {
        const products = await Products.find({})
            .populate("category")
            .populate("brand");

        res.render("admin/products", { products });
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageError");
    }
};
const productAddPage = async (req, res) => {
    try {
const productTypes = await Category.find({ type: "productType" });
const brands = await Brand.find({}); 

        res.render("admin/productAdd", {
            productTypes,
            brands
        });
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageError");
    }
};
const productAdd = async (req, res) => {
    try {
        const { name, price, category, brand, description } = req.body;

        if (!name || !price || !category || !brand) {
            return res.redirect("/admin/productAdd");
        }

        const productData = {
            name,
            price,
            category,
            brand,
            description,
        };

        if (req.file) {
            productData.image = req.file.filename; // save uploaded file
        }

        const product = new Products(productData);
        await product.save();

        res.redirect("/admin/products");
    } catch (error) {
        console.log("ADD PRODUCT ERROR:", error);
        res.redirect("/admin/pageError");
    }
};
const productEditPage = async (req, res) => {
  try {
        const { name, price, category, brand, description } = req.body;

        const product = new Products({
            name,
            price,
            category,  
            brand,     
            description
        });

        await product.save();
        res.redirect("/admin/products");

    } catch (error) {
        console.log("ADD PRODUCT ERROR:", error);
        res.redirect("/admin/pageError");
    }
};

const productEdit = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, category, brand, description } = req.body;

        await Products.findByIdAndUpdate(id, {
            name,
            price,
            category,
            brand,
            description,
        });

        res.redirect("/admin/products");
    } catch (error) {
        console.log(error);
        res.redirect("/admin/pageError");
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
    productEditPage,
    productEdit,
    productDelete
};