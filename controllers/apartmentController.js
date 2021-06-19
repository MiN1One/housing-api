const factory = require('./handleFactory');
const Apartment = require('../models/apartmentModel');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/ApiFeatures');

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
exports.getOne = factory.getOne(Apartment, ['landlord'], true);
exports.getAll = factory.getAll(Apartment);
exports.deleteOne = factory.deleteOne(Apartment);
exports.updateOne = factory.updateOne(Apartment);

const restructureDocument = (data) => {
  const propertyData = {
    ...data,
    roomOptions: []
  };

  const fields = [
    'price',
    'kitchen',
    'condition',
    'numberOfRooms',
    'bath',
    'furnitured',
    'internet',
    'parking',
    'discount',
    'gaming',
    'computer',
    'air_conditioner',
    'washing_machine',
    'offers'
  ];

  for (let i = 0; i < data.price.length; i++) {
    propertyData.roomOptions.push({});
  }

  for (const [key, val] of Object.entries(data)) {
    if (fields.includes(key)) {
      for (let i = 0; i < val.length; i++) {
        propertyData.roomOptions[i][key] = val[i];
      }
      delete propertyData[key];
    }
  }

  return propertyData;
};

exports.getApartment = catchAsync(async (req, res) => {
  let query = await new ApiFeatures(Apartment.find(), req.query).filter();

  const filter = { ...query.filterObj };
  query = query.sequenceOne(req.params.id).mongooseQuery.populate('landlord');

  let doc = await query;
  
  if (doc) {
    doc.numberOfViews = +doc.numberOfViews + 1;
    await doc.save();
  }

  console.log({ document: doc });

  if (!doc) {

    if (req.query.prev) {
      doc = Apartment.find(filter).limit(1).sort({ $natural: -1 });
    } else if (req.query.next) {
      doc = Apartment.findOne(filter);
    } else {
      return next(new AppError('No apartment found with this ID', 404));
    }

    doc = await doc.populate('landlord');

    if (req.query.prev)
      doc = doc['0'];
  }

  res.status(200).json({
    status: 'success',
    data: {
      doc: restructureDocument(doc._doc)
    }
  });
});

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