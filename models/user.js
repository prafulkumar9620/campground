var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");


var userschema=new mongoose.Schema({

    username:{type: String, unique: true, required: true},
    password:String,
    email: {type: String, unique: true, required: true}, //reset password
    resetPasswordToken: String,                           //reset password
    resetPasswordExpires: Date,                           //reset password
    isAdmin: {type:Boolean,default:false}, //admin
    isPaid: { type: Boolean, default: false },
    emailtoken:String,
    isverified:Boolean
});

// userschema.pre('save', function(next) {
//     var user = this;
//     var SALT_FACTOR = 5;
  
//     if (!user.isModified('password')) return next();
  
//     bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
//       if (err) return next(err);
  
//       bcrypt.hash(user.password, salt, null, function(err, hash) {
//         if (err) return next(err);
//         user.password = hash;
//         next();
//       });
//     });
//   });
userschema.plugin(passportLocalMongoose);
module.exports=mongoose.model("user",userschema);