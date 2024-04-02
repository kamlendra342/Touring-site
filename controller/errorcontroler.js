/* eslint-disable prettier/prettier */

const Apperror = require("../utils/apperror");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value} .`
  return new Apperror(message, 400);
}
const handleDuplicateErrorDB = err => {
  console.log(err.stack);
  const message = `Duplicate field value: "${err.keyValue.name}"    please enter another `
  return new Apperror(message, 400);
}
const handleValidationeError = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid Input :   ${errors.join(' , ')}`
  return new Apperror(message, 400);
};

const handleJWTError = () => new Apperror('Invalid token. please login again', 401);

const handleJWTExpError = () => new Apperror('token expired Login timeout Login || again', 401);


const sendErrorDev = (err, res) => {
  if (res.req.originalUrl.startsWith('/api')) { 
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //RENDER WEBSITE
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    })
  }
};


const sendErrorProd = (err, res) => {
  if (res.req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error("ERROR  🚨🚨🚨🚨\n");
    // generic message unknow err
    return res.status(500).json({
      status: "error",
      message: 'SOMETHING WENT VERY WRONG',
    });
  } else {
    if (err.isOperational) { //rendr website
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg:err.message
      })
    } else {
      console.error("ERROR  🚨🚨🚨🚨\n");
      // generic message unknown err
      return res.status(500).json({
        status: "error",
        message: 'SOMETHING WENT VERY WRONG',
      })
    }
  }
};

//--------------------------------------------------------------------
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };// here the deep copie of err is not created
    error.message = err.message; // trick by me
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    if (err.code === 11000) error = handleDuplicateErrorDB(err);
    
    if (err.name === 'ValidationError') error = handleValidationeError(err);
    if (err.name === 'JsonWebTokenError') {error = handleJWTError(err)
    };
    if (err.name === 'TokenExpiredError') {error = handleJWTExpError(err)
    };
    sendErrorProd(error, res);
  };
};
