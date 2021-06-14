const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { ObjectId } = require('mongoose').Types;
const { convertCurrency } = require('../utils/currencify');

exports.getAll = (Model, populateObj) => 
  catchAsync(async (req, res, next) => {
    let features = await new ApiFeatures(Model.find(), req.query)
      .filter();

    features = features
      .sort()
      .paginate()
      .search()
      .project();

    let query = features.mongooseQuery;

    if (populateObj)
      query = query.populate(populateObj);

    let docs = await query;

    let numDocuments = null;
    if (req.query.count) {
      numDocuments = await Model.countDocuments(features.filterObj);
    }

    if (req.query.currency) {
      docs = await convertCurrency(req.query.currency, docs);
    }

    res.status(200).json({
      status: 'success',
      numberOfDocuments: numDocuments ? numDocuments : undefined,
      results: docs.length,
      data: {
        docs
      }
    });
  });

exports.getOne = (Model, ...populateObj) => 
  catchAsync(async (req, res, next) => {
    let query = null;
    if (req.query.next) {
      query = Model.findOne({ _id: { $gt: ObjectId(req.params.id) } });
    } else if (req.query.prev) {
      query = Model.findOne({ _id: { $lt: ObjectId(req.params.id) } });
    } else {
      query = Model.findById(req.params.id);
    }

    if (populateObj) {
      populateObj.forEach((obj) => {
        query = query.populate(obj);
      });
    }

    const doc = await query;
    
    if (doc && req.query.count) {
      doc.numberOfViews = +doc.numberOfViews + 1;
      await doc.save();
    }

    if (!doc)
      return next(new AppError('No document found with this ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = (Model) => 
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.deleteOne = (Model) => 
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return next(new AppError('No document found with this ID', 404));

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = (Model) => 
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }  
    );

    if (!doc)
      return next(new AppError('No document found with this ID', 404)); 

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });