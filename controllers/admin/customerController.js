const User = require('../../models/userSchema');

const customerInfo = async (req, res) => {
  try {
    let search = req.query.search || "";
    let page = parseInt(req.query.page) || 1;
    const limit = 3;

    const query = {
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    };

    const userData = await User.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.render('admin/customers', {
      data: userData,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: search,
    });
  } catch (error) {
    console.log("Customer Error:", error);
    res.redirect("/admin/pageError");
  }
};
const customerBlocked=async(req,res)=>{
  try{
    let id=req.query.id
      await User.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect('/admin/customers');

    }catch(error){
      res.redirect('/admin/pageError')
    }
};
const customerUnBlocked=async (req,res)=>{
  try{
    let id=req.query.id
  await User.updateOne({_id:id},{$set:{isBlocked:false}});
  res.redirect('/admin/customers');
  }catch(error){
    res.redirect('/admin/pageError')
  }
}
module.exports = { customerInfo,customerBlocked,customerUnBlocked };
