import Brand from "../../models/brandSchema.js";

//get brand//
export const getBrands = async () => {
  return await Brand.find();
};

//create brand//
export const createBrand = async (brandName, file) => {
  const brandImage = file ? file.filename : null;

  const newBrand = new Brand({
    brandName,
    brandImage,
    isBlock: false
  });

  await newBrand.save();
  return newBrand;
};

//update brand//
export const updateBrand = async (id, brandName, file) => {
  const brand = await Brand.findById(id);
  if (!brand) throw new Error("Brand not found");

  brand.brandName = brandName || brand.brandName;
  if (file) brand.brandImage = file.filename;

  await brand.save();
  return brand;
}
//delete brand//
export const removeBrand = async (id) => {
  await Brand.findByIdAndDelete(id);
};