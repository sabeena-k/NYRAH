import Products from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";
import Brand from "../../models/brandSchema.js";
import path from "path";
import fs from "fs";

const getProductsPaginated = async (page, limit) => {
  const skip = (page - 1) * limit;

  const totalCount = await Products.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  const products = await Products.find()
    .populate("category")
    .populate("brand")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { products, totalPages };
};
const getProductAddPageData = async () => {
  const cat = await Category.find();
  const brand = await Brand.find();

  const size = [
    "6 Months","6-12 Months","1-2 Years","2-3 Years",
    "3-4 Years","4-5 Years","5-6 Years","6-7 Years",
    "7-8 Years","8-9 Years","9-10 Years"
  ];

  return { cat, brand, size };
};const createProduct = async (body, files) => {
  const images = files.map(f => f.filename);
  const price = Number(body.price);

  const product = new Products({
    productName: body.name,
    productId: "SKU-" + Date.now(),
    description: body.description,
    category: body.category,
    brand: body.brand,
    regularPrice: price,
    productOffer: 0,
    salesPrice: price,
    quantity: Number(body.quantity) || 0,
    size: body.size,
    color: body.color,
    productImage: images
  });

  return await product.save();
};
const getProductById = async (id) => {
  return await Products.findById(id)
    .populate("category")
    .populate("brand");
};

const getEditPageData = async (id) => {
  const product = await getProductById(id);
  const categories = await Category.find();
  const brands = await Brand.find();

  return {
    product,
    categories,
    brands,
    sizes: [
      "6 Month","6-12 Month","1-2 Years","2-3 Years",
      "3-4 Years","4-5 Years","5-6 Years","6-7 Years",
      "7-8 Years","8-9 Years","9-10 Years"
    ],
    colors: ["Red","Blue","Green","Black","White"]
  };
};
const updateProduct = async (id, body, files) => {
  const product = await Products.findById(id);
  if (!product) return null;

  product.productName = body.name;
  product.description = body.description;
  product.category = body.category;
  product.brand = body.brand;
  product.size = body.size;
  product.color = body.color;
  product.regularPrice = Number(body.price);
  product.quantity = Number(body.quantity) || 0;

  if (product.productOffer > 0) {
    const discount = (product.regularPrice * product.productOffer) / 100;
    product.salesPrice = Math.round(product.regularPrice - discount);
  } else {
    product.salesPrice = product.regularPrice;
  }
  if (body.croppedImage) {
    const base64Data = body.croppedImage.replace(/^data:image\/\w+;base64,/, "");
    const uploadDir = path.join(process.cwd(), "public/uploads/productImages");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = Date.now() + ".jpg";
    fs.writeFileSync(path.join(uploadDir, fileName), base64Data, "base64");
    product.productImage[0] = fileName;
  } 
  else if (files && files.length > 0) {
    product.productImage = files.map(f => f.filename);
  }

  return await product.save();
};
const applyOffer = async (id, offer) => {
  const product = await Products.findById(id);
  if (!product) return null;

  const discount = (product.regularPrice * offer) / 100;
  product.productOffer = offer;
  product.salesPrice = Math.round(product.regularPrice - discount);

  return await product.save();
};
const removeOfferService = async (id) => {
  const product = await Products.findById(id);
  if (!product) return null;

  product.productOffer = 0;
  product.salesPrice = product.regularPrice;
  return await product.save();
};

const deleteProduct = async (id) => {
  return await Products.findByIdAndDelete(id);
};

export {
  getProductsPaginated,
  getProductAddPageData,
  createProduct,
  getEditPageData,
  updateProduct,
  applyOffer,
  removeOfferService,
  deleteProduct
};
