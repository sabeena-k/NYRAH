

const userAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/signin');
    }
    next();
};

const adminAuth = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
};
         export{userAuth,adminAuth}