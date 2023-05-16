class APIFeatures{
    constructor(data,query){
        this.data = data 
        this.query = query
    }
    // filter feature find().where().equal().where().lt()
    filter(){
        const queryObj = {...this.query} //refrence from query obj
        const execludeFields = ['page', 'sort', 'limit', 'fields']
        execludeFields.forEach(el => delete queryObj[el])
        //console.log(queryObj)
        let queryStr = JSON.stringify(queryObj) //return obj to string to can replace with $
        //console.log(queryStr)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) 
        //console.log(queryStr)
        //console.log(JSON.parse(queryStr))
        this.data = this.data.find(JSON.parse(queryStr))
        return this
    }
    // sort feature (- decreacing)
    sort(){
        if(this.query.sort){
            //console.log(this.query.sort)
            const sortBy = this.query.sort.split(',').join(' ')
            //console.log(sortBy)
            this.data = this.data.sort(sortBy)
        }else{
            this.data = this.data.sort('-createdAt')
        }
        return this
    }
    // limit feature (- not include)
    limitFields(){
        if(this.query.fields){
            const fields = this.query.fields.split(',').join(' ')
            this.data = this.data.select(fields)
        }else{
            this.data = this.data.select('-__v') //any element except __v
        }
        return this
    }
    // pagination feature (1: 1-10, 2: 11-20)
    paginate(){
        const page = this.query.page *1 || 1
        const limit = this.query.limit *1 || 100
        const skip = (page-1) *limit
        // if(req.query.page){
        //   const numTours =  await Tour.countDocuments()
        //   if(skip > numTours) throw new error('This page does not exist')
        // }
        this.data = this.data.skip(skip).limit(limit)
        return this
    }
}
module.exports = APIFeatures