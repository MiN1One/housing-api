const factory = require('./handleFactory');
const Apartment = require('../models/apartmentModel');

exports.createOne = factory.createOne(Apartment);
exports.getOne = factory.getOne(Apartment, 'landlord');
exports.getAll = factory.getAll(Apartment);
exports.deleteOne = factory.deleteOne(Apartment);
exports.updateOne = factory.updateOne(Apartment);

exports.setForLandlord = (req, res, next) => {
  if (req.params.landlordId) {
    req.query['landlord'] = req.params.landlordId;
  }
  next();
};

exports.getPopular = (req, res, next) => {
  req.query = {
    sort: '-numberOfViews',
    limit: 9,
    select: 'title,_id,price,imageCover,offers'
  };

  next();
};

exports.setLandlordId = (req, res, next) => {
  req.body.landlord = req.user._id;
  next();
};