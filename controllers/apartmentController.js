const factory = require('./handleFactory');
const Apartment = require('../models/apartmentModel');
const multer = require('multer');
const sharp = require('sharp');
const restructureFields = require('../models/restructureFields');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/ApiFeatures');
const path = require('path');
const { nanoid } = require('nanoid');
const createDir = require('../utils/createDir');

exports.createOne = factory.createOne(Apartment);
exports.getOne = factory.getOne(Apartment, ['landlord'], true);
exports.getAll = factory.getAll(Apartment);
exports.deleteOne = factory.deleteOne(Apartment);
exports.updateOne = factory.updateOne(Apartment);

const 
  IMAGE_WIDTH = 1366,
  IMAGE_HEIGHT = 768;

const multerStorage = multer.memoryStorage();

const multerFilter = (_, file, cb) => {
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

const processImage = async (image, name, quality, id) => {
  await sharp(image)
    .resize(IMAGE_WIDTH, IMAGE_HEIGHT)
    .toFormat('jpeg')
    .jpeg({ quality })
    .toFile(path.join(__dirname, `../public/images/apartments/${id}/${name}`));
};

exports.receiveImages = upload.array('images', 12);

exports.resizeImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  
  createDir(`../public/images/apartments/${req.params.id}`);
  req.body = {
    images: [],
    imageCover: `cover-${req.params.id}.jpeg`
  };

  const pending = req.files.map(async (el) => {
    let fileName = `${el.originalname}-${nanoid()}-${req.params.id}.jpeg`;

    req.body.images.push(fileName);

    return await processImage(el.buffer, fileName, 80, req.params.id);
  });

  try {
    await processImage(
      req.files[0].buffer, 
      req.body.imageCover, 
      65,
      req.params.id
    );

    await Promise.all(pending);
    
    next();
  } catch(er) {
    console.error(er);
    next(new AppError('Failed to process images!', 500));
  }
};

exports.restructureDocumentForDB = (req, res, next) => {
  const data = req.body;
  const newData = { ...req.body };
  delete newData.roomOptions;
  
  restructureFields.forEach(el => {
    newData[el] = [];
  });

  for (let i = 0; i < data.roomOptions.length; i++) {
    for (let key in data.roomOptions[i]) {
      if (restructureFields.includes(key)) {
        newData[key].push(data.roomOptions[i][key]);
      } 
    }
  }

  req.body = newData;
  next();
};

const restructureDocumentForClient = (data) => {
  const propertyData = {
    ...data,
    roomOptions: []
  };

  for (let i = 0; i < data.price.length; i++) {
    propertyData.roomOptions.push({});
  }

  for (const [key, val] of Object.entries(data)) {
    if (restructureFields.includes(key)) {
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
    doc.numberOfViews++;
    await doc.save();
  }

  if (!doc) {

    if (req.query.prev) {
      doc = Apartment.find(filter).limit(1).sort({ $natural: -1 });
    } else if (req.query.next) {
      doc = Apartment.findOne(filter);
    } else {
      return next(new AppError('No apartment found with this ID', 404));
    }

    doc = await doc.populate('landlord');

    if (req.query.prev) doc = doc['0'];
  }

  console.log(restructureDocumentForClient(doc._doc))
  res.status(200).json({
    status: 'success',
    data: { doc: restructureDocumentForClient(doc._doc) }
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