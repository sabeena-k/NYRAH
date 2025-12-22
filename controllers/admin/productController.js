import {
  getProductsPaginated,
  getProductAddPageData,
  createProduct,
  getEditPageData,
  updateProduct,
  applyOffer,
  removeOfferService,
  deleteProduct
} from "../../services/admin/productServices.js"

const productInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const { products, totalPages } =
      await getProductsPaginated(page, limit);

    res.render("admin/products", {
      products,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};
const productAddPage = async (req, res) => {
  try {
    const data = await getProductAddPageData();
    res.render("admin/productAdd", data);
  } catch (error) {
    console.log(error);
    res.redirect("/admin/pageError");
  }
};
const productAdd = async (req, res) => {
  try {
    await createProduct(req.body, req.files);
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};

const productEditPage = async (req, res) => {
  try {
    const data = await getEditPageData(req.params.id);
    if (!data.product) return res.redirect("/admin/products");
    res.render("admin/productEdit", data);
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};

const productEdit = async (req, res) => {
  try {
    await updateProduct(req.params.id, req.body, req.files);
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};
const addOffer = async (req, res) => {
  try {
    const offer = Number(req.body.offer);
    if (offer <= 0 || offer >= 100) {
      return res.status(400).json({ success: false });
    }

    const product = await applyOffer(req.params.id, offer);
    if (!product) return res.status(404).json({ success: false });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

const removeOffer = async (req, res) => {
  try {
    const product = await removeOfferService(req.params.id);
    if (!product) return res.status(404).json({ success: false });
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

const productDelete = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/pageError");
  }
};

export {
  productInfo,
  productAddPage,
  productAdd,
  productEditPage,
  productEdit,
  addOffer,
  removeOffer,
  productDelete
};