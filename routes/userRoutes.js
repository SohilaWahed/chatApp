const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

router.route('/').get(userController.getAllUser);
router.route('/UserDeleted').get(userController.getAllDeletedUser);
router.get('/updateMe',authController.protect,userController.getDataUpdate)
router.patch('/updateMe',authController.protect,userController.updateMe)
router.delete('/deleteMe',authController.protect,userController.deleteMe)

router.post('/signUp',authController.signUp);
router.post('/login',authController.login);
router.post('/forgotpassword',authController.forgotPassword);
router.post('/CheckEmailOrPhone',authController.CheckEmailOrPhone);
router.post('/verifyEmailOtp',authController.verifyEmailOtp);
router.patch('/resetpassword',authController.protect,authController.resetPassword);
router.patch('/updatePassword',authController.protect,authController.updatePassword);
router.post('/logout',authController.protect,authController.logOut);

module.exports = router;
