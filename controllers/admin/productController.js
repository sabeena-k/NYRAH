import {
  getProductsPaginated,
  getProductAddPageData,
  createProduct,
  getEditPageData,
  updateProduct,
  applyOffer,
  removeOfferService,
  deleteProduct,
  getProductById,loadVariantsService,
  addVariantService,
  getVariantByIdService,
  updateVariantService,
  deleteVariantService
} from "../../services/admin/productServices.js"
import Category from "../../models/categorySchema.js";
import Brand from "../../models/brandSchema.js";

const productInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
     const search=req.query.search||"";
    const filters = {
      category: req.query.category || "",
      brand: req.query.brand || "",
      status: req.query.status || ""
    };
const { products, totalPages } = await getProductsPaginated(page, limit, filters);

  const categories = await Category.find();
  const brands = await Brand.find();

    res.render("admin/products", {
      products,
      currentPage: page,
      totalPages,search,filters,categories,brands
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
 const loadProductVariants = async (req, res) => {
  const product = await getProductById(req.params.id);
  res.render("admin/ProductVariants", { product });
};
const addVariant = async (req, res) => {
  try {
    const { color, size, price, stock } = req.body;
    await addVariantService(req.params.id, {
      color,
      size,
      price,
      stock,
      image: req.file?.filename
    });
    res.redirect(`/admin/productVariants/${req.params.id}`);
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};
const editVariantPage = async (req, res) => {
  const { product, variant } = await getVariantByIdService(req.params.productId, req.params.variantId);
  res.render("admin/EditVariant", { product, variant });
};
const updateVariant = async (req, res) => {
  try {
    await updateVariantService(req.params.productId, req.params.variantId, req.body, req.file);
    res.redirect(`/admin/productVariants/${req.params.productId}`);
  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageError");
  }
};
const deleteVariant = async (req, res) => {
  try {
    await deleteVariantService(req.params.productId, req.params.variantId);
    res.redirect(`/admin/productVariants/${req.params.productId}`);
  } catch (err) {
    console.log(err);
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
  productDelete,loadProductVariants,
  addVariant,
  editVariantPage,
  updateVariant,
  deleteVariant
};