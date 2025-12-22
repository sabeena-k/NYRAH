import Brand from "../../models/brandSchema.js";
export const getBrands = async () => {
  return await Brand.find();
};
export const createBrand = async (brandName, file) => {
  const brandImage = file ? file.filename : null;

  const newBrand = new Brand({
    brandName,
    brandImage,
    isBlocked: false
  });

  await newBrand.save();
  return newBrand;
};
export const updateBrand = async (id, brandName, file) => {
  const brand = await Brand.findById(id);
  if (!brand) throw new Error("Brand not found");

  brand.brandName = brandName || brand.brandName;
  if (file) brand.brandImage = file.filename;

  await brand.save();
  return brand;
}
  export const removeBrand = async (id) => {
  await Brand.findByIdAndDelete(id);
};