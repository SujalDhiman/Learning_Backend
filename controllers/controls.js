const userSchema=require("../models/user.model.js")
const cookie=require("cookie-parser")
const fileUpload=require("express-fileupload")
const cloudinary=require("cloudinary")
const mailHelper=require("../mail/sendMail.js")

exports.signup=async function (req,res){

    //checking for file upload
    let result;
    if(req.files)
    {
        const file=req.files.photo
        result=await cloudinary.v2.uploader.upload(file.tempFilePath,{
            folder:"users",
            width:150,
            crop:"scale"
        })
    }


    //grabbing data from request body
    const {name,email,password}=req.body

    try
    {
    //validating all fields
    if((!name || !email || !password ))
    {
        res.status(404).send("Enter all details")
    }
    else
    {
    //checking if user exists with same name
    let user=await userSchema.findOne({email})
    if(user)
    {
        res.status(404).send("User Already Exists With Same Name")
    }
    else
    {
        user=await userSchema.create({ name, email , password ,photo:{id:result.public_id,secure_url:result.secure_url}})

        const token=user.generateJWToken()
        
        user.password=undefined
        user.token=token

        res.status(200).send({success:"true",user,token})
        }
    }}
    catch(error)
    {
        
        res.status(404).send(error.message)
    }
}

exports.signin=async function (req,res){

    //extracting email and password from body
    const {email,password}=req.body

    //validating all fields

    if(!(email && password))
    {
        res.status(404).send("Fill all fields")
    }
    else
    {
        const user=await userSchema.findOne({email})
        if(user)
        {
            //validating the password
            const ans=await user.validatePassword(password)

            if(ans)
            {
                console.log(ans)
                const token=user.generateJWToken()

                const options={
                    expiresIn:Date.now()+30*60*1000,
                    httpOnly:true
                }

                res.status(200).cookie("token",token,options).send("Login in successful")
            }
            else
            {
                res.status(404).send("Enter correct password")
            }
        }
        else
        {
            res.status(404).send("Register First")
        }
    }
}

exports.logout=async function (req,res){

    //logging out user
    res.status(200).cookie("token",null,{expiresIn:Date.now(),httpOnly:true}).send("User logout successful")
}

exports.forgotPassword=async function (req,res){
    //get email from body
    const {email}=req.body

    //checking if email is supplied
    if(!email)
    {
        res.status(404).send("Specify Your Email")
    }
    else
    {
        const user=await userSchema.findOne({email})

        if(user)
        {
            const forgotToken=user.getForgotPasswordToken()

            await user.save({validateBeforeSave:false})

            const url=`${req.protocol}://${req.hostname}:${process.env.PORT}/user/v1/password/reset/${forgotToken}`

            const data={
                email:user.email,
                subject:"Go to Specified Link to confirm forgot password",
                message:url
            }
            try {
                await mailHelper(data)
                res.status(200).send("Email Sent Successfully")

            } catch (error) {
                user.forgotPasswordToken=undefined
                user.forgotPasswordTokenExpiry=undefined
                await user.save()
                res.status(404).send(error.message)
            }
        }
        else
        {
            res.status(404).send("user does not exist")
        }
    }
}

exports.details=async function (req,res){

    //checking for that id
    if(req.id)
    {
        const user=await userSchema.findOne({_id:req.id})
        user.password=undefined
        user.forgotPasswordToken=undefined
        user.forgotPasswordTokenExpiry=undefined

        res.status(200).json({
            success:"true",user
        })
    }
    else
    {
        res.status(404).send("user not found")
    }
}

exports.passwordUpdate=async function (req,res){
    if(req.id)
    {
        //grab the user based on id

        const user=await userSchema.findById({_id:req.id})

        //check original password
        const {oldPassword}=req.body

        const result=await user.validatePassword(oldPassword)

        if(result)
        {
            const {newPassword}=req.body
            user.password=newPassword

            await user.save()

            res.status(200).send("Password Updated Successfully")
        }
        else
        {
            res.status(404).send("Incorrect Password")
        }
    }
    else
    {
        res.status(404).send("Login first")
    }
}

exports.updateUserDetail=async function(req,res){

    const newData={
        name:req.body.name,
        email:req.body.email
    }

    if(req.files)
    {
        const user=userSchema.findById(req.id)

        await cloudinary.v2.uploader.destroy(user.photo.id)

        const result=await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
            folder:"users",
            width:150,
            crop:"scale"
        })

        newData.photo={
            id:result.public_id,
            secure_url:result.secure_url
        }
    }

    const user=await userSchema.findByIdAndUpdate(req.id,newData,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        user
    })
}

exports.adminAllUsers=async function (req,res){

    //if we are here then the user is admin

    const user=await userSchema.find({})

    res.status(200).json({
        success:true,
        user
    })
}


exports.adminGetSingleUser=async function(req,res){

    //getting id from url
    const userId=req.params.id

    const user=await userSchema.findById(userId)

    if(user)
    {
        res.status(200).json({
            success:true,
            user
        })
    }
    else
    {
        res.status(404).send("User not found")
    }
}

exports.adminUpdateSingleUser=async function(req,res){

    const userId=req.params.id
    const user=userSchema.findById(userId)

    const data={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
  
    if(!user)
    {
        res.status(404).send("User not found")
    }
    else
    {
        user=userSchema.findByIdAndUpdate(userId,data)
        res.status(200).json({
            success:true,
            user
        })
    }
}

exports.adminDeleteUser=async function (req,res){

    const user=await userSchema.findById(req.params.id)

    if(user)
    {
    const photoId=user.photo.id

    await cloudinary.v2.uploader.destroy(photoId)

    await userSchema.findByIdAndDelete(req.params.id)

    res.status(200).send("User deleted Successfully")
    }
    else
    {
        res.status(404).send("No user found")
    }

}