const express=require("express")
const router=express.Router()
const {addProduct,getAllProduct,getSingleProduct,deleteProduct,updateProduct}=require("../controllers/productController")
const {isLoggedIn,isAdmin}=require("../middlewares/user")


//user routes
router.get("/products",getAllProduct)

//admin only route
router.post("/admin/product/add",isLoggedIn,isAdmin,addProduct)

//getting single product
router.get("/one/product/:id",getSingleProduct)

//admin deleting a product
router.delete("/deleteproduct/:id",isLoggedIn,isAdmin,deleteProduct)

//admin updating a single product
router.patch("/updateproduct/:id",isLoggedIn,isAdmin,updateProduct)

module.exports=router