import Products from "../../models/productSchema.js";
import Category from "../../models/categorySchema.js";
import Brand from "../../models/brandSchema.js";
import path from "path";
import fs from "fs";

//product page//

const getProductsPaginated = async (page = 1, limit = 10, filters = {}) => {
  page = Math.max(1, parseInt(page));
  limit = Math.min(50, parseInt(limit));
  const skip = (page - 1) * limit;

  const query = {};

 
  if (filters.search && filters.search.trim() !== "") {
    query.productName = { $regex: filters.search.trim(), $options: "i" };
  }


  if (filters.category && filters.category.trim() !== "") {
    query.category = filters.category;
  }


  if (filters.brand && filters.brand.trim() !== "") {
    query.brand = filters.brand;
  }


  if (filters.status === "active") query.isBlock = false;
  if (filters.status === "blocked") query.isBlock = true;

  const [products, totalCount] = await Promise.all([
    Products.find(query)
      .populate("category")
      .populate("brand")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Products.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  return { products, totalPages };
};

//Product ADD//
const getProductAddPageData = async () => {
  const cat = await Category.find();
  const brand = await Brand.find();

  const size = [
    "6 Months","6-12 Months","1-2 Years","2-3 Years",
    "3-4 Years","4-5 Years","5-6 Years","6-7 Years",
    "7-8 Years","8-9 Years","9-10 Years"
  ];

  return { cat, brand, size };
};
const createProduct = async (body, files) => {
  const images = files.map(f => f.filename);
  const price = Number(body.price);

  let sizesArray = [];

  if (Array.isArray(body.size)) {
    sizesArray = body.size.map(size => ({
      size: size,
      price: price,
      stock: Number(body.quantity)
    }));
  } else if (body.size) {
    sizesArray = [{
      size: body.size,
      price: price,
      stock: Number(body.quantity)
    }];
  }

  const product = new Products({
    productName: body.name,
    productId: "SKU-" + Date.now(),
    description: body.description,
    category: body.category,
    brand: body.brand,
    regularPrice: price,
    productOffer: 0,
    salesPrice: price,
    variants: sizesArray.map(item => ({
    size: item.size,
    color: body.color,   // add color here
    price: item.price,
    stock: item.stock
     })),
    productImage: images,
    isNewProduct: body.isNew === "true",
    isBlock: false
  });

  return await product.save();
};

//view single product//
const getProductById = async (id) => {
  return await Products.findById(id)
    .populate("category")
    .populate("brand");
};

//product Edit//
const getEditPageData = async (id) => {
  const product = await getProductById(id);
  const categories = await Category.find();
  const brands = await Brand.find();

  return {
    product,
    categories,
    brands,
    sizes: [
      "6 Months","6-12 Months","1-2 Years","2-3 Years",
      "3-4 Years","4-5 Years","5-6 Years","6-7 Years",
      "7-8 Years","8-9 Years","9-10 Years"
    ],
    colors: ["Red","Blue","Green","Black","White"]
  };
};

//product Update//
const updateProduct = async (id, body, files) => {
  const product = await Products.findById(id);
  if (!product) return null;

  product.productName = body.name;
  product.description = body.description;
  product.category = body.category;
  product.brand = body.brand;
 let sizes = [];

if (Array.isArray(body.size)) {
  sizes = body.size.map(s => ({
    size: s,
    price: Number(body.price),
    stock: Number(body.quantity)
  }));
} else if (body.size) {
  sizes = [{
    size: body.size,
    price: Number(body.price),
    stock: Number(body.quantity)
  }];
}
product.variants = sizes.map(item => ({
  size: item.size,
  color: body.color,
  price: item.price,
  stock: item.stock
}));
  if (product.productOffer > 0) {
    const discount = (product.regularPrice * product.productOffer) / 100;
    product.salesPrice = Math.round(product.regularPrice - discount);
  } else {
    product.salesPrice = product.regularPrice;
  }
  let updatedImages = body.existingImages ? body.existingImages.split(',').filter(x => x.trim() !== '') : [];
  if (body.croppedImage) {
    const base64Data = body.croppedImage.replace(/^data:image\/\w+;base64,/, "");
    const uploadDir = path.join(process.cwd(), "public/uploads/productImages");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = Date.now() + ".jpg";
    fs.writeFileSync(path.join(uploadDir, fileName), base64Data, "base64");
    updatedImages.push(fileName);
  } else if (files && files.length > 0) {
    updatedImages = updatedImages.concat(files.map(f => f.filename));
  }
  
  product.productImage = updatedImages;

  return await product.save();
};

//Offer//
const applyOffer = async (id, offer) => {
  const product = await Products.findById(id);
  if (!product) return null;

  const discount = (product.regularPrice * offer) / 100;
  product.productOffer = offer;
  product.salesPrice = Math.round(product.regularPrice - discount);

  return await product.save();
};
//remove Offer//
const removeOfferService = async (id) => {
  const product = await Products.findById(id);
  if (!product) return null;

  product.productOffer = 0;
  product.salesPrice = product.regularPrice;
  return await product.save();
};

//block product//
const blockProductService = async (id) => {
  return await Products.findByIdAndUpdate(
    id,
    { isBlock: true },
    { new: true }
  );
};

//unblock product//
const unblockProductService = async (id) => {
  return await Products.findByIdAndUpdate(
    id,
    { isBlock: false },
    { new: true }
  );
};

//variants//
const loadVariantsService = async (productId) => {
  return await Products.findById(productId);
};

//add variant//
const addVariantService = async (productId, data) => {
  const product = await Products.findById(productId);
  if (!product) return null;

  product.variants.unshift({
    color: data.color,
    size: data.size,
    price: Number(data.price),
    stock: Number(data.stock),
    image: data.image
  });

  return await product.save();
};

//view variants//
const getVariantByIdService = async (productId, variantId) => {
  const product = await Products.findById(productId);
  if (!product) return null;
  const variant = product.variants.id(variantId);
  return { product, variant };
};

//update variant//
const updateVariantService = async (productId, variantId, body, file) => {
  const product = await Products.findById(productId);
  if (!product) return null;

  const variant = product.variants.id(variantId);
  variant.color = body.color;
  variant.size = body.size;
  variant.price = Number(body.price);
  variant.stock = Number(body.stock);
  if (file) variant.image = file.filename;

  return await product.save();
};

//delete variant//
const deleteVariantService = async (productId, variantId) => {
  const product = await Products.findById(productId);
  if (!product) return null;

  product.variants.id(variantId).remove();
  return await product.save();
};
export {
  getProductsPaginated,
  getProductAddPageData,
  createProduct,
  getEditPageData,
  updateProduct,
  applyOffer,
  removeOfferService,
  blockProductService,
  unblockProductService,
  getProductById,  
  loadVariantsService,
  addVariantService,
  getVariantByIdService,
  updateVariantService,
  deleteVariantService
};
