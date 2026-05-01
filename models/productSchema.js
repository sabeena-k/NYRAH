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
    required: true,
    min:0
   }, 
  stock: {
    type: Number,
    required: true,
    min: 0
  }
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
    validate: {
      validator: function (val) {
        return val.length >= 3;
      },
      message: "Minimum 3 images required"
    }
  },
isNewProduct: {
  type: Boolean,
  default: false
},
status: {
  type: String,
  enum: ["Available", "Out of Stock"],
  default: "Available"
},
 variants: {
    type: [variantSchema],
    validate: {
      validator: function (val) {
        return val.length > 0;
      },
      message: "At least one variant required"
    }
  },

  isBlock: {
     type: Boolean, 
     default: false 
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;