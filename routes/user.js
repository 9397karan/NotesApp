const express=require("express");
const router=express.Router();
const User=require("../models/user")
const passport=require("passport");
const Wrap = require("../views/utils/Wrap");
const { ensureAuthenticated } = require("../middleware");



router.get("/register",(req,res)=>{
    res.render("./pages/register.ejs");
})

router.post("/register",Wrap(async(req,res,next)=>{
    try{
        let {username,email,password}=req.body;
    let newUser=await new User({
        username,email
    });
    const save=await User.register(newUser,password);
    console.log(newUser);
    req.login(save,(err)=>{
        if(err){
            next(err);
        } 
        req.flash("success",`${newUser.username} has registered successfully`);
        res.redirect("/notes/show");
    })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/notes/register");
    }
}))
router.get("/login",ensureAuthenticated,(req,res)=>{
    res.render("./pages/login.ejs");
})
router.post("/login",  passport.authenticate('local', { failureRedirect: '/notes/login',failureFlash: true, }),async(req,res,next)=>{
    const {username}=req.user;
    req.flash("success",`Welcome back ${username}...`);
    res.redirect("/notes/show");
})

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/notes");
  });
});


module.exports=router;