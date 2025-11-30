let express=require('express')
const app=express()
const session=require("express-session")
const path=require('path')
const PORT = process.env.PORT || 3000
const env=require('dotenv').config();
const passport=require('./config/passport')
const db=require("./config/db")
const userRouter=require('./routes/userRoute')
const adminRouter=require('./routes/adminRoute')
const { pageNotFound } = require('./controllers/user/userController');
const authRouter=require('./routes/authRoute')
db();

app.use(express.json());
app.use(express.urlencoded({extended:true}))



app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/',userRouter)
app.use('/',authRouter)
app.use('/admin',adminRouter)
app.use(pageNotFound);

app.listen(PORT,()=>console.log('server started'))



module.exports=app;