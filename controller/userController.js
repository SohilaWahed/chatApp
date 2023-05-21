const User = require('../Models/userModel')
const APIFeatures = require('./../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

// ...allowedFields create array of send data 
const filterObj = (obj , ...allowedFields)=>{
  const newObj = {}
  Object.keys(obj).forEach(el=>{
    if( allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.getAllUser = catchAsync( async (req, res, next) => {

    const users = await User.find() //EXECUTE data
  
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      },
    });
})

exports.getDataUpdate = catchAsync( async (req, res, next) => {
  const user = await User.findById(req.user.id) //EXECUTE data
  
  res.status(200).json({
    status: true,
    message:"data sent succefully",
    data: {
      name:user.name,
      email:user.email,
      phone:user.phone,
    },
  });
})  

exports.updateMe = catchAsync(async(req,res,next)=>{
  if(req.body.password || req.body.passwordConfirm){
    return next( new AppError('this route is not for password updates',400))
  }
  const filteredBody = filterObj(req.body,'name','email','phone')
  const updateUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,
    runValidators:true
  })
  res.status(200).json({
    status:true,
    message:"update successfully",
    data:{
      user:updateUser
    }
  })
})

// don't delete from database
exports.deleteMe = catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false})
  res.status(204).json({
    status:true,
    message:"deleted successfully",
    data:null
  })
})

exports.getAllDeletedUser = catchAsync( async (req, res, next) => {

  const users = await User.findOne({active: false}) //EXECUTE data

  res.status(200).json({
    status: true,
    results: users.length,
    data: {
      users
    },
  });
})
