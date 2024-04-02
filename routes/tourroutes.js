const express = require('express');
const tourcontroller = require('../controller/tourcontroller');
const authcontroller = require('../controller/authcontroller');
// const reviewcontroller = require('../controller/reviewcontroller');
const reviewrouter = require('./reviewroutes');

const router = express.Router();

//IMPLEMENTING NESTED ROUTES

// router
//   .route('/:tourId/reviews')
//   .post(
//     authcontroller.protect,
//     authcontroller.restrictedTo('user'),
//     reviewcontroller.createReview,
//   );

router.use('/:tourId/reviews', reviewrouter);

//--------------------------------------------------------------------------------
// creating param middlewer which cheq wen sertain parameter are present in the url
// router.param('id', tourcontroller.cheqid);
router.route('/Tour-stats').get(tourcontroller.getTourStats);
router
  .route('/Mounthly-Plan/:year')
  .get(
    authcontroller.protect,
    authcontroller.restrictedTo('admin', 'lead-guide', 'guide'),
    tourcontroller.getMonthlyPlan,
  );

router
  .route('/top_5_cheap')
  .get(tourcontroller.aliasTopTour, tourcontroller.getalltour);
//
router
  .route('/')
  .get(tourcontroller.getalltour)
  .post(
    authcontroller.protect,
    authcontroller.restrictedTo('admin', 'lead-guide'),
    tourcontroller.createTour,
);
router.route('/distances/:latlng/unit/:unit').get(tourcontroller.getDistance);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourcontroller.gettourswithin);

router
  .route('/:id')
  .get(tourcontroller.gettour)
  .patch(
    authcontroller.protect,
    authcontroller.restrictedTo('admin', 'lead-guide'),
    tourcontroller.uploadtourImages,tourcontroller.resizeTourImages,
    tourcontroller.updatetour,
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictedTo('admin', 'lead-guide'),
    tourcontroller.deletetour,
  );

module.exports = router;
