const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({
     name:{
        type:String,
        required:[true,"please provide product name"],
        trim:true,
        maxLength:[120,"Product name should not exceed 120 characters"]
     },
     price:{
        type:Number,
        required:[true,"please provide product price"],
        maxLength:[4,"Product price should not exceed 4 digits"]
     },
     description:{
        type:String,
        required:[true,"please provide product description"]
     },
     photos:[
        {
            id:{
                type:String,
                required:true
            },
            secure_url:{
                type:String,
                required:true
            }
        }
     ],
     category:{
        type:String,
        required:[true,"please select category from- short-sleeves,long-sleeves,hoodies,sweat-shirt"],
        enum:["shortsleeves","longsleeves","hoodies","sweatshirt"]
     },
     brand:{
        type:String,
        required:[true,"please add a brand for clothing"]
     },
     ratings:{
        type:Number,
        default:0
     },
     numberOfReviews:{
        type:Number,
        default:0
     },
     stock:{
      type:Number,
      required:[true,"Please mention quantity"]
     },
     reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
     ],
     user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
     }
})



module.exports=mongoose.model("Product",productSchema)