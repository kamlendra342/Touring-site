const Tour = require('../models/tourModel');
const catchasync=require('../utils/catchasync')
const Apperror = require('../utils/apperror');
const Booking = require('../models/bookingModel');

exports.getOverview = async(req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tour',
        tours
    });
};

exports.gettour = catchasync(async(req, res,next) => {
    const { slug } = req.params;
    let query = Tour.findOne({ slug: slug }).populate({
        path: 'reviews',
        fields:'review rating user'
    });
    // get tour data including reviews and guide
    const tour = await query

    if (!tour) {
        return next(new Apperror('there is no tour by ths name ','404'))
    }


    res.status(200).render('tour', {
        title: slug.toUpperCase(),
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title:'Log into your account',
    })
}

exports.getAccount = (req, res, next) => {
    res.status(200).render('account', {
        title: 'Your Account',
    })
};

exports.getSignupForm = (req, res) => {
    res.status(200).render('signUP', {
        title: 'Sign Up'
    })
};

exports.getMyBookedtour = async (req, res, next)=> {
    // find all the bookings
    const bookings = await Booking.find({ user: req.user.id });

    // find tours and return ids
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } })
    
    res.status(200).render('overview',{
        title: 'My Booking',
        tours,
    })
};



  