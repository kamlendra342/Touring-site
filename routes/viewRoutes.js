const express = require('express');
const router = express.Router();
const viewscontroller = require('../controller/viewscotroller');
const authcontroller = require('../controller/authcontroller');
const bookingcontroller = require('../controller/bookingcontroler');



router.use(authcontroller.isLoggedIn,);

router.get('/tour/:slug', authcontroller.isLoggedIn, viewscontroller.gettour);

router.get('/', bookingcontroller.createBookingCheckout, authcontroller.isLoggedIn, viewscontroller.getOverview);

router.get('/login',authcontroller.isLoggedIn, viewscontroller.getLoginForm)
router.get('/me', authcontroller.protect, viewscontroller.getAccount);
router.get('/signup', viewscontroller.getSignupForm);

//booking related route
router.get('/my-tours',authcontroller.protect,viewscontroller.getMyBookedtour)


module.exports=router
