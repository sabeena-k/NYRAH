const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["productType", "brand", "size", "color"]
    },
    name: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Category", categorySchema);