const express = require('express');
const controller = require('../controllers/dormitoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/popular', 
  controller.setForPopular, 
  controller.getDorms
);

router
  .route('/')
  .get(controller.getDorms)
  .post(
    authController.protect,
    authController.restrictTo(['admin', 'landlord']),
    controller.createDorm
  );

router
  .route('/:id')
  .get(controller.getDorm)
  .patch(
    authController.protect,
    authController.restrictTo(['admin', 'landlord']),
    controller.updateDorm
  )
  .delete(
    authController.protect,
    authController.restrictTo(['admin', 'landlord']),
    controller.deleteDorm
  );

module.exports = router;