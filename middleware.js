module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","Please LogIn Or SignUp First");
        return res.redirect("/notes/login");
    }
    next();
}

module.exports.ensureAuthenticated=(req,res,next)=>{
    if(req.isAuthenticated()){
        return res.redirect("/notes/show");
    }
    return next();
}