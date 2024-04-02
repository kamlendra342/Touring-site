/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Tour = require('./tourModel');


const reviewschema = new mongoose.Schema({
    review: {
        type: String,
        require: [true, 'review cant be empty'],
    },
    rating: {
        type: Number,
        min: [1, 'rating cant be less than 1'],
        max:[5,'rating cant be greater than 5'],
    },
    createdAt: {
        type: Date,
        default: Date.now,  
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require:[true,'Review must be belong to a tour']
    },
    User: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require:[true,'Review must be belong to a User']
    },

},{
//setting the virtualisation properties in schema so it can accept the virtual fields
toJSON: {virtuals: true},
toObject:{virtuals:true},
});

//preventing duplicate reviews 
// this line will stop the duplicate(multiple review on same tour) review from a user 
reviewschema.index({User:1,tour:1}, { unique: true });

//populating user and tour at all query started with "find" keyword
reviewschema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select:"name",  // only selected field will be shown from tour
    // }).populate({
    //     path: 'User',
    //     select:"name photo", //only selected field will be shown from user
    // })
    this.populate({
        path: 'User',
        select: "name photo", //only selected field will be shown from user
    })
    next();
});
// this is static model directly called on the model
reviewschema.static('calcAveragerating', async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: 'tour',
                nrating: { $sum: 1 },
                Avgrating: { $avg: '$rating' }
            },
        }
    ]);
    if (stats.length>0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].Avgrating,
            ratingsQuantity: stats[0].nrating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0,
        });
    };  
});

reviewschema.post('save', function () {
    this.constructor.calcAveragerating(this.tour);
});

//findBYid and update
// find by id and delete
//UPDATING THE RATING WITH CHANGE IN UPDATE RATING 
reviewschema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next()
});
reviewschema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAveragerating(this.r.tour);
});




const Review = mongoose.model('review', reviewschema);

module.exports = Review;