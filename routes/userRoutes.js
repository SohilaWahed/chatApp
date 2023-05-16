const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

router.route('/').get(userController.getAllUser);
router.route('/UserDeleted').get(userController.getAllDeletedUser);
router.get('/updateMe',authController.protect,userController.getDataUpdate)
router.patch('/updateMe',authController.protect,userController.updateMe)
router.delete('/deleteMe',authController.protect,userController.deleteMe)


router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPasssword);
//router.patch('/resetpassword/:token',authController.resetPasssword)
router.patch('/resetPasswordOtp', authController.resetPassswordOtp);
router.patch('/updateMyPassword',authController.protect,authController.updatePassword)

/****************************************************************************/
router.post('/SearchEmailforgetPassword', authController.SearchEmailOrPhone);
router.post('/ChooseEmailOrPhone', authController.chooseEmailOrPhone);
router.post('/verifyResetCode', authController.verifyPassResetCode);
router.patch('/resetPassword', authController.resetPassword);

module.exports = router;
