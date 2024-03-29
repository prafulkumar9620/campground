require("dotenv").config();

var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStratergy = require("passport-local");
var methodOverride = require("method-override");
var campground = require("./models/campground");
var user = require("./models/user");
var comment = require("./models/comment");
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campground");
var indexRoutes = require("./routes/index");

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.locals.moment = require("moment");

app.use(function (req, res, next) {
    res.locals.currentuser = req.user; //req.user contain currently login id
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();               //res.locals this property give one local variable that variable can accesse any 
});                      //where in this app i.e in ejs as well as js file

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: false, useUnifiedTopology: true }).then(() => {

    app.listen(3001, function (res, req) {
        console.log("web server started on port: 3001");
    });

}).catch((error) => {
    console.log(error)
});
