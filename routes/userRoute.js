const express = require('express');
const controller = require('../controllers/userController');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const reviewRoute = require('./reviewRoute');
const apartmentRoute = require('./apartmentRoute');

const router = express.Router();

// NESTED ROUTES
router.use('/:userId/reviews', reviewRoute);
router.use('/:landlordId/apartments', apartmentRoute);
// ------

router.post('/signup', authController.signup);
router.get('/status', authController.isLoggedIn);
router.get('/logout', authController.logout);

const limit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests from you IP. Please try again later'
});

router.post('/login', limit, authController.login);
router.post('/forgotPassword', limit, authController.forgotPassword);
router.patch('/resetMyPassword/:token', limit, authController.resetPassword);

router.get('/me', controller.getMe, controller.getOne);
router.patch('/updateMe', controller.updateMe, controller.updateOne);
router.patch('/updatePassword', controller.updateMyPassword);

router
  .route('/favorites')
  .get(authController.protect, controller.getFavorites)
  .post(authController.protect, controller.addToFavorites)
  .delete(authController.protect, controller.removeFavorite);

router
  .route('/')
  .get(authController.protect, controller.getAll)
  .post(authController.protect, controller.createOne);

router
  .route('/:id')
  .get(controller.getOne)
  .patch(authController.protect, controller.updateOne)
  .delete(authController.protect, controller.deleteOne);

module.exports = router;