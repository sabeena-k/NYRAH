const Category = require("../../models/categorySchema");

// Show table
const categoryInfo = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render("admin/category", { categories });
    } catch (err) {
        console.log(err);
        res.redirect("/admin/pageError");
    }
};

// Add
const addCategory= async (req, res) => {
    try {
        console.log("BODY RECEIVED:", req.body);  // debug

        const { type, name, stock } = req.body;

        if (!type || !name) {
            return res.json({ success: false, msg: "Required fields missing" });
        }

        const newItem = new Category({
            type,
            name,
            stock: stock || 0
        });

        await newItem.save();

        res.json({ success: true, msg: "Saved Successfully" });

    } catch (err) {
        console.log(err);
        res.json({ success: false, msg: "Server Error" });
    }
};



const editCategory = async (req, res) => {
    try {
        const { id, name, stock } = req.body;
        await Category.findByIdAndUpdate(id, { name, stock });
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
};

module.exports = { categoryInfo, addCategory, editCategory, deleteCategory };
