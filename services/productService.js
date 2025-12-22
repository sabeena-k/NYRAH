import Product from "../models/productSchema.js";  


export const getProducts = async (filter, skip, limit) => {
    return await Product.find(filter)
    .populate("category")
    .populate("brand")
    .skip(skip)
    .limit(limit);
}
export const countProducts = async (filter) => {
    return await Product.countDocuments(filter);
}
export const getProductById = async (productId) => {
    return await Product.findById(productId)
    .populate("category")
    .populate("brand");
}

export const getRelatedProducts = async (categoryId, productId) => {
  return await Product.find({
    category: categoryId,
    _id: { $ne: productId },
    isBlocked: false
  })
  .populate("category")
  .populate("brand")
  .limit(4);
};