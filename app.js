require("dotenv").config();
var express = require("express");
var app = express();
var bodyparser= require("body-parser");
var mongoose=require("mongoose");
var flash = require("connect-flash");
var passport =require("passport");
var LocalStratergy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride = require("method-override");
var campground=require("./models/campground");
var user =require("./models/user");
//var seedDB=require("./seeds");

var comment=require("./models/comment");
var user=require("./models/user");
//mongoose.pluralize(null);
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campground");
var indexRoutes = require("./routes/index");
mongoose.connect("mongodb://localhost:27017/yelp_campground", {useNewUrlParser: true,useUnifiedTopology: true });

app.use(bodyparser.urlencoded({extended: true}));

app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();
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
app.locals.moment=require("moment");

app.use(function(req,res,next){
    res.locals.currentuser=req.user; //req.user contain currently login id
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    
    next();               //res.locals this property give one local variable that variable can accesse any 
});                      //where in this app i.e in ejs as well as js file

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);

app.listen(3000,function(res,req){
    console.log("start");

});
