var mongoose=require("mongoose");

var likeschema=mongoose.Schema({
    text:String,
    createdAt: { type: Date, default: Date.now },
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String
    }

});
module.exports=mongoose.model("likes",likeschema);