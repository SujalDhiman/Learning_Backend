const productSchema=require("../models/product.model")

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