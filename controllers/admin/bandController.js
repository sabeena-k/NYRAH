const Brand = require("../../models/brandSchema");

const brandInfo = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.render("admin/brand", { brands });
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};

const addBrand = async (req, res) => {
  try {
    const { brandName } = req.body;
    let brandImage = null;

    if (req.file) brandImage = req.file.filename;

    const newBrand = new Brand({
      brandName,
      brandImage,
      isBlocked: false
    });

    await newBrand.save();

    res.json({ status: true, msg: "Brand added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, msg: "Something went wrong" });
  }
};

const editBrand = async (req, res) => {
  try {
    const { id, brandName } = req.body;
    const brand = await Brand.findById(id);
    if (!brand) return res.status(404).json({ msg: "Brand not found" });

    brand.brandName = brandName || brand.brandName;
    if (req.file) brand.brandImage = req.file.filename;

    await brand.save();
    res.json({ status: true, msg: "Brand updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.body;
    await Brand.findByIdAndDelete(id);
    res.json({ status: true, msg: "Brand deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { brandInfo, addBrand, editBrand, deleteBrand };
