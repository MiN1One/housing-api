const factory = require('./handleFactory');
const Review = require('../models/reviewModel');

exports.getForUser = (req, res, next) => {
  if (req.params.userId) 
    req.query.landlord = req.params.userId;
    
  next();
};

exports.setUserId = (req, res, next) => {
  if (req.params.userId) 
    req.body.landlord = req.params.userId;

  if (!req.body.poster) {
    req.body.poster = {};
    req.body.poster['id'] = req.user._id;
    req.body.poster['name'] = req.user.name;

    console.log(req.user)
  }

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.postReview = factory.createOne(Review);
exports.updateReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);