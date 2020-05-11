var express=require("express");
var router=express.Router({mergeParams:true});
var campground=require("../models/campground");
var comment=require("../models/comment");
var middleware = require("../middleware/index");

//===================
//COMMENTS ROUTES
//===================
router.get("/campgrounds/:id/comments/new",middleware.isLoggedIn,function(req,res){
    //find campground by id
    campground.findById(req.params.id,function(err,campground){
        if(err)
        {
            console.log(err);
        }
        else{
            res.render("newcomment",{campground:campground});
        }
    });
       
    });
    router.post("/campgrounds/:id/comments/new",middleware.isLoggedIn, function(req,res){
        //looup campground using id
        campground.findById(req.params.id,function(err,campground){
            if(err){
                console.log(err);
                res.redirect("/campgrounds");
            }else{
              //create comment
              comment.create(req.body.comment,function(err,comment){
                  if(err){
                      console.log(err);
                    
                  }
                  else{
                      //add username and id to comment
                      comment.author.id=req.user._id; //in this line we storing loggedin user id and name 
                      comment.author.username=req.user.username;//to comment models
                      //save the comment
                      comment.save()
                      campground.comments.push(comment);
                      campground.save();
                      req.flash("success","Successfully added comment");
                      res.redirect("/campgrounds/"+campground._id);
                  }
              });
            }
        });
    });
    //Edit comments
    router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
        //error handling
        campground.findById(req.params.id,function(err,foundcampground){
            if(err || !foundcampground){
                req.flash("error","Campground not found");
                res.redirect("back");
            }
            comment.findById(req.params.comment_id,function(err,foundcomment){
                if(err)
                {
                    //req.flash("error","Comment not found")
                    res.redirect("back");
                }
                else{
                   res.render("editcomment",{campground_id:req.params.id,comment:foundcomment});
                }
        })
        
         });
       

    });
    //update comment
    router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
        comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
            if(err){
                res.redirect("back");
            }
            else{
                res.redirect("/campgrounds/"+ req.params.id);
            }
        });
    });
      //COMMENT DESTORY ROUTE
      router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
           //findByIdAndRemov
           comment.findByIdAndRemove(req.params.comment_id,function(err){
               if(err){
                   res.redirect("back");
               }
               else{
                      req.flash("success","Comment deleted")
                   res.redirect("/campgrounds/"+req.params.id);
               }
           });
      });
    // function isLoggedIn(req,res,next){
    //     if(req.isAuthenticated()){
    //         return next();
    //     }
    //     res.redirect("/login");
    //    }
       //middleware for owner
// function checkCommentOwnership(req,res,next){
//     if(req.isAuthenticated()){
//         comment.findById(req.params.comment_id,function(err,foundComment){
//             if(err){
//                 console.log(err);
//                 res.redirect("back");
//             }
//             else{
//                  //dose user own the comment?
//                  if(foundComment.author.id.equals(req.user._id)){
//                     next();
//                  } else {
//                       //res.send("YOU DO NOT HAVE PERMISSION TO DO THAT!");
//                       res.redirect("back");
//                  }
                
//             }
//         });
// }
// }
    module.exports=router;