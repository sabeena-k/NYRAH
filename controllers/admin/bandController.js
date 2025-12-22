import  {getBrands,createBrand,updateBrand,removeBrand} from"../../services/admin/brandServices.js"

const brandInfo = async (req, res) => {
  try {
    const brands = await getBrands();
    res.render("admin/brand", { brands });
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};
const addBrand = async (req, res) => {
  try {
    const { brandName } = req.body;
    await createBrand(brandName, req.file);

    res.json({ status: true, msg: "Brand added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, msg: err.message || "Something went wrong" });
  }
};
const editBrand = async (req, res) => {
  try {
    const { id, brandName } = req.body;
    await updateBrand(id, brandName, req.file);

    res.json({ status: true, msg: "Brand updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, msg: err.message || "Server error" });
  }
};
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.body;
    await removeBrand(id);
    res.json({ status: true, msg: "Brand deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};
export{ brandInfo, addBrand, editBrand, deleteBrand }
