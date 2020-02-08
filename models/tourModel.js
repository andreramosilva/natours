const mongoose = require('mongoose');
const slugify = require('slugify');

//creating the schema for the mongo db
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      Trim: true,
      maxlength: [40, 'A tour mus have a limit of 40 characters!'],
      minlength: [5, 'A tour mus have a name must have at least 5 characters!']
      // validate: [
      //   validator.isAlpha,
      //   'tour name must only contain alphanumeric characters'
      // ]
    },
    slug: String,
    duration: { type: String, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either:  "easy","difficult" or "medium"'
      }
    },
    ratingAvg: { type: Number, default: 4.5 },
    ratingQty: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour mus have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        //this will only point/look at new documents that are on creation part
        validator: function(val) {
          return val < this.price;
        },
        message:
          'Discount ({VALUE}) should be a smaller value than the regular price'
      }
    },
    summary: { type: String, Trim: true },
    description: { type: String, Trim: true },
    imageCover: { type: String },
    images: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: { type: Boolean, default: false }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//middleware document: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  //console.log(this);
  next();
});

//consulta os tours que nao sao secretos secreto <> true
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre('agregate', function(docs, next) {
  this.pipeline().unshift({ match: { secretTour: { $ne: true } } });
});

//creating a model for mongoose
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
