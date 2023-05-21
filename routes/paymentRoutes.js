const express = require('express');
const router = express.Router();
const PaymentController = require("../controller/paymentControlller")

router.route('/credit').post(PaymentController.initiateCredit)
router.route('/wallet').post(PaymentController.initiateWallet)

router.route('/callbackCredit').get(PaymentController.callback)

module.exports = router