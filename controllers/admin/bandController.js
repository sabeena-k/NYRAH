const Brand = require("../../models/brandSchema");

const brandInfo = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.render("admin/brand", { brands });
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};

const addBrand = async (req, res) => {
  try {
    const { brandName } = req.body;
    if (!brandName) return res.json({ success: false, msg: "Brand name required" });

    const exists = await Brand.findOne({ brandName });
    if (exists) return res.json({ success: false, msg: "Brand already exists" });

    const brand = new Brand({
      brandName,
      brandImage: req.file ? req.file.filename : null
    });

    await brand.save();
    res.json({ success: true, msg: "Brand Added Successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: "Server Error" });
  }
};

const editBrand = async (req, res) => {
  try {
    const { id, brandName } = req.body;
    if (!id || !brandName) return res.json({ success: false, msg: "Invalid data" });

    const updateData = { brandName };
    if (req.file) updateData.brandImage = req.file.filename;

    await Brand.findByIdAndUpdate(id, updateData);
    res.json({ success: true, msg: "Brand Updated Successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: "Server Error" });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.json({ success: false });

    await Brand.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
};

module.exports = { brandInfo, addBrand, editBrand, deleteBrand };
