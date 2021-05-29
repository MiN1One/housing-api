const User = require('../models/userModel');
const factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const Apartment = require('../models/apartmentModel');

exports.createOne = factory.createOne(User);
exports.getAll = factory.getAll(User);

exports.getOne = factory.getOne(
  User, 
  'adverts',
  'reviews',
  'favorites'
);

exports.updateOne = factory.updateOne(User);
exports.deleteOne = factory.deleteOne(User);

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { password, currentPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(currentPassword, user.password)))
    return next(new AppError('Incorrect password', 400));
  
  user.password = password;
  await user.save({ validateBeforeSave: false });

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      doc: user
    }
  });
});

exports.updateMe = (req, res, next) => {
  if (req.body.password)
    return next(new AppError('Password cannot be changed here!', 400));
    
  next();
};

exports.getMe = (req, res, next) => {
  if (!req.params.id)
    req.params.id = req.user._id;
  
  next();
};

const incrementFavoriteStats = catchAsync(async (aptId) => {
  await Apartment.findByIdAndUpdate(aptId, { $inc: { inFavorites: 1 } });
});

const decrementFavoriteStats = catchAsync(async (aptId) => {
  await Apartment.findByIdAndUpdate(aptId, { $inc: { inFavorites: -1 } });
});

exports.removeFavorite = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.favorites = user.favorites.filter((el) => el != req.body.favorite);

  await user.save();

  await decrementFavoriteStats(req.body.favorite);

  res.status(204).json({});
});

exports.addToFavorites = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.favorites.push(req.body.favorite);
  await user.save();

  await incrementFavoriteStats(req.body.favorite);

  res.status(201).json({
    status: 'success',
    data: {
      favorites: user.favorites
    }
  });
});

exports.getFavorites = catchAsync(async (req, res, next) => {
  const { favorites } = await User.findById(req.user._id).populate('favorites');

  res.status(200).json({
    status: 'success',
    data: {
      docs: favorites
    }
  });
});