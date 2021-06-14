const fs = require('fs');
const { promisify } = require('util');
const { path } = require('../app');
const { parseCurrency } = require('./currencify');

module.exports = class ApiFeatures {
  constructor(mongooseQuery, expressQuery) {
    this.mongooseQuery = mongooseQuery;
    this.expressQuery = expressQuery;
    this.filterObj = {};
  }

  async filter() {
    let queryObj = { ...this.expressQuery };
    const fieldsToRemove = ['search', 'page', 'sort', 'project', 'limit', 'count', 'currency'];
    fieldsToRemove.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|ne|all|regex|and|elemMatch)\b/g,
      match => `$${match}`
    );

    queryObj = JSON.parse(queryStr);

    const features = [
      'rules', 
      'others', 
      'bills', 
      'security', 
      'condition',
      'kitchen',
      'bath',
      'numberOfRooms',
      'furnitured',
      'internet',
      'parking',
      'gaming',
      'computer',
      'air_conditioner',
      'washing_machine',
      'discount'
    ];

    for (let key in queryObj) {
      if (features.includes(key)) {
        if (typeof queryObj[key] === 'object') {
          for (let inKey in queryObj[key]) {
            queryObj[key][inKey] = queryObj[key][inKey].split(',');
          }
        } else {
          queryObj[key] = queryObj[key].split(',');
        }
      } else {
        if (key === 'region') {
          queryObj[key].$regex = new RegExp(queryObj[key].$regex, 'g');
        }
        
        if (key === 'price') {
          let { from, to } = queryObj[key];
          const values = {};

          if (this.expressQuery.currency) {
            const { from: parsedPriceFrom, to: parsedPriceTo } = await parseCurrency({
              currency: this.expressQuery.currency,
              from: from && from,
              to: to && to
            });

            from = parsedPriceFrom;
            to = parsedPriceTo;
          }

          if (to) values['$lte'] = to;
          if (from) values['$gte'] = from;
          
          queryObj[key] = { $elemMatch: values }
        }
      }
    }

    console.log({ query: queryObj });
    
    this.filterObj = { ...queryObj };
    this.mongooseQuery = this.mongooseQuery.find(queryObj);

    return this;
  }

  sort() {
    if (this.expressQuery.sort) {
      const sort = this.expressQuery.sort.split(',').join(' ');

      this.mongooseQuery = this.mongooseQuery.sort(sort);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }

    return this;
  }

  paginate() {
    if (this.expressQuery.page && this.expressQuery.limit) {
      const { page, limit } = this.expressQuery;
      const skip = (page - 1) * limit;
      
      this.mongooseQuery = this.mongooseQuery.skip(parseInt(skip)).limit(parseInt(limit));
    }


    return this;
  }


  limit() {
    if (this.expressQuery.limit) {
      this.mongooseQuery = this.mongooseQuery.limit(+this.expressQuery.limit);
    } else {
      this.mongooseQuery = this.mongooseQuery.limit(30);
    }

    return this;
  }

  search() {
    if (this.expressQuery.search) {
      this.mongooseQuery = this.mongooseQuery.find({
        $text: {
          $search: this.expressQuery.search,
          $caseSensetive: false,
          $diacriticSensitive: false
        }
      });
    }

    return this;
  }

  project() {
    if (this.expressQuery.project) {
      const projection = this.expressQuery.project.split(',').join(' ');

      this.mongooseQuery = this.mongooseQuery.select(projection);
    }

    return this;
  }
}

// { $and: [ { price: { $all: [150, 482] } } ] }

// { $and: [
// { price: { $elemMatch: { $gte: 120 } } }, 
// { price: { $elemMatch: { $lte: 150 } } } 
// ]}

// { $and: [ { price: { $elemMatch: { $gte: 123, $lte: 150 } } } ] }
// { price: { $elemMatch: { $gte: 123, $lte: 150 } } }
// { numberOfRooms: { $elemMatch: { $regex: /\b(1|4|2)\b/ } } }