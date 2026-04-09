import Brand from "../../models/brandSchema.js";

export const getAllBrands = async () => {
  return await Brand.find({ isBlocked: false });
};