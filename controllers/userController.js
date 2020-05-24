const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'sucess',
    results: users.length,
    data: { users }
  });
});

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'this route is not yet defined' });
};

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'this route is not yet defined' });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'this route is not yet defined' });
};

exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'this route is not yet defined' });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // create error if the user posts a password data
  //console.log('acessou a rota!!');
  if (req.body.password || req.body.passwordConfirm) {
    //console.log('enstrou no if aqui ');
    return next(
      new AppError(
        'This route is not for password updated. please use /updateMyPass.',
        400
      )
    );
  }
  //updarte docment
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  //await user.save();

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
  //next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'sucess',
    data: null
  });
});
