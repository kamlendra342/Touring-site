/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
const catchasync = require('../utils/catchasync');
const sharp = require('sharp'); // for  image resiging
const User = require('../models/userModel');
const Apperror = require('../utils/apperror')
const Factory = require('./handlerFactory');
// const bcrypt = require('bcrypt');

const multer = require('multer');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-67686abcdjh-34347565.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// });
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


exports.uploaduserphoto=upload.single('photo')


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

exports.updateMe = catchasync(async (req, res, next) => {
/*     console.log(req.file)
    console.log(req.body) */
    //1)create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
        next(new Apperror('you cant update the password here', 500))
    }
    //2) filter out unwanted fields that are not allowed to get updated . update user document 
    const filterBody = filterObj(req.body, 'name', 'email');

    if (req.file) filterBody.photo = req.file.filename;
    const updateduser = await User.findByIdAndUpdate(req.user._id, filterBody, {
        runValidators: true,
        new: true,
    });
/*     console.log(updateduser); */
    res.status(200).json({
        status: "success",
        updateduser,
    })
    
});

exports.resizeUserphoto = catchasync( async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
    
    next();
});


exports.deleteMe = catchasync(async (req, res,next) => {
    const user = await User.findByIdAndUpdate(req.user._id, {active :false},{
        runValidators: true,
        new:true,
    });
    res.status(204).json({
        status: 'success',
        message: 'user is deactivated',
    });
});


exports.createUser = (req, res, next) => {
    res(500).json({
        status: "error",
        message: "this route is not defined please use  /signup insted "
    });
};


exports.getAllusers = Factory.getAll(User);
exports.getusers = Factory.getOne(User);
//dont update password from here
exports.updateUser = Factory.updateOne(User);
exports.deleteUser = Factory.deleteOne(User);