const mongoose = require('mongoose');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      default: 1,
      min: [1, 'Rating cannot be below 1'],
      max: [5, 'Rating cannot be greater than 5']
    },
    livedFor: {
      type: String,
      default: 'N/A'
    },
    poster: {
      type: Object,
      required: [true, 'Poster must be known']
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment'
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    review: {
      type: String,
      required: [true, 'Review text must be entered']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

reviewSchema.statics.saveReviewStats = async function(landlordId) {
  const stats = await this.aggregate([
    {
      $match: { landlord: landlordId }
    },
    {
      $group: {
        _id: '$landlord',
        numberOfReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(landlordId, {
      numberOfReviews: stats[0].numberOfReviews,
      averageRating: stats[0].averageRating
    });
  } else {
    await User.findByIdAndUpdate(landlordId, {
      numberOfReviews: 0,
      averageRating: 1.0
    });
  }
};

reviewSchema.post('save', async function() {
  await this.constructor.saveReviewStats(this.landlord);
});

// On update and delete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // findOne is needed in order to get document that is being removed or updated
  this.review = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.review.constructor.saveReviewStats(this.review._id);
});

reviewSchema.index({ landlord: 1, poster: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;