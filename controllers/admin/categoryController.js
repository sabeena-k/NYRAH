const Category = require("../../models/categorySchema");

const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 
        const skip = (page - 1) * limit;

        const totalCount = await Category.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);

        const categories = await Category.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

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
        let { type, name, stock } = req.body;

        if (!type || !name) {
            return res.json({ success: false, msg: "Type and Name are required" });
        }

        stock = Number(stock) || 0; 

        const exists = await Category.findOne({
            type,
            name: { $regex: `^${name}$`, $options: "i" }
        });

        if (exists) return res.json({ success: false, msg: "Category already exists" });

        const newItem = new Category({ type, name, stock });
        await newItem.save();

        res.json({ success: true, msg: "Saved Successfully" });

    } catch (err) {
        console.error("Add Category Error:", err); 
        res.json({ success: false, msg: "Something went wrong" });
    }
};

const editCategory = async (req, res) => {
    try {
        const { name, stock } = req.body;
        const id = req.params.id;

        if (!id || !name || isNaN(stock)) {
            return res.status(400).json({ success: false, msg: "Invalid data" });
        }

        await Category.findByIdAndUpdate(id, { name, stock });
        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, msg: "Update failed" });
    }
};

const blockCategory = async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, { isBlocked: true });
        res.json({ success: true, msg: "Blocked" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, msg: "Block failed" });
    }
};

const unblockCategory = async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, { isBlocked: false });
        res.json({ success: true, msg: "Unblocked" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, msg: "Unblock failed" });
    }
};
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        console.log("Delete request received for ID:", id);

        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            console.log("Category not found");
            return res.json({ success: false, msg: "Category not found" });
        }

        console.log("Deleted successfully");
        return res.json({ success: true });

    } catch (err) {
        console.log("DELETE ERROR:", err);
        return res.json({ success: false, msg: "Server error" });
    }
};



module.exports = { 
    categoryInfo, 
    addCategory, 
    editCategory, 
    deleteCategory,
    blockCategory,
    unblockCategory,
    
};

