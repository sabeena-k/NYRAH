import Category from "../../models/categorySchema.js";

export const getAllCategories = async () => {
    return await Category.find({isBlock:false})
    .sort({ createdAt: -1 })
};
export const homeCategories = async () => {
  return await Category.find({ isBlock: false })
  .sort({ createdAt: -1 })
  .limit(4);

};