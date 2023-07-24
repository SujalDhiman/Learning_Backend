const productSchema=require("../models/product.model")
const userSchema=require("../models/user.model")
const cloudinary=require("cloudinary");
const whereClause = require("../utils/whereclause");

exports.addProduct=async function(req,res){

    let result;
    let store=[]
    //first see images
    if(!req.files)
    {
        res.status(404).send("Images are required")
    }
    if(req.files)
    {
        for(let i=0;i<req.files.photos.length;i++)
        {
            result=await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath,{
                folder:"products"
            })

            store.push({id:result.public_id,
            secure_url:result.secure_url})
        }
    }

    req.body.photos=store

    req.body.user=req.id

    const product=await productSchema.create(req.body)

    res.status(200).json({
        success:"true",
        product
    })
}

exports.getAllProduct=async function(req,res){

    const resultPerPage=5

    //searching Products
    let productsFiltration=new whereClause(productSchema.find(),req.query).search()

    let countOfProducts=await productsFiltration.base

    //on basis of price
    productsFiltration=productsFiltration.filter()

    countOfProducts=await productsFiltration.base.clone()

    res.status(200).json({
        success:true,
        message:`Total Results Found ${countOfProducts.length}`,
        countOfProducts
    })
}

exports.getSingleProduct=async function(req,res){

    const product=await productSchema.findById(req.params.id)

    if(!product)
    {
        res.status(404).send("No products found with this id")
    }

    res.status(200).json({
        success:true,
        product
    })
}

exports.deleteProduct=async function(req,res){

    const result=await productSchema.findByIdAndDelete(req.params.id)
    console.log(result)

    if(result === null)
    {
        res.status(404).send("Product Not Listed")
    }
    else
    {
        if(result.photos)
        {
            for(let i=0;i<result.photos.length;i++)
            {
                await cloudinary.v2.uploader.destroy(result.photos[i].id)
            }
            res.status(200).send("everything deleted")
        }
    
    }
}

exports.updateProduct=async function(req,res){
    let result=[]
    let store=[]
    if(req.params.id)
    {
        const product=await productSchema.findById(req.params.id)

        if(product.photos)
        {   
            //deleting existing photos
            for(let i=0;i<product.photos.length;i++)
            {
                await cloudinary.v2.uploader.destroy(product.photos[i].id)
            }
            console.log("All product photos deleted")
            if(req.files)
            {
                //updating photos
                for(let i=0;i<req.files.photos.length;i++)
                {
                    result=cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath,{
                        folder:"products"
                    })

                    store.push({id:result.public_id,
                    url:result.secure_url})
                }
                req.body.photos=store

                const updatedProduct=await productSchema.findByIdAndUpdate(req.params.id,{...req.body})
                console.log(updatedProduct)

                res.status(200).send("Files Uplaoded")
            }
        }
    }    
}

exports.giveReview=async function(req,res){

    let reviewObject={}
    //grabbing id of the product   
    const productId=req.params.id

    //finding product corresponding to the id
    let product=await productSchema.findById(productId)

    if(product)
    {
        const user=await userSchema.findById(req.id)
        if(user)
        {
            const {rating,comment}=req.body

            //setting up review properties
            reviewObject.user=user._id
            reviewObject.name=user.name
            reviewObject.rating=Number(rating)
            reviewObject.comment=comment

            //check whether review already exist

            let userReviewExists=product.reviews.find((ele)=>ele.user.toString() === req.id.toString())
            let appendReviews=[]
            if(userReviewExists)
            {
                product.reviews.forEach((ele)=>{
                    if(ele.user.toString() === req.id.toString())
                    {
                        ele.rating=Number(reviewObject.rating)
                        ele.comment=reviewObject.comment
                    }
                })
            }
            else
            {
                appendReviews=product.reviews
                appendReviews.push(reviewObject)

                product.reviews=appendReviews
            }

            product.numberOfReviews=product.reviews.length
            product.ratings=Number(product.reviews.reduce((acc,current)=>acc+current.rating,0))/Number(product.reviews.length)

            await product.save({validateBeforeSave:false})
            res.status(200).send("Successful")
        }
        else
        {
            res.status(404).send("user does not exist")
        }
    }
    else
    {
        res.status(404).send("no such product found")
    }

}
