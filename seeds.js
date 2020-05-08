var mongoose = require("mongoose");
var campground=require("./models/campground");
var comment=require("./models/comment");

var data=[
        {name:"cloud's Rest",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT0cSMfT6z3AZTKVzATgTi0lgyEhriOPbcMp1Y3aYkovPduuelC&usqp=CAU",
        description:"blah blah blah"
    
    },
    {name:"cloud's Rest",
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT0cSMfT6z3AZTKVzATgTi0lgyEhriOPbcMp1Y3aYkovPduuelC&usqp=CAU",
    description:"blah blah blah"

},
{name:"cloud's Rest",
image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT0cSMfT6z3AZTKVzATgTi0lgyEhriOPbcMp1Y3aYkovPduuelC&usqp=CAU",
description:"blah blah blah"

}
]

function seedDB(){

    //remove all campground
    campground.remove({},function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campground!");
        data.forEach(function(seed){
            campground.create(seed,function(err,data){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("added a campground!!");
                    //create a comment
                    comment.create(
                        {
                            text:"this place is great ,but i wish there was internet",
                            author: "Homer"                        
                        },function(err,comment){
                            if(err){
                                console.log(err);
                            }
                            else{
                                data.comments.push(comment);
                                data.save();
                                console.log("created a new comment!!");
                            }
                        });
                }
            });     
   
      });
    });
  //add a few campground
  
}
module.exports=seedDB;
