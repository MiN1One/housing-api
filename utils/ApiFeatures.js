module.exports = class ApiFeatures {
  constructor(mongooseQuery, expressQuery) {
    this.mongooseQuery = mongooseQuery;
    this.expressQuery = expressQuery;
  }

  filter() {
    let queryObj = { ...this.expressQuery };
    const fieldsToRemove = ['search', 'page', 'sort', 'project', 'limit', 'count'];
    fieldsToRemove.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|ne|all)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryStr);

    const features = [
      'rules', 
      'others', 
      'bills', 
      'places', 
      'security', 
      'condition',
      'numberOfRooms',
      'price',
      'kitchen',
      'bath',
      'furnitured',
      'internet',
      'parking',
      'gaming',
      'computer',
      'air_conditioner',
      'washing_machine',
      'discount'
    ];

    features.forEach((el) => {
      for (let key in queryObj) {
        if (el === key) {
          if (typeof queryObj[key] === 'object') {
            for (let inKey in queryObj[key]) {
              queryObj[key][inKey] = queryObj[key][inKey].split(',');
              
              if (el === 'price' || el === 'discount' || el === 'numberOfRooms') {
                queryObj[key][inKey] = queryObj[key][inKey].map(el => +el);
              }
            }
          } else {
            queryObj[key] = queryObj[key].split(',');
          }
        }
      }
    });
    
    this.mongooseQuery = this.mongooseQuery.find(queryObj);

    return this;
  }

  sort() {
    if (this.expressQuery.sort) {
      const sort = this.expressQuery.sort.split(',').join(' ');

      this.mongooseQuery = this.mongooseQuery.sort(sort);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-created');
    }

    return this;
  }

  paginate() {
    if (this.expressQuery.page & this.expressQuery.limit) {
      const { page, limit } = this.expressQuery;
      const skip = (page - 1) * limit;

      this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    }

    return this;
  }


  limit() {
    if (this.expressQuery.limit) 
      this.mongooseQuery = this.mongooseQuery.limit(+this.expressQuery.limit);
    else this.mongooseQuery = this.mongooseQuery.limit(30);

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