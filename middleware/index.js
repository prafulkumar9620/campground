var campground=require("../models/campground");
var comment=require("../models/comment");
var user = require("../models/user")

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership= function(req,res,next) {
       
    
        if(req.isAuthenticated()){
            campground.findById(req.params.id,function(err,foundCampground){
                if(err || !foundCampground){
                    req.flash("error","Campground not found");
                    res.redirect("/campgrounds");
                }
                else{
                     //dose user own the campground?
                     if(foundCampground.author.id.equals(req.user._id) ||  req.user.isAdmin){
                        next();
                     } else {
                          //res.send("YOU DO NOT HAVE PERMISSION TO DO THAT!");
                          req.flash("error","YOU DO NOT HAVE PERMISSION TO DO THAT");
                          res.redirect("back");
                     }
                    
                }
            });
    }
    else{
        req.flash("error","You need to be logged in to da that");
        res.redirect("back");
    }
    }




middlewareObj.checkCommentOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id,function(err,foundComment){
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("/campgrounds");
                console.log(err);
                
            }
            else{
                 //dose user own the comment?
                 if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                 } else {
                      //res.send("YOU DO NOT HAVE PERMISSION TO DO THAT!");
                      req.flash("error","YOU DO NOT HAVE PERMISSION TO DO THAT");
                      res.redirect("back");
                 }
                
            }
        });
}
else{
    req.flash("error","You need to be logged in to da that");
    res.redirect("back");
}
}
 middlewareObj.isLoggedIn=function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    if(req['headers']['content-type'] === 'application/json') {
        return res.send({ error: 'Login required' });
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
  
  }
  middlewareObj.isPaid = function(req, res, next){
    if (req.user.isPaid) return next();
    req.flash("error", "Please pay registration fee before continuing");
    res.redirect("/checkout");
}
//middeleware for email verifiaction
 middlewareObj.isNotVerifide = async function(req,res,next)
 {
     try{
      const ser = await user.findOne({username:req.body.username})
      if(ser.isverified){
          return next();
      }
      req.flash("error","your account has not been verified please check your email to verify your account");
      return res.redirect("/");
     }catch(error){
        console.log(error);
        req.flash("error","something went wrong");
        res.redirect("/");
     }
 } 
  module.exports=middlewareObj;