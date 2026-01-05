import Product from "../../models/productSchema.js";  


export const getProducts = async (filter, skip, limit) => {
    return await Product.find({...filter,isBlock:false})
    .populate("category")
    .populate("brand")
    .sort({ createdAt: -1 })
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
export const searchProduct=async(query, limit = 10)=>{
   const regex = new RegExp(query, "i"); 
   return await Product.find({ 
      productName: regex, 
      isBlock: false 
    })
    .limit(limit);
}
export const getRelatedProducts = async (categoryId, productId) => {
  return await Product.find({
    category: categoryId,
    _id: { $ne: productId },
    isBlock: false
  })
  .populate("category")
  .populate("brand")
  .limit(4);
};
export const productByCategory=async(categoryId)=>{
  let filter={
   isBlock:false
  };
  if(categoryId){
    filter.category=categoryId;
  }
  return await Product.find(filter)
  .populate("category")
  .populate("brand")
  .sort({createdAt:-1 })
  .limit(limit);
};