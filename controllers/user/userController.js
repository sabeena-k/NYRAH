
const User = require("../../models/userSchema");


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
        if (!req.session.user) {
            return res.redirect('/signin');  
        }

        const user = await User.findById(req.session.user);
        if (!user) {
            req.session.user = null;
            return res.redirect('/signin');
        }

        res.render('user/home', { user }); 
    } catch (error) {
        console.error('Error loading home page', error);
        res.status(500).send('Server Error');
    }
};




module.exports={
    loadStartPage,
    loadHomePage,
    pageNotFound,
    
}