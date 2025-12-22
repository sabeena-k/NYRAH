import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    rollNo: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },categoryOffer: {
    type: Number,
    default: 0  
  },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Category = mongoose.model("Category", categorySchema);
export default Category;