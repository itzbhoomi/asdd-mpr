const { pool } = require('../config/db');

// Helper to format order for frontend compatibility
const formatOrder = (order, items = []) => {
  return {
    id: order.id,
    user_id: order.user_id,
    customer_name: order.customer_name || null,
    customer_email: order.customer_email || null,
    restaurant_id: order.restaurant_id,
    restaurant_name: order.restaurant_name || null,
    total: parseFloat(order.total_amount),
    total_amount: parseFloat(order.total_amount),
    status: order.status,
    address: order.delivery_address,
    delivery_address: order.delivery_address,
    date: order.created_at,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items: items.map(i => ({
      id: i.menu_item_id || i.id,
      order_item_id: i.id,
      name: i.name,
      price: parseFloat(i.price),
      quantity: i.quantity,
      image: i.image || null
    }))
  };
};

// POST /api/orders (Authenticated customer)
const createOrder = async (req, res, next) => {
  let connection;
  try {
    const userId = req.user.id;
    const { restaurant_id, restaurantId, items, address, delivery_address } = req.body;

    const targetRestaurantId = restaurant_id || restaurantId;
    const deliveryAddress = (address || delivery_address || '').trim();

    if (!targetRestaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required.'
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required.'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // Verify restaurant exists
    const [restaurantRows] = await pool.query('SELECT id, name FROM restaurants WHERE id = ?', [targetRestaurantId]);
    if (restaurantRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Restaurant #${targetRestaurantId} not found.`
      });
    }

    // Extract item IDs and quantities
    const itemIds = items.map(item => item.id || item.menu_item_id);
    const itemQuantityMap = new Map();

    for (const item of items) {
      const id = item.id || item.menu_item_id;
      const quantity = parseInt(item.quantity, 10);
      if (!id || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item format or quantity.'
        });
      }
      itemQuantityMap.set(id, (itemQuantityMap.get(id) || 0) + quantity);
    }

    // Query real prices from MySQL (DO NOT trust client-supplied prices)
    const [menuRows] = await pool.query(
      `SELECT id, restaurant_id, name, price, availability
       FROM menu_items
       WHERE id IN (?) AND restaurant_id = ?`,
      [Array.from(itemQuantityMap.keys()), targetRestaurantId]
    );

    if (menuRows.length !== itemQuantityMap.size) {
      return res.status(400).json({
        success: false,
        message: 'One or more items do not belong to this restaurant or do not exist.'
      });
    }

    for (const m of menuRows) {
      if (!m.availability) {
        return res.status(400).json({
          success: false,
          message: `Item "${m.name}" is currently unavailable.`
        });
      }
    }

    // Calculate subtotal from DB prices
    let subtotal = 0;
    const preparedItems = [];

    for (const m of menuRows) {
      const quantity = itemQuantityMap.get(m.id);
      const itemPrice = parseFloat(m.price);
      subtotal += itemPrice * quantity;

      preparedItems.push({
        menu_item_id: m.id,
        name: m.name,
        price: itemPrice,
        quantity
      });
    }

    const deliveryFee = 50.00;
    const totalAmount = subtotal + deliveryFee;

    // Execute atomic transaction in MySQL
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, restaurant_id, total_amount, status, delivery_address)
       VALUES (?, ?, ?, 'PLACED', ?)`,
      [userId, targetRestaurantId, totalAmount, deliveryAddress]
    );

    const orderId = orderResult.insertId;

    for (const item of preparedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.menu_item_id, item.quantity, item.price]
      );
    }

    await connection.commit();

    const createdOrder = formatOrder(
      {
        id: orderId,
        user_id: userId,
        restaurant_id: targetRestaurantId,
        restaurant_name: restaurantRows[0].name,
        total_amount: totalAmount,
        status: 'PLACED',
        delivery_address: deliveryAddress,
        created_at: new Date()
      },
      preparedItems
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: createdOrder
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// GET /api/orders (Customer's orders or restaurant's orders)
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let orderQuery = '';
    let queryParams = [];

    if (userRole === 'admin') {
      orderQuery = `
        SELECT o.*, u.name AS customer_name, u.email AS customer_email, r.name AS restaurant_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN restaurants r ON o.restaurant_id = r.id
        ORDER BY o.created_at DESC
      `;
    } else if (userRole === 'restaurant') {
      orderQuery = `
        SELECT o.*, u.name AS customer_name, u.email AS customer_email, r.name AS restaurant_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE r.owner_id = ?
        ORDER BY o.created_at DESC
      `;
      queryParams = [userId];
    } else {
      orderQuery = `
        SELECT o.*, u.name AS customer_name, u.email AS customer_email, r.name AS restaurant_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `;
      queryParams = [userId];
    }

    const [orderRows] = await pool.query(orderQuery, queryParams);

    if (orderRows.length === 0) {
      return res.status(200).json([]);
    }

    const orderIds = orderRows.map(o => o.id);

    // Fetch items for all these orders
    const [itemRows] = await pool.query(
      `SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.price, m.name, m.image
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = new Map();
    for (const item of itemRows) {
      if (!itemsByOrder.has(item.order_id)) {
        itemsByOrder.set(item.order_id, []);
      }
      itemsByOrder.get(item.order_id).push(item);
    }

    const formattedOrders = orderRows.map(o =>
      formatOrder(o, itemsByOrder.get(o.id) || [])
    );

    res.status(200).json(formattedOrders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id (Customer/Admin/Owner order details)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [orderRows] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email, r.name AS restaurant_name, r.owner_id AS restaurant_owner_id
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found.`
      });
    }

    const order = orderRows[0];

    // Authorization check: Customer can only view their own order
    if (userRole === 'customer' && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view another customer’s order.'
      });
    }

    // Restaurant can only view orders for their restaurant
    if (userRole === 'restaurant' && order.restaurant_owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view orders for other restaurants.'
      });
    }

    const [itemRows] = await pool.query(
      `SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.price, m.name, m.image
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE oi.order_id = ?`,
      [id]
    );

    const formatted = formatOrder(order, itemRows);
    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status (Admin or Restaurant Owner)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const [orderRows] = await pool.query(
      `SELECT o.*, r.owner_id AS restaurant_owner_id
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found.`
      });
    }

    const order = orderRows[0];

    if (req.user.role === 'restaurant' && order.restaurant_owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update orders for your own restaurant.'
      });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    res.status(200).json({
      success: true,
      message: `Order #${id} status updated to ${status}.`,
      status
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders (Admin only)
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const [orderRows] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email, r.name AS restaurant_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN restaurants r ON o.restaurant_id = r.id
       ORDER BY o.created_at DESC`
    );

    if (orderRows.length === 0) {
      return res.status(200).json([]);
    }

    const orderIds = orderRows.map(o => o.id);
    const [itemRows] = await pool.query(
      `SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.price, m.name
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = new Map();
    for (const item of itemRows) {
      if (!itemsByOrder.has(item.order_id)) {
        itemsByOrder.set(item.order_id, []);
      }
      itemsByOrder.get(item.order_id).push(item);
    }

    const formatted = orderRows.map(o => formatOrder(o, itemsByOrder.get(o.id) || []));
    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrdersAdmin
};
