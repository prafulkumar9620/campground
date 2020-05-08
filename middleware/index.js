var campground=require("../models/campground");
var comment=require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership= function(req,res,next) {
       
    
        if(req.isAuthenticated()){
            campground.findById(req.params.id,function(err,foundCampground){
                if(err){
                    req.flash("error","Campground not found");
                    res.redirect("back");
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
            if(err){
                console.log(err);
                res.redirect("back");
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
    req.flash("error","You need be logged in to do that");
   res.redirect("/login");
  }

  module.exports=middlewareObj;