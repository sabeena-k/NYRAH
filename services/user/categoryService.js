import Category from "../../models/categorySchema.js";

//category//

export const getAllCategories = async () => {
    return await Category.find({isBlock:false})
    .sort({ createdAt: -1 })
};

//load category home//
export const homeCategories = async () => {
  return await Category.find({ isBlock: false })
  .sort({ createdAt: -1 })
  .limit(4);

};