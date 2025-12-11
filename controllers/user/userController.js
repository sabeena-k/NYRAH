
const User = require("../../models/userSchema");
const Product=require("../../models/productSchema")


const pageNotFound = (req, res) => {
    res.status(404).render('user/404'); 
};


const loadStartPage=async(req,res)=>{
    try{
        if(req.session&&req.session.user){
            return res.redirect("/home")
        }
        return res.render("user/start",{user:null});
    }catch(error){
        console.log('Error on loading')
        res.status(500).send('Server Error')
    }
};

const loadHomePage = async (req, res) => {
    try {
        let user = null;

        if (req.session.user) {
           
            user = await User.findById(req.session.user);
        }

        return res.render("user/home", { user });

    } catch (error) {
        console.log("Error loading home page:", error.message);
        res.status(500).send("Server Error");
    }
};

const about=async(req,res)=>{
    res.render('user/about');
}
const contact=async(req,res)=>{
    res.render('user/contact');
}
const loadProduct = async (req, res) => {
  try {
    const user = await User.findById(req.session.user);

    // Get the page number from query, default = 1
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // products per page
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find().skip(skip).limit(limit);

    res.render("user/AllProducts", { 
      user, 
      products,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.log("Error in loadProduct:", err);
    res.status(500).send("Internal Server Error");
  }
};


module.exports={
    loadStartPage,
    loadHomePage,
    pageNotFound,
    about,contact,loadProduct
    
}