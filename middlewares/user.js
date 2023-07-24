const userSchema=require("../models/user.model")
const jwt=require("jsonwebtoken")


exports.isLoggedIn=async function(req,res,next){

    //grabbing token from cookie
    const {token}=req.cookies

    if(token)
    {
        //verify token
        try
        {
            const decode=jwt.verify(token,process.env.JWT_SECRET)
            req.id=decode.id
            next()
        }
        catch(error)
        {
            console.log("Error while decoding token")
            res.status(404).send("Sign in First")
        }
    }
    else
    {
        res.status(404).send("Login First")
    }

}


exports.isAdmin=async function (req,res,next){

    //check with the id if user is admin or not
    const user=await userSchema.findById(req.id)

    if(user.role === "admin")
    {
        next()
    }
    else
    {
        res.status(404).send("You are not an Admin")
    }
}