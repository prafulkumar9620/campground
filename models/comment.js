var mongoose=require("mongoose");

var commentschema=mongoose.Schema({
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
module.exports=mongoose.model("comment",commentschema);