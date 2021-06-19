const { Schema, model } = require('mongoose');

const apartmentSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Apartment must have a title']
    },
    active: {
      type: Boolean,
      default: true
    },
    rooms: {
      type: [String],
      default: undefined
    },
    ownership: {
      type: String,
      enum: ['university-owned', 'private'],
      required: [true, 'Ownership must be specified']
    },
    pending: {
      type: Boolean,
      default: true
    },
    region: {
      type: String,
      required: [true, 'Region must be specified']
    },
    condition: {
      type: [String],
      default: undefined,
      required: [true, 'Condition must be specified']
    },
    numberOfRooms: {
      type: [Number],
      required: [true, 'Number of rooms must be specified'],
      default: undefined
    },
    address: {
      type: String,
      required: [true, 'Apartment must have a certain address']
    },
    city: {
      type: String,
      required: [true, 'City must be specified']
    },
    landlord: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'There must someone who owns the dormitory']
    },
    kitchen: {
      type: [String],
      required: [true, 'Kitchen type is required'],
      default: undefined
    },
    price: {
      type: [Number],
      required: [true, 'Prices are required'],
      default: undefined
    },
    bath: {
      type: [String],
      required: [true, 'Bath type is required'],
      default: undefined
    },
    furnitured: {
      type: [Boolean],
      required: [true, 'Furnitured facility must be specified'],
      default: undefined
    },
    internet: { 
      type: [Boolean],
      required: [true, 'Internet service facility must be specified'],
      default: undefined
    },
    parking: {
      type: [Boolean],
      required: [true, 'Parking area facility must be specified'],
      default: undefined
    }, 
    gaming: {
      type: [Boolean],
      required: [true, 'Gaming facility must be specified'],
      default: undefined
    },
    computer: {
      type: [Boolean],
      required: [true, 'Computer provision facility must be specified'],
      default: undefined
    },
    air_conditioner: {
      type: [Boolean],
      required: [true, 'Air conditioner facility must be specified'],
      default: undefined
    },
    washing_machine: {
      type: [Boolean],
      required: [true, 'Washing machine facility must be specified'],
      default: undefined
    },
    images: {
      type: [String],
      required: [true, 'There must be at least one cover image for apartment'],
      default: undefined
    },
    imageCover: {
      type: String,
      required: [true, 'Cover image must be specified']
    },
    // description: {
    //   type: String,
    //   min: 30,
    //   required: [true, 'Apartment must have a description']
    // },
    createdAt: {
      type: Date,
      default: Date.now
    },
    inFavorites: {
      type: Number,
      default: 0
    },
    numberOfViews: {
      type: Number,
      default: 0
    },
    security: {
      type: [String],
      required: [true, 'Secuity measures must be specified'],
      default: undefined
    },
    rules: {
      type: [String],
      required: [true, 'Rules must be specified'],
      default: undefined
    },
    bills: {
      type: [String],
      required: [true, 'Bills must be specified'],
      default: undefined
    },
    places: {
      type: [String],
      required: [true, 'Nearby places must be specified'],
      default: undefined
    },
    offers: {
      type: [Array], 
      default: undefined
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

apartmentSchema.index({ title: 'text' });
apartmentSchema.index({ city: 1, region: 1 });

// QUERY
apartmentSchema.pre(/^find/, function() {
  this.find({ 
    active: { $ne: false },
    // pending: { $ne: true }
  });
});

const ApartmentModel = model('Apartment', apartmentSchema);

module.exports = ApartmentModel;