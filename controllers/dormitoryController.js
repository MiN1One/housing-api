const factory = require('./handleFactory');
const Dormitory = require('../models/dormitoryModel');

exports.setForPopular = (req, res, next) => {
  req.query.limit = 15;
  req.query.numberOfViews[gte] = 15;
  next();
};

exports.getDorms = factory.getAll(Dormitory);
exports.getDorm = factory.getOne(Dormitory);
exports.updateDorm = factory.updateOne(Dormitory);
exports.deleteDorm = factory.deleteOne(Dormitory);
exports.createDorm = factory.createOne(Dormitory);