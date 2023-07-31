const express=require("express")
const router=express.Router()

const {createOrder,getOneOrder,getLoggedInOrder,admingetAllOrders,adminUpdateOrder}=require("../controllers/orderController")

const {isLoggedIn,isAdmin}=require("../middlewares/user")

router.post("/order/create",isLoggedIn,createOrder)

router.get("/order/:id",isLoggedIn,getOneOrder)

router.get("/myorder",isLoggedIn,getLoggedInOrder)

router.get("/allOrder",isLoggedIn,isAdmin,admingetAllOrders)

router.get("/updateOrder/:id",isLoggedIn,isAdmin,adminUpdateOrder)

module.exports=router