const factory = require('./handleFactory');
const Review = require('../models/reviewModel');

exports.getReviewForApartment = (req, _, next) => {
  if (req.params.apartmentId) {
    req.query.apartment = req.params.apartmentId;
  }
  
  next();
};

exports.getReviewForUser = (req, _, next) => {
  if (req.params.userId) {
    req.query.landlord = req.params.userId;
  }

  next();
};

exports.setPosterId = (req, _, next) => {
  if (req.params.userId) 
    req.body.landlord = req.params.userId;

  if (!req.body.poster) {
    req.body.poster = {};
    req.body.poster['id'] = req.user._id;
    req.body.poster['name'] = req.user.name;
  }

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.postReview = factory.createOne(Review);
exports.updateReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);