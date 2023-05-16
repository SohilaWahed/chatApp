const morgan = require('morgan'); //library simulation middleware fn 
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const chatRouter = require('./routes/chatRoutes')
const messageRouter = require('./routes/messageRoutes')
const express = require('express');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controller/errorConrtoller')
const cors = require('cors')
const app = express();

app.use(express.json()); // add json fn in our middleware stack 

app.use(cors())

if(process.env.NODE_ENV === "development"){
  app.use(morgan('dev'))
}

app.use(express.static(`${__dirname}/public`))

app.use((req,res,next)=>{
  console.log('Hello in middleware')
  req.requestTime = new Date().toISOString()
  next()
})


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);


app.all('*',(req,res,next)=>{

  // return json error instead of html when unknown route
  // res.status(404).json({
  //   status:'fail',
  //   message: `can't find ${req.originalUrl} on this server`
  // })

  // const err = new Error(`can't find ${req.originalUrl} on this server`)
  // err.status = 'fail ',
  // err.statusCode = 404
  // next(err); // send err to globalErrorHandler

  next(new AppError(`can't find ${req.originalUrl} on this server`, 404))
})

// instead of html error and repeated this block in all ops
app.use(globalErrorHandler)

module.exports = app