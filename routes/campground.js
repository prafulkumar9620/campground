
var express=require("express");
var router=express.Router();
var campground=require("../models/campground");
//var middleware=require("../middleware/index");
let { checkCampgroundOwnership, isLoggedIn, isPaid } = require("../middleware/index");
router.use(isLoggedIn, isPaid);


var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'ddhvsx34b', 
  api_key: '678614431773632', 
  api_secret: 'pYjA0nqBGPGv82vHi5kXwsszB64'
});

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});

router.get("/campgrounds",function(req,res){

    //Get all campgrounds from database
campground.find({},function(err,allcampgrounds){
        if(err) {
            console.log(err);
        }else{
           res.render("index",{campgrounds:allcampgrounds});
    }
});
   
});

router.get("/campgrounds/new",function(req,res) {

    res.render("new");


});

router.get("/campgrounds/:id",function(req,res){
    //find the campground with provided id
    //render show template with that campground
    campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err || !foundCampground){
          req.flash("error","Campground not found");
          res.redirect("/campgrounds");
            console.log(err);
        }
        else{
            console.log(foundCampground);
            res.render("show",{campground:foundCampground});
        }
    });

});


router.post("/campgrounds",  upload.single('image'), function(req, res) {
 
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
       // console.log("put");
        req.flash('error', err.message);
        return res.redirect('back');
      }
      console.log("put correct");
      //console.log(result);
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageID = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});

     

//EDIT Campground routr
router.get("/campgrounds/:id/edit", checkCampgroundOwnership,function(req,res){
   
        campground.findById(req.params.id,function(err,foundCampground) {
           
           
                    res.render("edit",{campground:foundCampground});
                 
            
        });  
});
// router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req,res){
//     //find and update the correct campground
//     campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedcampground){
//        if(err){
//              console.log(err);
//        }
//        else
//        {
//            res.redirect("/campgrounds/"+req.params.id);
//        }
//     });
// });

//image upload
router.put("/campgrounds/:id", upload.single('image'), function(req, res){
  console.log("put");
    campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageID);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  console.log("my public");
                  console.log( result.public_id);
                  campground.imageID = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
//destroy campgrount route
// router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
//     campground.findOneAndRemove(req.params.id,function(err){
//         if(err) {
//             console.log(err);
//         }
//         else{
//             res.redirect("/campgrounds");
//         }
//     });
// });

//image destroy
router.delete('/campgrounds/:id',checkCampgroundOwnership, function(req, res) {
    campground.findById(req.params.id, async function(err, campground) {
      if(err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      try {
          await cloudinary.v2.uploader.destroy(campground.imageID);
          campground.remove();
          req.flash('success', 'Campground deleted successfully!');
          res.redirect('/campgrounds');
      } catch(err) {
          if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
      }
    });
  });

//middleware
//  function isLoggedIn(req,res,next){
//      if(req.isAuthenticated()){
//          return next();
//      }
//     res.redirect("/login");
//    }
//middleware for owner
// function checkCampgroundOwnership(req,res,next){
//     if(req.isAuthenticated()){
//         campground.findById(req.params.id,function(err,foundCampground){
//             if(err){
//                 console.log(err);
//                 res.redirect("back");
//             }
//             else{
//                  //dose user own the campground?
//                  if(foundCampground.author.id.equals(req.user._id)){
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