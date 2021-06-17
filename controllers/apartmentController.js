const factory = require('./handleFactory');
const Apartment = require('../models/apartmentModel');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/AppError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(
      new AppError('Only images are allowed to be uploaded', 400), 
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  fileFilter: multerFilter,
  storage: multerStorage
});

exports.resizeImages = (req, res, next) => {
  console.log(req.files);

  if (!req.files.imageCover || !req.files.images)
    return next();

  next();
};

exports.uploadImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'image', maxCount: 7 }
]);

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