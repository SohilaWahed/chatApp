const messageController = require('../controller/messageController');
const authController = require('../controller/authController');
const express = require('express')
const router = express.Router()

router.route('/').post(authController.protect,messageController.sendMessage)
router.route('/:chatId').get(authController.protect,messageController.allMessages)


module.exports = router