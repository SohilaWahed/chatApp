const { promisify } = require('util');
const User = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendMail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode,message, res) => {
  const token = signToken(user._id);
  const cookiOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKI_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookiOption.secure = true;
  }
  res.cookie('jwt', token, cookiOption)
  user.password = undefined; //disable pass in req
  res.status(statusCode).json({
    status:true,
    message,
    data:user,
    token
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  if(!user){
    return next(new AppError(`Cannot Sign Up`,404) );
  }
  createSendToken(user,201,"sign up successfully",res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if fields are empty
  if (!email || !password) {
    return next(new AppError('please enter your email and password', 400));
  }
  // check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email Or password', 401));
  }
  // if everything is ok, send token to client
  createSendToken(user,200,"log in successfully",res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // take token from client side
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('you are not login to get access', 401));
  // verification token (no change happens, expired token)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user exist for this token
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError('The user belong to this token does no longer exist', 401)
    );
  }
  // //check if user change password after take token
  if(user.PasswordChangAfter(decoded.iat)){
      return next(new AppError('User recently changed password , please login again', 401))
  }
  req.user = user; // What is meaning ?
  next();
});

// make this because we can not pass value to middleware fn
exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to access this route', 403)
      );
    }
  next();
});


exports.forgotPassword=catchAsync(async (req,res,next) => {
  const user=await User.findOne({email:req.body.email}).select('email phone');
  
  if(!user){
   return next(new AppError('There is no user with email address.', 404));
  }

  res.status(200).json({
    status:true,
    message:"email Found",
    data:user
  })
})

exports.CheckEmailOrPhone=catchAsync(async (req,res,next) => {
  if(req.body.email){
    const user =await User.findOne({email:req.body.email});
  
  const OTP= await user.generateOtp();
  await user.save({ validateBeforeSave: false });
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        name:user.name,
        otp:OTP
      });
  
      res.status(200).json({
        status: true,
        message: 'OTP sent to email!',
        
      });
      
    }
    catch (err) {
      user.passwordOtp = undefined;
      user.passwordOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
    
      return next(new AppError(err), 500);
    }
  }
})


exports.verifyEmailOtp=catchAsync(async(req,res,next) => {
  //just email otp
  const cryptoOtp=crypto
  .createHash('sha256')
  .update(req.body.otp)
  .digest('hex');

  const user = await User.findOne({
      passwordOtp:cryptoOtp,
      passwordOtpExpires:{$gt:Date.now()}
    })
    
  
    if(!user){
      return next(new AppError("OTP is invalid or has expired",400))
    }
    const token =signToken(user.id);
    res.status(200).json({
      status:true,
      message:"OTP is valid You can now reset password",
      token
    })
})

exports.resetPassword=catchAsync(async (req,res,next) => {
 const user = req.user; // protect handler
 if(!user){
  return next(new AppError("Token is invalid or has expired",400))
}
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
// user.passwordResetExpires=undefined;
// user.passwordResetToken=undefined;
user.passwordOtp=undefined;
user.passwordOtpExpires=undefined;
//user.token=undefined;
await user.save({validateBeforeSave:false});
res.status(200).json({
  status:true,
  message:"password reset success you can now  try agin to log in"
})
//createSendToken(user,200,"password has changed successfully",res);
})

exports.logOut=catchAsync(async(req,res,next) => {
 
  res.clearCookie('jwt');
  req.headers.authorization=undefined;
 res.status(200).json({
   status:true,
   message:"You log out Successfully",
  // token:undefined
 })
 });

 exports.updatePassword=catchAsync(async(req,res,next)=>{ //settings  hy48lha b3d el protect
  // get user from collection 
    const user =await User.findById(req.user.id).select('+password')
    
    if(!user){
      return next(new AppError(" there's no user with that token",404))
    }
  // check if posted current password is correct
    if(!(await user.correctPassword(req.body.currentPassword,user.password))){
      return next(new AppError("Current password isn't correct",400))
    }
  // if true, update password 
    user.password=req.body.newPassword
    user.passwordConfirm=req.body.newPasswordConfirm
    await user.save({validateBeforeSave:false})
  // log user in, send JWT
  createSendToken(user, 200,"password has changed successfully", res);
})

/*************************************************************/
exports.resetPassswordOtpJ = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.body.Otp)
    .digest('hex');

  const user = await User.findOne({
    passwordResetOtp: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('OTP Expired', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetOtp = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.status(200).json({
    status:true,
    message:"password reset success you can now  try agin to log in"
  })
  // //log user in, send JWT
  // createSendToken(user, 200, res);
});