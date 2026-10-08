const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Admin-only management endpoints
router.get('/orders', authenticate, authorizeRoles('admin'), orderController.getAllOrdersAdmin);

module.exports = router;
