
var mongoose=require("mongoose");

var campgroundschema= new mongoose.Schema({
    name: String,
    price:String,
    image:String,
    imageID:String,
    description:String,
    createdAt: { type: Date, default: Date.now },
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"comment"
        }
    ]
    });
    module.exports = mongoose.model("campground",campgroundschema);