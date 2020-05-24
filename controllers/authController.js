const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if password and email exists
  if (!email || !password) {
    return next(new AppError('prease provide email and password', 400));
  }

  //check if user exists and password is correct

  const user = await User.findOne({ email }).select('+password');

  //const correct = user.correctPassword(password, user.password);

  if (!user || !user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //if everything is correct send the token to the client

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //get token and check if is there4

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log(token);

  if (!token) {
    return next(
      new AppError('you are not logged in please log in to have access', 401)
    );
  }

  //verification token
  const decoded = promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next('the user owner of this token no longer exists', 401);
  }

  //verify if user changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next('the user changed password', 401);
  }

  //grant access to the protected route
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 get user based on post email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  //2 generate a token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3 sent it by email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password? submit a patch request with your new password and password confirm  to ${resetURL} if you did not forget your password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token valid for 10 min',
      message
    });

    res.status(200).json({
      status: 'sucess',
      message: 'token sent to your email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'there was an error sending the email. Try again later ',
        500
      )
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  //1 get user based  on token
  // console.log('params', req.params.token);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hext')
    .toString('hex');

  //console.log('hashed', hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: new Date(Date.now()) }
  });
  // console.log('user', user);
  // console.log(new Date(Date.now()));
  // console.log(new Date());

  //2 if the token  has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.PasswordResetExpires = undefined;

  await user.save();
  //3 update changed password

  // 4 log the user and send jwt token

  createSendToken(user, 201, res);
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from colection

  const user = await User.findById(req.user.id).select('+password');
  //console.log(user);

  //check if the current passw is correct and
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(AppError('Your current password is wrong! ', 401));
  }

  //if so update the password and
  user.passowrd = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //log the user in send the jwt

  createSendToken(user, 200, res);
  next();
});
