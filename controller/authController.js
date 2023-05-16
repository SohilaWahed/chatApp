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

const createSendToken = (user, statusCode, res) => {
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
  res.cookie('jwt', token, cookiOption);
  user.password = undefined; //disable pass in req
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if fields are empty
  if (!email || !password) {
    return next(new AppError('please enter your email and password', 400));
  }
  // check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email Or password', 401));
  }
  // if everything is ok, send token to client
  createSendToken(user, 200, res);
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
  // if(user.PasswordChangAfter(decoded.iat)){
  //     return next(new AppError('User recently changed password , please login again', 401))
  // }
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

exports.forgetPasssword = catchAsync(async (req, res, next) => {
  //Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email', 401));
  }
  //Generate random reset token
  //const resetToken = user.createPasswordResetToken()
  const resetToken = user.createPasswordResetOtp();
  await user.save({ validateBeforeSave: false });
  // send it to user's email
  //const resetURL  = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  // const message = `Forget your password? Submit a PATCH request with your new password
  //     and passwordConfirm to: ${resetURL}.\nIf you didn't forget password, please ignore this email`
  const message = `forget your password? your OTP is ${resetToken} `;
  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token {valid for 10 min}',
      message,
    });
    res.status(200).json({
      status: 'sucess',
      message: 'Reset code sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There is an error in sending email', 500));
  }
});

exports.resetPassswordOtp = catchAsync(async (req, res, next) => {
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
  //log user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword= catchAsync(async (req,res,next) =>{
    // get user from collection
    // we would sure that user is already loggid by (potect / Authorization) 
    const user =  await User.findById(req.user.id).select('+password')
    //check if posted current password is correct
    if(!(user.correctPassword(req.body.currentPassword,user.password))){
        return next(new AppError('your current password is wrong',401))
    }
    // if true, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    //log user in, send jwt
    createSendToken(user, 400, res);
})


/*************************************************************/
let globalUser, globalEmail, globalPhone ;

exports.SearchEmailOrPhone = catchAsync(async (req, res, next) => {
    globalUser =  await User.findOne({email:req.body.email})
    if (!globalUser) {
      return next(new AppError('There is no user with that email', 401));
    }
    //await user.save({ validateBeforeSave: false });
    globalEmail = globalUser.email;
    globalPhone = globalUser.phone;
    res.status(200).json({
      success:'success',
      data:{
        email: globalEmail,
        phone: globalPhone
      }
    })
})

exports.chooseEmailOrPhone = catchAsync(async (req, res, next) => {
    //Generate random reset token
    console.log(globalUser);
    const resetToken = globalUser.createPasswordResetOtp() ;
    await globalUser.save({ validateBeforeSave: false });
    // send it to user's email
    if(req.body.email){
      console.log("In if statement");
      const message = `forget your password? your OTP is ${resetToken} `;
      try {
        await sendMail({
          email: req.body.email,
          subject: 'Your password reset token {valid for 10 min}',
          message,
        });
        res.status(200).json({
          status: 'sucess',
          message: 'Reset code sent to email',
        });
      } catch (err) {
        globalUser.passwordResetToken = undefined;
        globalUser.passwordResetExpires = undefined;
        await globalUser.save({ validateBeforeSave: false });
        return next(new AppError('There is an error in sending email', 500));
      }
    }else{}
})

exports.verifyPassResetCode = catchAsync(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetOtp: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Reset code invalid or expired'));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: 'Success',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email
  // const user = await User.findOne({ email: req.body.email });
  // if (!user) {
  //   return next(
  //     new AppError(`There is no user with email ${req.body.email}`, 404)
  //   );
  // }

  // 2) Check if reset code verified
  if (!globalUser.passwordResetVerified) {
    return next(new ApiError('Reset code not verified', 400));
  }
  globalUser.password = req.body.password;
  globalUser.passwordConfirm = req.body.passwordConfirm;

  globalUser.passwordResetOtp = undefined;
  globalUser.passwordResetExpires = undefined;
  globalUser.passwordResetVerified = undefined;

  await globalUser.save();

  // 3) if everything is ok, generate token
  createSendToken(globalUser, 200, res);
});