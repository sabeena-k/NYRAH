import Category from "../../models/categorySchema.js";
import Products from "../../models/productSchema.js";

export const getCategoriesPaginated = async (page, limit = 4) => {
  const skip = (page - 1) * limit;

  const totalCount = await Category.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  const categories = await Category.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return { categories, totalPages };
};

export const createCategory = async (name, description,image) => {
  if (!name || !description) {
    throw new Error("Name and Description are required");
  }

  const exists = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" }
  });

  if (exists) throw new Error("Category already exists");

  const lastCategory = await Category
    .findOne()
    .sort({ rollNo: -1 });
     const rollNo = lastCategory ? lastCategory.rollNo + 1 : 1;

  const newItem = new Category({ name, description,image,rollNo });
  await newItem.save();

  return true;
};
export const updateCategory = async (id, name, description) => {
  if (!id || !name || !description) {
    throw new Error("Invalid data");
  }

  await Category.findByIdAndUpdate(id, { name, description });
};

export const setCategoryBlockStatus = async (id, status) => {
  await Category.findByIdAndUpdate(id, { isBlocked: status });
};
export const deleteCategoryById = async (id) => {
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new Error("Category not found");
};

export const applyCategoryOffer = async (categoryId, discount) => {
  if (discount <= 0 || discount >= 90) {
    throw new Error("Invalid discount");
  }

  await Category.findByIdAndUpdate(categoryId, {
    categoryOffer: discount
  });

  const products = await Products.find({ category: categoryId });

  for (let product of products) {
    const categoryDiscount = (product.regularPrice * discount) / 100;
    const finalPrice = product.regularPrice - categoryDiscount;

    if (finalPrice < product.regularPrice) {
      product.salesPrice = Math.round(finalPrice);
      product.productOffer = discount;
      await product.save();
    }
  }
};

export const removeCategoryOffer = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new Error("Category not found");

  category.categoryOffer = 0;
  await category.save();
};