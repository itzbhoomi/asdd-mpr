const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Customer / Authenticated user order routes
router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrderById);

// Status update (Admin or Restaurant Owner)
router.put('/:id/status', authenticate, authorizeRoles('admin', 'restaurant'), orderController.updateOrderStatus);

module.exports = router;
