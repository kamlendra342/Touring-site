const Tour = require('../models/tourModel');
// eslint-disable-next-line camelcase
const API_featurs = require('../utils/apiFeaturs');
const Apperror = require('../utils/apperror');

// eslint-disable-next-line import/extensions
const catchasync = require('../utils/catchasync.js');
const Factory = require('./handlerFactory');

//--------------------------------------------------------------------
const sharp = require('sharp');
const multer = require('multer');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Apperror('Not an Image Please upload a image', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter:multerFilter
});

exports.uploadtourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchasync(async(req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}cover.jpeg`;
  
  // coverimage processing
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333).toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // 2 Image
  req.body.images = [];

  await Promise.all(req.files.images.map(async(file,i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    
    await sharp(req.files.images[i].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);
    req.body.images.push(filename);
  }));

  next();
});














//--------------------------------------------------------------------

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  next();
};

//--------------------------------------------------------------------
exports.getalltour = Factory.getAll(Tour);
//handler.deleteone is handler function mean returning  a function
exports.gettour = Factory.getOne(Tour, { path: 'reviews' });
exports.createTour = Factory.createOne(Tour);
exports.updatetour = Factory.updateOne(Tour);
exports.deletetour = Factory.deleteOne(Tour);

//---------------------------------------------------------------------
//Aggregation Pipeline
exports.getTourStats = catchasync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { price: { $gte: 100 } } }, //cheq statement
    //on the basis of "id" remaing element are grouped
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: 'ratingQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: `$price` },
        minPrice: { $min: `$price` },
        maxPrice: { $max: `$price` },
      },
    },
    { $sort: { avgPrice: 1 } },
    // { $match: { _id: { $ne: 'EASY' } } },
  ]);
  res.status(200).json({
    status: 'succesfull',
    data: {
      stats,
    },
  });
});

//--------------------------------------------------------------------
exports.getMonthlyPlan = catchasync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' }, //cheq statement

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numToursStart: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'succesfull',
    data: {
      plan,
    },
  });
});

exports.gettourswithin = catchasync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(Apperror('Lattitude and logitude are not givven', 500))
  };
  const radius = unit === `mi` ? distance / 3963.2 : distance / 6378.1;

  const Tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat],radius] } } });

  res.status(200).json({
    status: "success",
    results: Tours.length,
    data: {
      data:Tours
    }
  })
});

exports.getDistance = catchasync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === `mi` ? 0.000621371: 0.001;

  if (!lat || !lng) {
    next(Apperror('Lattitude and logitude are not givven', 500))
  };

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier:multiplier
      }
    }, {
      $project: {
        distance: 1,
        name:1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data:distances
    }
  })
});