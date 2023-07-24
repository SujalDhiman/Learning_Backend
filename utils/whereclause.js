//base-Product.find()
//bigQ=//search=coder&page=2&category=shortsleeves&rating[gte]=4  just req.query
 
class whereClause{
    constructor(base,bigQ){
        this.base=base
        this.bigQ=bigQ
    }

    search(){
        const searchProduct=this.bigQ.name ? {
            name:{
                $regex:this.bigQ.name,
                $options:'i'
            }
        }:{}

        this.base=this.base.find({...searchProduct})
        return this
    }

    pagination(resultPerPage)
    {
        let currentPage=1
        if(this.bigQ.page){
            currentPage=this.bigQ.page
        }

        let skipVal=resultPerPage*(currentPage-1)

        this.base=this.base.limit(resultPerPage).skip(skipVal)
        return this
    }

    filter(){
        let newQuery={...this.bigQ}

        delete newQuery["name"]

        let newQueryToString=JSON.stringify(newQuery)
        
        let regex=new RegExp("(gte|lte|gt|lt)","g")

        newQueryToString=newQueryToString.replace(regex,m=>`$${m}`)

        let jsonnewQueryToString=JSON.parse(newQueryToString)

        this.base=this.base.find(jsonnewQueryToString)

        return this
    }
}

module.exports=whereClause