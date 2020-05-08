var express = require("express");
var app = express();
var bodyparser= require("body-parser");
var mongoose=require("mongoose");
var passport =require("passport");
var LocalStratergy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var campground=require("./models/campground");
var user =require("./models/user");
var seedDB=require("./seeds");

var comment=require("./models/comment");
//var user=require("./models/user");
//mongoose.pluralize(null);
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campground");
var indexRoutes = require("./routes/index");
mongoose.connect("mongodb://localhost/yelp_campground", {useNewUrlParser: true,useUnifiedTopology: true });

app.use(bodyparser.urlencoded({extended: true}));

app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
seedDB();
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"Rusty is the best and cutest dog in the world",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentuser=req.user; //req.user contain currently login id
    next();
});

app.get("/",function(req,res){
    res.render("landing");
});

app.get("/campgrounds",function(req,res){

    //Get all campgrounds from database
campground.find({},function(err,allcampgrounds){
        if(err) {
            console.log(err);
        }else{
           res.render("index",{campgrounds:allcampgrounds});
    }
});
   
});

app.get("/campgrounds/new",function(req,res) {

    res.render("new");


});

app.get("/campgrounds/:id",function(req,res){
    //find the campground with provided id
    //render show template with that campground
    campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log(err);
        }
        else{
            console.log(foundCampground);
            res.render("show",{campground:foundCampground});
        }
    });

});





app.post("/campgrounds",function(req,res){
    
     //get data from form and add to campground array
     //redirect back to campground page
     var name = req.body.name;
     var image = req.body.image;
     var des=req.body.desc;
     var newcampground={name:name,image:image,description:des};
  //create a new campground and save to the databse
  campground.create(newcampground,function(err,newlyCreated){
    if(err) {
        console.log(err);
    }else{
        //redirect back to campgrounds page
       res.redirect("/campgrounds");
}
  });
     
});
//===================
//COMMENTS ROUTES
//===================
app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
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
app.post("/campgrounds/:id/comments/new",isLoggedIn, function(req,res){
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
                  campground.comments.push(comment);
                  campground.save();
                  res.redirect("/campgrounds/"+campground._id);
              }
          });
        }
    });
});
//============
//AUTH ROUTes
//=========
//show register form
app.get("/register",function(req,res){
    res.render("register");
});
//handling user sign up
app.post("/register",function(req,res){
    req.body.username
    req.body.password
    user.register(new user({username:req.body.username}),req.body.password,function(err,user){
         if(err){
             console.log(err);
         }    
         passport.authenticate("local")(req,res,function(){
             res.redirect("/campgrounds");
         })
 
    });
 });
 //LOGIN ROUTES
//render login form
app.get("/login",function(req,res){
    res.render("login");
});
 //login logic
//middleware
app.post("/Login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"

}),function(req,res) {
});

app.get("/logout",function(req,res){
        req.logOut();
        res.redirect("/"); 

});
//logic logout
app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/campgrounds"); 

});

function isLoggedIn(req,res,next){
 if(req.isAuthenticated()){
     return next();
 }
 res.redirect("/login");
}


app.listen(3000,function(res,req){
    console.log("start");

});