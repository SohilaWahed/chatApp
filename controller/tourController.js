const { match } = require('assert');
const fs = require('fs');
const Tour = require('../Models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
     
exports.newTour = catchAsync(async(req, res, next)=>{
  const tour = await Tour.create(req.body)
    res.status(200).json({
      status:'success',
      data: tour
    })
})

exports.deleteTour = catchAsync(async (req, res, next) =>{
  const tour = await Tour.findByIdAndDelete(req.params.id)
  // to handle error 404 because in catchAsync send err without data and toke 500 by default
  if(!tour){
    return next(new AppError('No tour found with that id',404))
  }
  //success, without return data
  res.status(204).json({
   status:'sucess',
   data: null
 })
})

exports.updateTour =  catchAsync(async (req, res, next) =>{
  const tour = await  Tour.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  })
  if(!tour){
    return next(new AppError('No tour found with that id',404))
  }
  res.status(200).json({
    status:'sucess',
    data: {
      tour:tour
    },
  })
})

exports.getTour =  catchAsync(async (req, res, next) => {
  //const tours = await  Tour.findById(req.params.id)
  const tour = await Tour.findOne({_id:req.params.id})
  if(!tour){
    return next(new AppError('No tour found with that id',404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    },
  });
})

exports.aliasTopTours = (req, res, next)=>{
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summery,difficulty'
    next()
}  

exports.getAllTour = catchAsync( async (req, res, next) => {
  const features = new APIFeatures(Tour.find(),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const tours = await features.data; //EXECUTE data

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    },
  });
})

exports.getTourStats = async (req, res)=>{
  try{
    //take array of stages, stage is object
    const stats =  await Tour.aggregate([
      {
        $match:{ratingAverage: {$gte : 4.5}} // get and aggregate this
      },
      {
        $group:{
          _id: {$toUpper:'$difficulty'},
          numTours:{$sum: 1},
          numRatings:{$sum:'$ratingQuantity'},
          avgRating:{ $avg:'$ratingAverage'},
          avgPrice:{ $avg:'$price'},
          minPrice:{ $min:'$price'},
          maxPrice:{ $max:'$price'}
        }
      },
      {
        $sort:{avgPrice : 1}
      },
      {
        $match:{_id : { $ne:'EASY' }}
      }
    ])
    res.status(200).json({
      status: 'success',
      data: {
       stats
      },
    });
  }catch(err){
    res.status(404).json({
      status:'fail',
      message: err
    })   
  }
}
exports.getMonthlyplan = async (req,res)=>{
  try{

    const year = req.params.year * 1;
    const plan =  await Tour.aggregate([
      {
        $unwind:'$startDates' // get and aggregate this
      },
      {
        $match:{
          startDates : {
             $gte: new Date(`${year}-01-01`),
             $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group:{
          _id: {$month:'$startDates'},
          numTours:{$sum: 1},
          tours:{$push:'$name'}
        }
      },
    ])
    res.status(200).json({
      status: 'success',
      data: {
       plan
      },
    });
  }catch(err){
    res.status(404).json({
      status:'fail',
      message: err
    })   
  }

}
// const tours = JSON.parse(
//    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId = (req,res,next,val)=>{
//   console.log(`Tour id is ${val}`)
//   if(req.params.id*1 > tours.length){
//       return res.status(404).json({
//         status: 'fail',
//         message: 'Invalid id'
//       })
//   }
//   next();
// } 

// exports.checkBody = (req,res,next)=>{
//   if(!req.body.name){
//       return res.status(404).json({
//           sucess:"fail",
//           message:'bad requset'
//       })
//   }
//   next();
// }

// exports.newTour = (req,res)=>{
//   const newId = tours[tours.length-1].id+1
//   const newTour = Object.assign({id :newId},req.body)
//   tours.push(newTour)
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//       JSON.stringify(tours),
//       err =>{
//         res.status(201).json({
//           status:'success',
//           data:{
//             tour: newTour
//           }
//         })
//       }
//   )}   
// exports.getTour = (req, res) => {
//   const id = req.params.id *1;
//   const tour = tours.find(el => el.id === id)
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tour
//     },
//   });
// }