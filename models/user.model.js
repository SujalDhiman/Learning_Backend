const mongoose=require("mongoose")
const validator=require("validator")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const crypto=require("crypto")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        unique:[true,"Name Already Taken"],
        required:[true,"This field is required"]
    },
    email:{
        type:String,
        required:[true,"This field is required"],
        validate:[validator.isEmail,"Please enter email in correct format"]
    },
    password:{
        type:String,
        unique:[true,"Enter new password"],
        required:[true,"This field is required"]
    },
    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    photo:{
        id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    forgotPasswordToken:String,
    forgotPasswordTokenExpiry:Date
})

//Hashing the password before save
userSchema.pre("save",async function (next){
    if(!this.isModified("password"))
    {
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
})

//validating Password
userSchema.methods.validatePassword=async function (gotPassword){
    try{
    return await bcrypt.compare(gotPassword,this.password)
    }
    catch(error)
    {
        console.log("An error occured")
    }
}

//generating a jwt token
userSchema.methods.generateJWToken=function (){
    const token=jwt.sign({
        id:this._id,
        email:this.email
    },process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRYDATE
    })

    return token
}

//creating a forgot password token
userSchema.methods.getForgotPasswordToken=function (){
    //generating a random long string
    const forgotToken=crypto.randomBytes(16).toString("hex")

    this.forgotPasswordToken=forgotToken
    this.forgotPasswordTokenExpiry=Date.now() + 10*60*1000 //valid for 10 mins only
    return forgotToken
}

module.exports=mongoose.model("User",userSchema)