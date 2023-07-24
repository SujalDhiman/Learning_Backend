const express=require("express")
const userSchema=require("../models/user.model")
const {signup,signin,logout,forgotPassword,details,passwordUpdate, updateUserDetail,adminAllUsers,adminGetSingleUser,adminUpdateSingleUser,adminDeleteUser}=require("../controllers/controls")
const {isLoggedIn,isAdmin}=require("../middlewares/user")
const router=express.Router()


//signup route
router.post("/signup",signup)

//signin route
router.post("/signin",signin)

//logout route
router.get("/logout",logout)

//forgot password route
router.post("/forgotpassword",forgotPassword)

//forgot password token confirmation route
router.post("/password/reset/:token",async (req,res)=>{

    //extracting token
    const Token=req.params.token

    //checking in database
    const user=await userSchema.findOne({forgotPasswordToken:Token})

    if(user)
    {
        if(user.forgotPasswordTokenExpiry > Date.now())
        {
            //extracting password from body
            const {newpassword}=req.body

            if(newpassword)
            {
                user.password=newpassword
                user.forgotPasswordToken=undefined
                user.forgotPasswordTokenExpiry=undefined
                await user.save()

                res.status(200).send("User password updated")
            }
        }
        else
        {
            res.status(404).send("Token Expired")
        }
    }
    else
    {
        res.status(404).send("No token found")
    }
})

//userdashboard access route
router.get("/userdashboard",isLoggedIn,details)

//user can update password route
router.post("/password/update",isLoggedIn,passwordUpdate)

//user profile update
router.post("/userdashboard/update",isLoggedIn,updateUserDetail)

//admin getting all users
router.get("/admin/users",isLoggedIn,isAdmin,adminAllUsers)

//admin getting single user on userID
router.get("/admin/users/:id",isLoggedIn,isAdmin,adminGetSingleUser)

//admin updating user profile
router.post("/admin/users/:id",isLoggedIn,isAdmin,adminUpdateSingleUser)

//admin deleting user
router.delete("/admin/users/:id",isLoggedIn,isAdmin,adminDeleteUser)

module.exports=router