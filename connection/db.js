const mongoose=require("mongoose")

const connectTODB=async function (){
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("Database connected succesfully")
    } catch (error) {
        console.log(error)
    }
}

module.exports=connectTODB