/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
// eslint-disable-next-line import/order
const jwt = require('jsonwebtoken');
const Apperror = require('../utils/apperror');
const Email = require('../utils/email');
const catchasync = require('../utils/catchasync');
const { truncate } = require('fs');


//--------------------------------------------------------
//creating jwt token
const signtoken = id => jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
// send jwt through cookie
const cookieoption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
};

const createsendToken = (user, statuscode, res) => {
    const token = signtoken(user._id)
    if (process.env.NODE_ENV === 'production') cookieoption.secure = true;
    //send token in cookie 
    res.cookie('jwt', token, cookieoption);
    //remove password and date change at from output
    user.password = undefined
    user.passwordchangedAt= undefined
    res.status(statuscode).json({
        token:token,
        status: 'success',
        data: {
            user: user,
        },
    });
}
exports.logout = catchasync(async (req, res, next) => {
    res.cookie('jwt', 'logged out', {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success'});
})

exports.signup = catchasync(async (req, res,next) => {
    const newuser = await User.create(req.body); //creating for admin
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newuser, url).sendwelcome();
    // const newuser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     photo: req.body.photo,
    //     passwordConfirm:req.body.passwordConfirm,
    //     passwordchangedAt: req.body.passwordchangedAt,
    //     role:req.body.role,
    //    passwodResetToken:req.body.passwodResetToken,
    //    passwordResetExpires:req.body.passwordResetExpires,
    // }); // to reduce the security vuranability creating for public

    createsendToken(newuser, 201, res);
});

exports.login = catchasync(async (req, res, next) => {
    const { email, password } = req.body;
    
    //1)cheq if user email and password exist
    if (!email || !password) {
        return next(new Apperror('please enter the password and email', 400));
    };
    //2) cheq if user exist and password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new Apperror('Incorrect email or password', 401));
    }
    await User.findByIdAndUpdate()
    //3) if everything ok send token to client 
    createsendToken(user, 201, res);
});

/////
exports.protect = catchasync(async (req, res, next) => {
    //1) getting the token if it exist
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token=req.cookies.jwt
    }

    if (!token) return next(new Apperror('you are not login please login ', 401));


    //2)validate the token or verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


    //3)cheq if user still exists
    const currentuser = await User.findById(decoded.id);

    if (!currentuser) return next(new Apperror('user doesnot exit anymore ', 401));


    //4) cheq if user change password after the token was issued
    if (currentuser.changedPasswordAfter(decoded.iat)) {
        return next(new Apperror('please login again password changed', 401));
    };

    req.user = currentuser; // this code help to move data to other middleware in req body
    res.locals.user = currentuser;
    next();
});

exports.restrictedTo = (...roles) => (req, res, next) => {
    //roles=> ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
        return next(new Apperror('YOU dont have permission to perform this action', 403));
    }

    next();
};

exports.forgotPassword = catchasync(async (req, res, next) => {
    //1) get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new Apperror('there is  no user from this email Id'), 401);
    //2) generate the random reset token
    const resetToken = user.createPasswordResetToken();

    // save the token in database
    await user.save({ validateBeforeSave: false });
    
    // const message = `FORGOT YOUR PASSWORD ? SUBMIT  A PATCH REQUEST WITH YOUR NEW PASSWORD AND PASSWORD CONFIRM TO : ${resetURL}.\n IF  YOU DIDNOT WANT TO FORGET YOUR PASSWORD PLEASE IGNOR THIS EMAIL`;
    
    //3) send it to users stored email
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-Password/${resetToken}`;
        //     await sendEmail({
        //     email: user.email,
        //     subject: 'you password reset token(valid for 10 min) ',
        //     message,});
        await new Email(user, resetURL).Sendpasswordreset();
        res.status(200).json({
            status: 'success',
            message:'token sent to email',
        })
    } catch (err) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return new Apperror('error acur in sending mail try again later', 500);
    }

})
exports.resetPassword = catchasync(async (req, res, next) => {
    //1) get user based on token
    const hashedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwodResetToken: hashedtoken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // if (!user) return next(new Apperror('user not found in reset'), 401);
    
    //2) if token has not expired and there is user ,set new password
    if (!user) next(new Apperror('your token expire create a new token ', 500));
    

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwodResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save();
    //3)update change password at propert 
    // user.passwordchangedAt = Date.now()
    
    //4)log the user in ,send jwt
    
    createsendToken(user, 200, res);
});
exports.updatepassword = catchasync(async (req, res, next) => {
    //we must get logged in this will be insured by protect midlleware and data will pass by data req.user
    //1 get the user current password loged in
    const user = await User.findOne({ _id: req.user._id }).select('+password');

    //2 check if posted current password is correct

    if (!(await user.correctPassword(req.body.passwordCur, user.password))) {
        return next(new Apperror('password do not match'), 401)
    }


    //3 if so update 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // userfind by id and bupdate function doesnot work because it doesnot woryk on update functionality


    //4 log user in send bjwt
    createsendToken(user, 200, res);
});
exports.isLoggedIn = (async (req, res, next) => {

    if (req.cookies.jwt) {
        try {
            if (!req.cookies.jwt) return next(new Apperror('you are not login please login ', 401));

            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
        
            //3)cheq if user still exists
            const currentuser = await User.findById(decoded.id);
        
            if (!currentuser) return next();
        
        
            //4) cheq if user change password after the token was issued
            if (currentuser.changedPasswordAfter(decoded.iat)) {
                return next();
            };
            // there is logged in user
            res.locals.user = currentuser   // passing data in local pug template
            next();
        } catch {
            next();
        }

    }
    else {
        next();
    }
});