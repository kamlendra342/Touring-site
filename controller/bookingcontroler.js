const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchasync = require("../utils/catchasync");
const booking = require('../models/bookingModel');
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
exports.getchechoutsession = catchasync(async (req, res, next) => {
    //1. Get the currently bookedd tour
    const tour = await Tour.findById(req.params.tourId);
    //2. create chechout session
    const session = await stripe.checkout.sessions.create({
        mode:'payment',
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                      name: `${tour.name} Tour`,
                      description: tour.summary,
                      images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`], // this will change
                    },
                },
                quantity: 1,
            }
        ]
    });
    //3. Create session is response
    res.status(200).json({
        status: "success",
        session,
    });
});

exports.createBookingCheckout = catchasync(async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();

    await Booking.create({ tour, user, price });


    res.redirect(`${req.protocol}://${req.get('host')}/`);
})