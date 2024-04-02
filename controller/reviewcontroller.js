const review = require('../models/reviewModel');
const catchasync = require('../utils/catchasync');
const Factory = require('./handlerFactory');

// creatinng review based on the login user and tour
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.User = req.user.id;
  next();
};

exports.getallreview = Factory.getAll(review);
exports.getreview = Factory.getOne(review);
exports.createReview = Factory.createOne(review);
exports.deletereview = Factory.deleteOne(review);
exports.updatereview = Factory.updateOne(review);
