const orderSchema=require("../models/order.model")

const productSchema=require("../models/product.model")


exports.createOrder=async function(req,res){

    const {shippingInfo,orderItems,paymentInfo,taxAmount,shippingAmount,totalAmount}=req.body

    req.user=req.id

    const order=await orderSchema.create({
        shippingInfo,orderItems,paymentInfo,taxAmount,shippingAmount,totalAmount,
        user:req.id
    })

    res.status(200).json({
        success:true,
        order
    })
}

exports.getOneOrder=async function(req,res){

    const productId=req.params.id

    const order=await orderSchema.findById(productId).populate("user","name email")

    if(!order)
    {
        res.status(404).send("Check order id")
    }
    else{
        res.status(200).json({
            success:true,
            order
        })
    }
}

exports.getLoggedInOrder=async function(req,res){

    const order=await orderSchema.find({user:req.id})
    if(!order)
    {
        res.status(404).send("Check order id")
    }
    else{
        res.status(200).json({
            success:true,
            order
        })
    }
}

exports.admingetAllOrders=async function(req,res){

    const orders=await orderSchema.find()

    if(!orders)
    {
        res.status(404).send("Check order id")
    }
    else{
        res.status(200).json({
            success:true,
            orders
        })
    }
}

exports.adminUpdateOrder=async function(req,res){

    const order=await orderSchema.findById(req.params.id)

    if(order.orderStatus === "Delievered")
    {
        res.status(404).send("Order is already delievered")
    }
    order.orderStatus=req.body.orderStatus

    order.orderItems.forEach(async (prod)=>{
       await  updateProductStock(prod.product,prod.quantity)
    })

    await order.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,
        order
    })

}

async function updateProductStock(productId,quantity)
{
    const product=await productSchema.findById(productId)

    product.stock=product.stock - quantity

    await product.save({validateBeforeSave:false})
}




