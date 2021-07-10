const express = require('express');
const controller = require('../controllers/reviewsController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    controller.getForUser,
    controller.getAllReviews
  )
  .post(
    authController.protect,
    authController.restrictTo(['user', 'admin']), 
    controller.setUserId,
    controller.postReview
  );

router
  .route('/:id')
  .get(controller.getReview)
  .patch(
    authController.protect, 
    authController.restrictTo(['user']),
    controller.setUserId,
    controller.updateReview
  )
  .delete(
    authController.protect, 
    authController.restrictTo(['admin', 'user']), 
    controller.deleteReview
  );

module.exports = router;