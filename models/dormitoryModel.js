const { model, Schema } = require('mongoose');

const dormitorySchema = new Schema(
  {
    active: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
      enum: ['university-owned', 'private-owned'],
      required: [true, 'Dormitory must belong to a category']
    },
    description: {
      type: String,
      required: [true, 'Dormitory must have a description'],
      min: 20
    },
    address: {
      type: String,
      required: [true, 'Dormitory must have a certain address']
    },
    city: {
      type: String,
      required: [true, 'City must be specified']
    },
    region: {
      type: String,
      required: [true, 'Region must be specified']
    },
    images: {
      type: [String],
      required: [true, 'Dormitory must have a cover photo']
    },
    // geo_lat: {
    //     type: String
    // },
    // geo_long: {
    //     type: String
    // },
    title: {
      type: String,
      unique: true,
      required: [true, 'Dormitory must have a brief title']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    numberOfViews: {
      type: Number,
      default: 0
    },
    inFavorites: {
      type: Number,
      default: 0
    },
    numberOfRooms: {
      type: Number,
      required: [true, 'Number of rooms must be specified']
    },
    facilities: {
      type: Array,
      required: [true, 'Facilities must be specified'],
    },
    others: {
      type: Array,
    },
    security: {
      type: Array,
      required: [true, 'Secuity measures must be specified'],
    },
    rules: {
      type: Array,
      required: [true, 'Rules must be specified']
    },
    bills: {
      type: Array,
      required: [true, 'Bills must be specified']
    },
    places: {
      type: Array,
      required: [true, 'Nearby places must be specified']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

dormitorySchema.index({ title: 'text' });
dormitorySchema.index({ city: 1, region: 1 });

dormitorySchema.pre(/^find/, function() {
  this.find({ active: { $ne: false } })
});

const DormitoryModel = model('Dormitory', dormitorySchema);

module.exports = DormitoryModel;