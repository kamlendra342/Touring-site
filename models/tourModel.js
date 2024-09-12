/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

const slugify = require('slugify');

// const User = require('./userModel');

// eslint-disable-next-line import/no-extraneous-dependencies
// const validator = require('validator');

// defining the schema
const TourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], // validators
        unique: true,
        trim: true,
        maxlength: [60, 'A tour name dont exceed 60 charachter'],
        minlength: [10, 'A tour must have 10 character'],
        // validate:[validator.isAlpha,"Tour name only contain char"],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group Size ']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message:'difficulty is either easy ,medium or difficult'}
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [0, 'rating must be above 0.0'],
        max:[5,'rating must be below 5.0'],
    },
    price: {
        type: Number,
        required: [true, 'Tour must have a price'],
    },
    PriceDiscount: {
        type: Number,
        validate: {
            //creating own validator
            //this validator dont work on update it give an error
            validator: function (value) {
            return value<this.price
            },

            message:`discount ({VALUE}) cant be greater than price${this.price}`
        }
    },
    summary: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'Image is required'],
    },
    images: [String],
    CreatedAt: {
        type: Date,
        default: Date.now(), // mongo will convert time into actual format
        select: false, // setting default selection as false it will not show on general
    },
    startDates: [Date],
    ratingsQuantity: Number,
    secretTour: {
        type: Boolean,
        default: false,
    },
    //creating embedded data fields in model 
    startLocation: {
        //geolocation
        type: {
            type: String,
            default: 'Point',
            enum:['Point'],
        },
        coordinates: {
            type: [Number],
        },
        address: String,
        description: String,
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum:['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day:Number,
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref:'User' // to connect to user
        }
    ],
},
//setting the virtualisation properties in schema so it can accept the virtual fields
{
    toJSON: { virtuals: true },
    toObject:{virtuals:true},
});

//------------------------------------------



//---------------------------------------------------------------------
//VERTIUAL PROPERTIES: is used to create a field from existing field from database; to have virual properties we have to explicitly tell aour schema to use vitual properties

// Setting the toJSON option for virtuals(another way )
// TourSchema.set('toJSON', { virtuals: true });
TourSchema.virtual('durationweeks').get(function () {
    return this.duration / 7; // we dont use arrow fn because we have to use this keyword here 
});
// this is virtual populate 
TourSchema.virtual('reviews', {
    ref: 'review',
    foreignField: 'tour',
    localField: '_id'
});

//---------------------------------------------------------------------
TourSchema.index( { startLocation : "2dsphere" } )






//---------------------------------------------------------------------

//DOCUMENT MDDLEWARE Or HOOKS :runs before .save() and .create() operation 
TourSchema.pre('save', function (next) {
    // console.log(this) this point to currently process doc.or req.body
    this.slug = slugify(this.name, { lower: true });

    next()
});



// // embeding (optional)
// TourSchema.pre('save', async function (next) {
//     const guidesPromise = this.guides.map(async (id) =>await User.findById(id));
//     this.guides = await Promise.all(guidesPromise);
//     next();
// })
//--------------------------------------------------------------------

//QUERY MIDDLEWARE: made changes in query
TourSchema.pre(/^find/, function (next) {
    // TourSchema.pre('find', function (next) {
    // this.find({ secretTour: { $ne: true } })
    this.start = Date.now();
    next();
});

//populatieon is done here for tour 
TourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordchangedAt',
    });
    next();
});

TourSchema.post(/^find/, function (docs, next) {
    // TourSchema.pre('find', function (next) {
    // console.log(docs);
/*     console.log(`query Took ${Date.now() - this.start} millsec`); */
    next();
});

//---------------------------------------------------------------------

//AGGREGATION MIDDLEWARE
// TourSchema.pre('aggregate', function (next) {
//     this._pipeline.unshift({$match:{secretTour:{$ne:true}}})
//     console.log(this._pipeline)
//     next()
// })




//--------------------------------------------------------------------
//creating model based on the schema
const Tour = mongoose.model('Tour', TourSchema);
module.exports = Tour;
