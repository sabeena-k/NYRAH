import mongoose from 'mongoose';
const { Schema } = mongoose;

const variantSchema = new Schema({
  size: {
     type: String,
      required: true 
    },
  color: {
     type: String,
      required: true 
    },
  price: {
     type: Number, 
     required: true
     },
  stock: {
     type: Number, 
     default: 0 
    },
  image: String
});

const productSchema = new Schema({
  productName: {
     type: String,
      required: true 
    },
  productId: {
     type: String, 
     unique: true 
    },
  description: {
     type: String, 
     required: true
     },
  brand: {
     type: Schema.Types.ObjectId, 
     ref: "Brand", 
     required: true 
    },
  category: {
     type: Schema.Types.ObjectId,
      ref: "Category",
       required: true 
      },
  regularPrice: {
     type: Number,
      required: true 
    },
  salesPrice: { 
    type: Number,
     required: true 
    },
  productOffer: {
     type: Number, 
     default: 0
     },
  productImage: { 
    type: [String],
     default: [] 
    },
  variants: [
    variantSchema
  ],
  quantity: { 
    type: Number,
     default: 0 
    },
  isNewProduct: { 
    type: Boolean, 
    default: false 
  },
  isBlock: {
     type: Boolean, 
     default: false 
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;