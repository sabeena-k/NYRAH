import mongoose from"mongoose"

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        productName: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Paypal"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing"
    },

    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
      state: String
    }
  },
  {
    timestamps: true 
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;