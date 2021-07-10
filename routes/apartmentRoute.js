const express = require('express');
const controller = require('../controllers/apartmentController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get('/popular', controller.getPopular, controller.getAll);

router
  .route('/')
  .get(controller.setForLandlord, controller.getAll)
  .post(
    authController.protect, 
    // authController.restrictTo(['admin', 'landlord']), 
    controller.setLandlordId,
    controller.restructureDocumentForDB,
    controller.createOne
  );

router
  .route('/:id')
  .get(controller.getApartment)
  .patch(
    authController.protect,
    // authController.restrictTo(['admin', 'landlord']),
    controller.receiveImages,
    controller.resizeImages,
    controller.updateOne
  )
  .delete(
    authController.protect, 
    authController.restrictTo(['admin']), 
    controller.deleteOne
  );

module.exports = router;