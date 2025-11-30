const mongoose=require('mongoose')
const {Schema}=mongoose;


const productSchema=new Schema({
    productName:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    salesPrice:{
        type:Number,
        required:true
    },
    offers:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number,
        default:true

    },
    color:{
        type:String,
        required:true
    },
    productImage:{
        type:[String],
        required:true
    },
    isBlock:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["Available","Out of Stock","Discountinued"],
        require:true,
        default:"Available"
    },
},{timestamps:true})
const Product=mongoose.model('Product',productSchema)

module.exports=Product
