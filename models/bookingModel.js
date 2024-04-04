const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must have a tour '],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must have a User '],
    },
    price: {
        type: Number,
        required: [true, 'Every booking have a price']
    },
    Created_At: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true,
    },
});
// this middleware will run for every req which is started with text "find" 
bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name',
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
console.log('hogaya')
