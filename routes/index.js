var express = require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../models/user");
const { isNotVerifide } = require("../middleware");
var async = require("async");         //reset password
var nodemailer = require("nodemailer");  //reset password
var crypto = require("crypto");
const { Console } = require("console");
var hash = crypto.createHash('md5');          //reset password
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



router.get("/", function (req, res) {
  res.render("landing");
});
//============
//AUTH ROUTes
//=========
//show register form
// router.get("/register",function(req,res){
//     res.render("register");
// });
router.get("/register", function (req, res) {
  res.render("register", { page: 'register' });
});
//handling user sign up
router.post("/register", async function (req, res) {
  req.body.username
  req.body.password
  // user.save(req.body.username, req.body.password);
  var newUser = new user({
    username: req.body.username,
    email: req.body.email,
    // emailtoken: crypto.randomBytes(64).toString('hex'),
    // isverified: false
  });
  //Admin
  if (req.body.adminCode === 'secretcode123') {
    newUser.isAdmin = true;

  }

  await newUser.save()
  res.redirect('/');
});



//   user.register(new user({ username: req.body.username }), req.body.password, function (err, user) {
// user.register(newUser, req.body.password, function (err, user) {
//   if (err) {
//     console.log(err);
//     req.flash("error", err.message);
//     res.redirect("/register");
//     console.log(err);
//   }
//   user.save();
//   console.log("hello");
//   console.log(user.email);
// });

//  var smtpTransport = await nodemailer.createTransport({
//   service: 'Gmail', 
//   auth: {
//     user: 'prafulshettar4@gmail.com',
//     pass: 'udemy@9620'
//   }
// });
// var mailOptions = {
//   to: user.email,
//   from: 'prafulshettar4@gmail.com',
//   subject: 'yelpcamp-verify your email',
//   text: 'Hello thanks for registering on our site\n\n' +
//     'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//     'http://' + req.headers.host + '/verify-email/' + user.emailtoken + '\n\n' +
//     'verify your account.\n'
// }
// smtpTransport.sendMail(mailOptions, function(err) {

//   if(err){
//     console.log(err);
//     req.flash('error','some thing went wrong')
//     res.redirect('/');
//   }
//   req.flash('success', 'thanks for registering please check you are email to verify your account');
//   res.redirect('/');
//   console.log('mail sent');
// console.log(user.email);

// console.log('Email sent' + info.res);
//console.log(smtpTransport);
// done(err, 'done');
// res.redirect('/forgot');
//}
//});





//  passport.authenticate("local")(req,res,function(){
//      req.flash("success","Welcome to YelpCamp"+ req.body.username);
//      res.redirect("/campgrounds");
//  });

// });

//  });
// router.get('/verify-email/:token', async function (req, res) {
//   console.log("function");
//   try {
//     const User = await user.findOne({ emailtoken: req.params.token });
//     console.log("hi" + req.params.token);
//     console.log(User.emailtoken);
//     if (!User) {
//       console.log(User);
//       console.log("err");
//       req.flash("error", "token is invalid");
//       res.redirect('/');

//     }
//     User.emailtoken = null;
//     User.isverified = true;
//     await User.save();

//     req.login(User, async function (err) {
//       if (err) {
//         console.log(err);

//       }
//       req.flash('sucess', 'welcome to yelpcamp $({User.username})');
//       const redirecturl = req.session.redirectTo || '/';
//       delete req.session.redirectTo;
//       res.redirect(redirecturl);
//     });
//   } catch (error) {
//     console.log(error);

//     req.flash('error', 'some thing went wrong')
//     res.redirect('/');
//   }

// });
//LOGIN ROUTES
//render login form
// router.get("/login",function(req,res){
//     res.render("login");
// });

//show login form
router.get("/login", function (req, res) {

  res.render("login", { page: 'login' });
});
//login logic
//middleware
router.post("/Login", isNotVerifide, passport.authenticate("local", {
  successRedirect: "/campgrounds",
  failureRedirect: "/login",
  failureFlash: true

}), function (req, res) {
});

// router.get("/logout",function(req,res){
//         req.logOut();
//         res.redirect("/"); 

// });
//logic logout
router.get("/logout", function (req, res) {
  req.logOut();
  req.flash("success", "Logged you out!");
  res.redirect("/campgrounds");

});

// forgot password
router.get("/forgot", function (req, res) {
  res.render('forgot');
});

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      user.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
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
      smtpTransport.sendMail(mailOptions, function (err) {


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
  ], function (err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});


router.get('/reset/:token', function (req, res) {
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    console.log(req.params.token);
    // console.log(user.password );
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render("reset", { token: req.params.token });

  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user, next) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              req.logIn(user, function (err) {
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
    function (user, done) {
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
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect('/campgrounds');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
//checkout payment
router.get('/checkout', isLoggedIn, (req, res) => {
  if (req.user.isPaid) {
    req.flash('success', 'Your account is already paid');
    return res.redirect('/campgrounds');
  }
  res.render('checkout', { amount: 20 });
});

// POST pay
router.post('/pay', isLoggedIn, async (req, res) => {
  const { paymentMethodId, items, currency } = req.body;
  console.log(req.body);

  const amount = 2000;

  try {
    // Create new PaymentIntent with a PaymentMethod ID from the client.
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      error_on_requires_action: true,
      confirm: true
    });

    console.log("💰 Payment received!");

    req.user.isPaid = true;
    await req.user.save();
    // The payment is complete and the money has been moved
    // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

    // Send the client secret to the client to use in the demo
    res.send({ clientSecret: intent.client_secret });
  } catch (e) {
    // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
    // See https://stripe.com/docs/declines/codes for more
    if (e.code === "authentication_required") {
      res.send({
        error:
          "This card requires authentication in order to proceeded. Please use a different card."
      });
    } else {
      res.send({ error: e.message });
      console.log(e.message);
    }
  }
});
//contact form
router.get('/contact', isLoggedIn, (req, res) => {
  res.render('contact');
});
// POST /contact
router.post('/contact', async (req, res) => {
  let { name, email, message } = req.body;
  name = req.sanitize(name);
  email = req.sanitize(email);
  message = req.sanitize(message);
});


module.exports = router;
