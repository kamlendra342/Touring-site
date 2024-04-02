const express = require('express');
const usercontroler = require('../controller/usercontroller');
const authcontroller = require('../controller/authcontroller');

//--------------------------------------------------
const router = express.Router();

router.route('/signup').post(authcontroller.signup);
router.route('/login').post(authcontroller.login);

router.route('/logout').get(authcontroller.logout);

router.route('/forgotPassword').post(authcontroller.forgotPassword);
router.route('/reset-Password/:token').patch(authcontroller.resetPassword);

///////////
router.use(authcontroller.protect); // all middleware below required authentication

router.patch('/updateMyPassword', authcontroller.updatepassword);

router.get('/me', usercontroler.getMe, usercontroler.getusers);

router.patch('/updateMe',usercontroler.uploaduserphoto ,usercontroler.resizeUserphoto, usercontroler.updateMe);
router.delete('/deleteMe', usercontroler.deleteMe);

router.use(authcontroller.restrictedTo('admin'));
//from here all below middleware are ristriected to admin
router.route('/').get(usercontroler.getAllusers);
router
  .route('/:id')
  .delete(usercontroler.deleteUser)
  .patch(usercontroler.updateUser)
  .get(usercontroler.getusers);

module.exports = router;
