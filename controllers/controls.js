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

            const url=`${req.protocol}://${req.hostname}:${process.env.PORT}/password/reset/${forgotToken}`

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

