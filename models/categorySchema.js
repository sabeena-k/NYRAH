const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
       
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
    },
    isBlocked: {
    type: Boolean,
    default: false
}
});

module.exports = mongoose.model("Category", categorySchema);