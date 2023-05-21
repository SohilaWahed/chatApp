const chatController = require('../controller/chatController');
const authController = require('../controller/authController');
const express = require('express');
const router = express.Router();
const multer = require('multer')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, "./uploads")
    },
    filename:(req,file,cb) =>{
        cb(null, Date.now() + ".jpg")
    },
})
const upload = multer({
    storage:storage
})

router.route('/addimage').post(upload.single("img"),(req,res)=>{
    try{
        res.json({path: req.file.filename})
    }catch(e){
        return res.json({error:e})
    }
})

router.route('/:id').post(authController.protect,chatController.accesChat)
router.route('/').get(authController.protect,chatController.allChats)
router.route('/').delete(authController.protect,chatController.deleteAllChats)
router.route('/:id').delete(authController.protect,chatController.deleteChat)

router.route('/group').post(authController.protect,chatController.createGroupChat)
router.route('/rename').put(authController.protect,chatController.renameGroup) 
router.route('/groupremove').put(authController.protect,chatController.removeFromGroup)
router.route('/groupadd').put(authController.protect,chatController.addToGroup)

module.exports = router