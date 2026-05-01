import Product from "../../models/productSchema.js";

//product//
export const getProducts = async (filter, sortOption = {}, skip = 0, limit = 0) => {
  return await Product.find(filter)
    .populate("category")
    .populate("brand")
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();
};

// Count products//
export const countProducts = async (filter) => {
  return await Product.countDocuments({ ...filter});
};

//view new collections//
export const getNewCollections = async (limit = 8) => {
  return await Product.find({ isBlock: false })
    .sort({ createdAt: -1 }) // latest
    .limit(limit)
    .lean();
};
// Get product by ID//
export const getProductById = async (productId) => {
  return await Product.findById(productId)
    .populate("category")
    .populate("brand")
    .lean();
    

};
export const getSizes = async () => {
  return await Product.distinct("variants.size");
};

export const getColors = async () => {
  return await Product.distinct("variants.color");
};
// Get related products by category//
export const getRelatedProducts = async (categoryId, currentProductId) => {
  return await Product.find({
    _id: { $ne: currentProductId },
    category: categoryId
  })
  .populate("category")
  .populate("brand")
  .limit(4)
  .lean();
};

// Products by category//
export const productByCategory = async (categoryId) => {
  let filter = {};
  if (categoryId) filter.category = categoryId;
  return await Product.find(filter)
    .populate("category")
    .populate("brand")
    .sort({ createdAt: -1 })
    .lean();
};export const getOneProductPerCategory = async () => {
   const products = await Product.aggregate([
    { $match: { isBlock: false } },
    { $sort: { createdAt: -1 } },

    {
      $group: {
        _id: "$category",
        product: { $first: "$$ROOT" }
      }
    }
  ]);

  return products;
};

// Search products by name//
export const searchProduct = async (query, limit = 4) => {
  const regex = new RegExp(query, "i");
  return await Product.find({ productName: regex})
    .limit(limit)
    .populate("category")
    .populate("brand")
    .lean();
};