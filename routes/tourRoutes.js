const express = require('express');
const router = express.Router();
const tourController = require('../controller/tourController') 
const authController = require('../controller/authController')

//router.param('id',checkId)

router.route('/monthly-plan')
   .get(tourController.getMonthlyplan)

router.route('/tours-stats')
   .get(tourController.getTourStats)

router.route('/top-5-cheap')
   .get(tourController.aliasTopTours,tourController.getAllTour)

router.route('/')
   .get(authController.protect,tourController.getAllTour)
   .post(tourController.newTour)

router.route('/:id')
   .delete(authController.protect,authController.restrictTo('admin'),tourController.deleteTour)
   .patch(tourController.updateTour)
   .get(tourController.getTour)

module.exports = router