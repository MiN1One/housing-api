const { Schema, model, SchemaTypes } = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    phone_number: {
      type: Number,
      required: [true, 'Please enter your phone number']
    },
    favorites: [
      {
        type: SchemaTypes.ObjectId,
        ref: 'Apartment'
      }
    ],
    name: {
      type: String,
      required: [true, 'Please enter a your name']
    },
    last_name: {
      type: String,
      required: [true, 'Please enter a your last name']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      default: 'user',
      enum: ['admin', 'landlord', 'user']
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 1.0,
      min: [1.0, 'Rating cannot be below 1'],
      max: [5.0, 'Rating cannot be above 5'],
      set: r => Math.round(r * 10) / 10
    },
    password: {
      type: String,
      required: [true, 'Password must be specified'],
      select: false
    },
    email: {
      type: String,
      required: [true, 'Email must be specified']
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.index({ email: 1 }, { unique: true });

// VIRTUALS 
userSchema.virtual('adverts', {
  ref: 'Apartment',
  foreignField: 'landlord',
  localField: '_id',
  justOne: false
});

userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'landlord'
});

// QUERY
userSchema.pre(/^find/, function() {
  this.find({ active: { $ne: false } });
});

// DOCUMENT
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 13);
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew)
    return next();

  this.passwordChangedAt = Date.now() - 1000;
});

// INSTANCE METHODS
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordWasChanged = function(JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return passwordTimeStamp > JWTTimeStamp;
  }

  return false;
};

userSchema.methods.createSaveResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');

  const encryptedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.passwordResetToken = encryptedToken;
  this.passwordResetTokenExpires = Date.now() + 15 * 60 * 1000;

  return token;
};

const UserModel = model('User', userSchema);

module.exports = UserModel;