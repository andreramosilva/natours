const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

//router.param('id', tourController.checkID);

// const checkBody = (req, res, next) => {
//   console.log('passou no check body');
//   // if (!req.params.name && !req.params.price) {
//   //   return res.status(404).json({
//   //     status: 'error',
//   //     message: 'invalid body'
//   //   });
//   // }
//   next();
// };

router
  .route('/top5cheap')
  .get(tourController.getAliasTours, tourController.getAllTours);

router.route('/tourStats').get(tourController.getToursStats);

router.route('/busiestMonth/:year').get(tourController.busiestMonth);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  //.post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
