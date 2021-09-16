const express = require('express');
const controller = require('../controllers/reviewsController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    controller.getReviewForApartment,
    controller.getReviewForUser,
    controller.getAllReviews
  )
  .post(
    authController.protect,
    authController.restrictTo(['user', 'admin']), 
    controller.setPosterId,
    controller.postReview
  );

router
  .route('/:id')
  .get(controller.getReview)
  .patch(
    authController.protect, 
    authController.restrictTo(['user']),
    controller.setPosterId,
    controller.updateReview
  )
  .delete(
    authController.protect, 
    authController.restrictTo(['admin', 'user']), 
    controller.deleteReview
  );

module.exports = router;