const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Public customer routes
router.get('/', menuController.getMenuByRestaurantId);
router.get('/:id', menuController.getMenuItemById);

// Admin / Restaurant Owner management routes
router.post('/', authenticate, authorizeRoles('admin', 'restaurant'), menuController.createMenuItem);
router.put('/:id', authenticate, authorizeRoles('admin', 'restaurant'), menuController.updateMenuItem);
router.delete('/:id', authenticate, authorizeRoles('admin', 'restaurant'), menuController.deleteMenuItem);

module.exports = router;
