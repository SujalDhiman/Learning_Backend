const express=require("express")
const app=express()
const router=require("./routers/routes")
const connectTODB=require("./connection/db")
const cookieParser=require("cookie-parser")
const cloudinary=require("cloudinary")
const expressFileUpload=require("express-fileupload")
const product=require("./routers/product")
const payment=require("./routers/payment")
const order=require("./routers/order")
//connecting database
connectTODB()

//cloudinary setup 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET  
  });

//setting middlewares
app.use(express.json())
app.use(cookieParser())
app.use(expressFileUpload({useTempFiles:true,tempFileDir:"/tmp/"}))
app.use(express.urlencoded({extended:true}))


app.use("/user/v1",router)
app.use("/user/v1",product)
app.use("/user/v1",payment)
app.use("/user/v1",order)


module.exports=app