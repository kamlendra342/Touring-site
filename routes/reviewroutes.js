const express = require('express');
const reviewcontroler = require('../controller/reviewcontroller');
const authController = require('../controller/authcontroller');

const router = express.Router({ mergeParams: true }); //merge params get parameter from previous middle ware parameter on the path of route

router.use(authController.protect);

router
  .route('/')
  .get(reviewcontroler.getallreview)
  .post(
    authController.restrictedTo('user'),
    reviewcontroler.setTourUserIds,
    reviewcontroler.createReview,
  );

router
  .route('/:id')
  .get(reviewcontroler.getreview)
  .patch(
    authController.restrictedTo('admin', 'user'),
    reviewcontroler.updatereview,
  )
  .delete(
    authController.restrictedTo('admin', 'user'),
    reviewcontroler.deletereview,
  );

module.exports = router;
