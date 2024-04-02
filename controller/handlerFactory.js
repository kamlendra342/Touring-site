const Apperror = require("../utils/apperror");
const catchasync = require("../utils/catchasync");
const API_featurs = require('../utils/apiFeaturs');

//All these will export the function this is called handler factory
exports.deleteOne = Model => catchasync(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new Apperror('No tour found by this ID', 404));
  }
  res.status(204).json({
    status: 'success',
    message: 'Tour is Deleted',
  });
});

exports.updateOne = Model =>
  catchasync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //it run all validator before updating
    });
    if (!doc) {
      return next(new Apperror('No document found by this ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne=Model=> catchasync(async (req, res, next) => {
  const doc = await Model.create(req.body);
  res.status(201).json({
    staus: 'success',
    data: {
      data: doc,
    },
  });
});

exports.getOne = (Model, popOption) => catchasync(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  // populate get data according to id from user in guides parameter
  if(popOption) query= query.populate(popOption);
  const doc = await query; 
  if (!doc) {
    return next(new Apperror('No documentation found by this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data:doc
  });
});

exports.getAll = Model => catchasync(async (req, res, next) => {
  //to allow for nested route(trick)
  let filter;
  if (req.params.tourId) filter = { tour: req.params.tourId }
  const features = new API_featurs(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitfield()
    .paginate();
  const doc = await features.query;

  res.status(200).json({
    RequestedAt: req.requestTime,
    results: doc.length,
    status: 'success',
    data: {
      data:doc,
    },
  });
});
