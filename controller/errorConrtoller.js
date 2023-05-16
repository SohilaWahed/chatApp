// module.exports = (err, req, res, next)=>{
//     err.statusCode = err.statusCode || 500
//     err.status = err.status || 'error'
//     res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack : err.stack
//     })
//   }

const AppError = require('../utils/appError')

const handleCastErrorDB = err =>{
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError (message, 400)
}
const handleDuplicatefieldsDB = err =>{
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. please use another value!`
  return new AppError (message, 400)
}
const handleValidatioErrorDB = err=>{
  const errors = Object.values(err.errors).map(el =>{ el.message })
  const message = `Invalid input data: ${errors.join('\n')}`
  return new AppError (message, 400)
}
const handleJsonWebTokenErrorDB = err=>{ 
  return new AppError ('Invalid token, please login again!', 400)
}
const handleTokenExpiredErrorDB = err=>{ 
  return new AppError ('Expired token, please login again!', 400)
}
const sendErrorDev = (err, res)=>{
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack : err.stack
  })
}
//send less information and meaningfull error to user 
const sendErrorProd = (err,res) =>{
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  }else{
    console.error('ErrooooOoooor',err)
    res.status(err.statusCode).json({
      status: 'error',
      message: 'something went very wrong',
    })
  }
}

module.exports = (err, req, res, next)=>{
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if(process.env.NODE_ENV === 'development'){
    sendErrorDev(err,res)
  }else if(process.env.NODE_ENV === 'production'){
    let error = {...err};
    if(error.name === 'CastError') error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicatefieldsDB(error)
    if(error.name === 'ValidationError') error = handleValidatioErrorDB(error)
    if(error.name === 'JsonWebTokenError') error = handleJsonWebTokenErrorDB(error)
    if(error.name === 'TokenExpiredError') error = handleTokenExpiredErrorDB(error)
    
    sendErrorProd(error,res)
  }
}