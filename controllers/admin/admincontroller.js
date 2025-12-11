const User=require('../../models/userSchema')
const bcrypt=require('bcrypt')
const env=require('dotenv').config()
const mongoose=require('mongoose')


const pageerror=async(req,res)=>{
    res.render('admin/pageError')
}

const loadLogin=async(req,res)=>{
    try{
        if(req.session.admin){
            return res.redirect('/admin/dashboard')
        }
        res.render('admin/login',{message:null})
    }catch(error){

    }
}

const login=async(req,res)=>{
  try{
    const {email,password}=req.body;
    const admin=await User.findOne({email,isAdmin:true})
    if(admin){
        const passwordMatch=await bcrypt.compare(password,admin.password)
        if(passwordMatch){
            req.session.admin=true
            return res.redirect('/admin')
        }else{
            return res.redirect('/login')
        }
    }else{
        return res.redirect('/login')
    }

  }catch(error){
   console.log('Login Filed',error);
   return res.redirect('/pageError')
  }
}
const loadDashBoard = async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin/login'); 
        }
        return res.render('admin/dashboard',{page:'dashboard'}); 
    
    } catch (error) {
        console.log(error);
        return res.redirect('/pageError');
    }
};
const logout=async(req,res)=>{
    try{
        req.session.admin=null
        req.session.destroy(err=>{
            if(err){
                console.log('Error distroying',err)
                return res.redirect('/pageError')
            }
            res.redirect('/admin/login')
        })
    }catch(error){
        console.log('Unexpecterd error happed',error)
        res.redirect('/pageError')
    }
}


module.exports={
    loadLogin,login,loadDashBoard,pageerror,logout}