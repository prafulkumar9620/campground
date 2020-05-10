var express=require("express");
var router=express.Router();
var passport=require("passport");
var user=require("../models/user");
var async = require("async");         //reset password
var nodemailer = require("nodemailer");  //reset password
var crypto = require("crypto");  
var hash = crypto.createHash('md5');          //reset password
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY );



router.get("/",function(req,res){
    res.render("landing");
});
//============
//AUTH ROUTes
//=========
//show register form
// router.get("/register",function(req,res){
//     res.render("register");
// });
router.get("/register", function(req, res){
    res.render("register", {page: 'register'}); 
 });
//handling user sign up
router.post("/register",function(req,res){
    req.body.username
    req.body.password
    var newUser=new user({username:req.body.username,email:req.body.email});
       //Admin
    if(req.body.adminCode === 'secretcode123' ) {
        newUser.isAdmin = true;

    }
   
    
    
   // user.register(new user({username:req.body.username}),req.body.password,function(err,user){
        user.register(newUser,req.body.password,function(err,user){
         if(err){
             console.log(err);
             req.flash("error",err.message);
              res.redirect("/register");
             console.log(err);
         }    

         passport.authenticate("local")(req,res,function(){
             req.flash("success","Welcome to YelpCamp"+ req.body.username);
             res.redirect("/campgrounds");
         });
 
    });

 });
 //LOGIN ROUTES
//render login form
// router.get("/login",function(req,res){
//     res.render("login");
// });
//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'}); 
 });
 //login logic
//middleware
router.post("/Login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"

}),function(req,res) {
});

// router.get("/logout",function(req,res){
//         req.logOut();
//         res.redirect("/"); 

// });
//logic logout
router.get("/logout",function(req,res){
    req.logOut();
    req.flash("success","Logged you out!");
    res.redirect("/campgrounds"); 

});

// forgot password
router.get("/forgot", function(req, res) {
    res.render('forgot');
  });

  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        user.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'yelpcamppraful2@gmail.com',
            pass: 'yelpcamp@2069'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'yelpcamppraful2@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }
        smtpTransport.sendMail(mailOptions, function(err) {
         
          
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          console.log('mail sent');
          console.log(user.email);

         // console.log('Email sent' + info.res);
          //console.log(smtpTransport);
         // done(err, 'done');
         res.redirect('/forgot');
          //}
      });
    }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  
  router.get('/reset/:token', function(req, res) {
    user.findOne({ resetPasswordToken: req.params.token ,resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
         console.log(req.params.token);
        // console.log(user.password );
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
       res.render("reset",{token:req.params.token} );
      
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user,next) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          
    if(req.body.password === req.body.confirm) {
      user.setPassword(req.body.password, function(err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      })
    } else {
        req.flash("error", "Passwords do not match.");
        return res.redirect('back');
    }
  });
},
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'yelpcamppraful2@gmail.com',
            pass: 'yelpcamp@2069'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'yelpcamppraful2@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campgrounds');
    });
  });

function isLoggedIn(req,res,next){
 if(req.isAuthenticated()){
     return next();
 }
 res.redirect("/login");
}
//checkout
router.get('/checkout', async (req, res) => {
    try{
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1099,
            currency: 'usd',
            // Verify your integration in this guide by including this parameter
            metadata: {integration_check: 'accept_a_payment'},
          });
        
          //const intent = // ... Fetch or create the PaymentIntent
          const { client_secret } = paymentIntent;
        res.render('checkout', { client_secret });

    }
    catch(err){
      req.flash("error",err.message);
      res.redirect("back");
      console.log(err);
    }
   
  });

module.exports=router;