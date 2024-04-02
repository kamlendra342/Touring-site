const express = require('express');
const bookingcontroller = require('../controller/bookingcontroler');
const authController = require('../controller/authcontroller');

const router = express.Router();

router.post(
  '/checkout-session/:tourId',
  authController.protect,
  bookingcontroller.getchechoutsession,
);
module.exports = router;