const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Public customer routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/menu', menuController.getMenuByRestaurantId);

// Admin / Restaurant Owner management routes
router.post('/', authenticate, authorizeRoles('admin', 'restaurant'), restaurantController.createRestaurant);
router.put('/:id', authenticate, authorizeRoles('admin', 'restaurant'), restaurantController.updateRestaurant);
router.delete('/:id', authenticate, authorizeRoles('admin'), restaurantController.deleteRestaurant);

module.exports = router;
