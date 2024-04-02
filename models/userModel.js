/* eslint-disable prettier/prettier */
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt');

//--
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true,"please enter your name"],
        trim: true,
    },
    email: {
        type: String,
        require: [true,"please enter your email"],
        trim: true,
        unique: true,
        lowercase:true,
        validate: {
            validator: validator.isEmail,
            message:'Please enter a  Valid Email',
        }
    },
    photo: {
        type: String,
        default:'default.jpg'
        // validate:[validator.isURL,'valid url'],
    },
    role: {
        type: String,
        enum: ["user",'guide','lead-guide','admin'],
        default:'user',
    },
    password: {
        type: String,
        required:  [true,"please enter a Valid Password"],
        minlength: [5, "password must be greater than 5 character"],
        select:false,
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            // this will not work for update only for save/create
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password do not matches'
        },
    },
    passwordchangedAt: {
        type: Date,
    },
    passwodResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select:false,
    }
},);
//---------------------------------------------------------
// pasword encryption
//1
UserSchema.pre('save', async function (next) {
    // run this if password is modified
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);//incription accur here
    // delete the password confirmed field
    this.passwordConfirm = undefined;
});

//instance method: available to all document of certain type
// this will return only true or false

//2  instance model
UserSchema.methods.correctPassword = function (candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
};

//3 instance model
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordchangedAt) {
        const changeTimestamp = parseInt(this.passwordchangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changeTimestamp;
    }
    return false;
};

//4) instance model for forgot password
UserSchema.methods.createPasswordResetToken = function () {

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwodResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
    
};
// use show only active user whenever find query run at anywhere in route
UserSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
    
});

//5)
UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordchangedAt = Date.now() - 1000;
    next();
})


//CREATING THE USER MODEL
const User = mongoose.model('User', UserSchema);

module.exports = User;