import {
  getCategoriesPaginated,
  createCategory,
  updateCategory,
  deleteCategoryById,
  setCategoryBlockStatus,
  applyCategoryOffer,
  removeCategoryOffer
} from"../../services/admin/categoryServices.js"
const categoryInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const { categories, totalPages } =
      await getCategoriesPaginated(page);

    res.render("admin/category", {
      categories,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.redirect("/admin/pageError");
  }
};
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await createCategory(name, description);

    res.json({ success: true, msg: "Saved Successfully" });
  } catch (err) {
    res.json({ success: false, msg: err.message });
  }
};
const editCategory = async (req, res) => {
  try {
    await updateCategory(req.params.id, req.body.name, req.body.description);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, msg: err.message });
  }
};
const blockCategory = async (req, res) => {
  try {
    await setCategoryBlockStatus(req.params.id, true);
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
};
 const unblockCategory = async (req, res) => {
  try {
    await setCategoryBlockStatus(req.params.id, false);
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
};
 const deleteCategory = async (req, res) => {
  try {
    await deleteCategoryById(req.body.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, msg: err.message });
  }
};
 const addCatOffer = async (req, res) => {
  try {
    await applyCategoryOffer(req.params.id, req.body.discount);
    res.json({ success: true, msg: "Offer applied" });
  } catch (err) {
    res.json({ success: false, msg: err.message });
  }
};
const removeCatOffer = async (req, res) => {
  try {
    await removeCategoryOffer(req.params.id);
    res.json({ success: true, msg: "Offer removed" });
  } catch (err) {
    res.json({ success: false, msg: err.message });
  }
};
export {
  categoryInfo,
  addCategory,
  editCategory,
  blockCategory,
  unblockCategory,
  deleteCategory,
  addCatOffer,
  removeCatOffer}