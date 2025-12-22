import express from 'express'
const app = express();
import path from'path'
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import session from 'express-session'
import dotenv from 'dotenv'
import passport from'./config/passport.js'
import db from"./config/db.js"

import userRouter from'./routes/userRoute.js'
import authRouter from'./routes/authRoute.js'
import adminRouter from'./routes/adminRoute.js'
import { pageNotFound } from'./controllers/user/userController.js'


db();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



   
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next()
});


app.use(passport.initialize());
app.use(passport.session());


app.use('/', authRouter); 
app.use('/', userRouter); 
app.use('/admin', adminRouter); 

app.use(pageNotFound);  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export { app };
