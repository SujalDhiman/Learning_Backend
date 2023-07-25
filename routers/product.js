const express=require("express")
const router=express.Router()
const {addProduct,getAllProduct,getSingleProduct,deleteProduct,updateProduct,giveReview,deleteReview}=require("../controllers/productController")
const {isLoggedIn,isAdmin}=require("../middlewares/user")


//user routes
router.get("/products",getAllProduct)

//admin only route
router.post("/admin/product/add",isLoggedIn,isAdmin,addProduct)

//getting single product
router.get("/one/product/:id",getSingleProduct)

//user deleting review

router.get("/deletereview/:id",isLoggedIn,deleteReview)


//admin deleting a product
router.delete("/deleteproduct/:id",isLoggedIn,isAdmin,deleteProduct)

//admin updating a single product
router.patch("/updateproduct/:id",isLoggedIn,isAdmin,updateProduct)

//setting reviews by the user
router.patch("/reviewproduct/:id",isLoggedIn,giveReview)



module.exports=router