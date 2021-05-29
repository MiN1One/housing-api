const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { promisify } = require('util');
const sendMail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES
  });
};

const createSendToken = (res, user, code) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development' ? false : true
  });

  user.password = undefined;

  res.status(code).json({
    status: 'success',
    token,
    user
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    phone_number: req.body.phone_number,
    last_name: req.body.last_name,
    role: req.body.role,
    password: req.body.password,
    email: req.body.email
  });

  user.password = undefined;

  res.status(201).json({
    status: 'success',
    user
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  
  if (!password || !email)
    return next(new AppError('Please enter your email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Username or password is incorrect', 400));

  createSendToken(res, user, 200);
});

const sendStatus = (res) => 
  res.status(200).json({ authorized: false });

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt) {
    sendStatus();
    return next();
  }

  const decodedToken = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_KEY);

  const user = await User.findById(decodedToken.id);
  if (!user) {
    sendStatus();
    return next();
  }
  
  if (user.passwordWasChanged(decodedToken.iat)) {
    sendStatus();
    return next();
  }

  res.status(200).json({ authorized: true });
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = null;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith('Bearer')) 
    token = authorization.split(' ')[1];
  else return next(new AppError('You are not logged in, please login!', 401));

  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_KEY);
  const user = await User.findById(decodedToken.id);
  if (!user) return next(new AppError('User with this id does not exist', 400));
  
  if (user.passwordWasChanged(decodedToken.iat))
    return next(new AppError('Password has recently been changed, please login again', 400));

  req.user = user;
  next();
});

exports.restrictTo = (roles) => 
  (req, res, next) => {
    if (!roles.includes(req.user.role)) 
      return next(new AppError('You do not have permission to perform this action', 403));
    
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email)
    return next(new AppError('Please provide email address', 400));
  
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('There is no user with this email address', 404));
  
  const token = user.createSaveResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `Your password reset url:\nClick on the link to reset your password: ${req.protocol}://${req.get('host')}/api/v1/users/resetMyPassword/${token}\nPassword reset URL will expire in 15 minutes.`;

  try {
    sendMail({
      message,
      subject: 'Password Reset',
      to: email
    });

    res.status(201).json({
      status: 'success',
      message: 'Password reset URL is sent to your email',
      resetToken: token
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Failed to send email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user)
    return next(new AppError('Invalid reset token or token was expired', 400));

  if (!req.body.password)
    return next(new AppError('Please, enter your new password', 400));
  
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  // passwordChangedStamp change is performed by middleware
  await user.save();

  createSendToken(res, user, 200);
});