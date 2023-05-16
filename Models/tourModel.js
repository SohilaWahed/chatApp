const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator')

const tour = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'A tour must have a name'],
        unique: true,
        trim:true,
        maxlength:[40,'A tour name must have less or equal than 40 characters'],
        minlength:[10,'A tour name must have more or equal than 10 characters'],
        // use regular expression to test for that kind of pattern (number, space,)
        validate: [validator.isAlpha,'A tour name must be only characters']
    },
    slug: String,
    duration:{
        type:Number,
        required:[true, 'A tour must have a duration'],
    },
    maxGroupSize:{
        type:Number,
        required:[true, 'A tour must have a gruop size'],
    },
    difficulty:{
        type:String,
        required:[true, 'A tour must have a dificulty'],
        enum:{
            values:['easy','meduim','difficult'],
            message:'Difficult must be one of them (easy, meduim, difficult)'
        }
    },
    ratingAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1.0'],
        max:[10,'Rating must be below 10.0'],
    },
    ratingQuantity:{
        type:Number,
        default:4.5
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price'],
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator: function(val){
                return val < this.price
            },
            message:'Discount price should be below regular price'
        }
    },
    summary:{
        type: String,
        trim:true,
        required:[true,'A tour must have a discription']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default: Date.now()
        //select:false //this field doesn't send to user 
    },
    startDate:[Date],
    secret:{
        type:Boolean,
        default:false
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
);
// it isn't actually part of the database , only show to user
tour.virtual('durationWeeks').get(function(){
    return this.duration / 7;
})
//four type of middleware in mongoose (Document - Query - Aggregate - Model)
// 1) Document middleware: run before .save() and .create()
tour.pre('save',function(next){
    // act on the currently processed document
    this.slug = slugify( this.name,{lower:true})
    next()
}) 
// post middleware fns execute after pre middleware fns have completed
tour.post('save',function(doc,next){
    console.log(doc)
    next()
})
// 2) Query middleware : run after get query
//tour.pre('find',function(next){ // for findAll
tour.pre(/^find/,function(next){// for all cases find
    // act on the currently processing query
    this.find({secret :{$ne: true}})
    this.start = Date.now()
    next()
}) 
tour.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now()-this.start} milloseconds`)
    console.log(docs)
    next()
})
// 3) Aggregate middleware : run before or after aggregation
tour.pre('aggregate',function(next){// for all cases find
    // act on aggregate object
    this.pipeline().unshift({$match:{secret :{$ne: true}}})
    console.log(this.pipeline())
    this.start = Date.now()
    next()
}) 
const Tour = mongoose.model('Tour',tour)

module.exports = Tour;