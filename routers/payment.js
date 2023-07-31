const express=require("express")
const router=express.Router()
const {isLoggedIn}=require("../middlewares/user")

const {sendStripeKey,captureStripePayment}=require("../controllers/paymentController")


router.get("/stripekey",isLoggedIn,sendStripeKey)
router.post("/stripePayment",isLoggedIn,captureStripePayment)


module.exports=router