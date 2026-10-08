const { pool } = require('../config/db');

// GET /api/restaurants/:id/menu or /api/menu?restaurantId=:id
const getMenuByRestaurantId = async (req, res, next) => {
  try {
    const restaurantId = req.params.id || req.query.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required.'
      });
    }

    const [rows] = await pool.query(
      `SELECT id, restaurant_id, name, description, CAST(price AS DOUBLE) AS price, image, category, type, availability, created_at
       FROM menu_items
       WHERE restaurant_id = ? AND availability = TRUE
       ORDER BY category, name`,
      [restaurantId]
    );

    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/menu/:id
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, restaurant_id, name, description, CAST(price AS DOUBLE) AS price, image, category, type, availability, created_at
       FROM menu_items
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Menu item with id ${id} not found.`
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// POST /api/menu (Admin / Restaurant Owner)
const createMenuItem = async (req, res, next) => {
  try {
    const { restaurant_id, name, description, price, image, category, type, availability } = req.body;

    if (!restaurant_id || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'restaurant_id, name, and price are required.'
      });
    }

    // Role check: if restaurant owner, verify ownership
    if (req.user.role === 'restaurant') {
      const [rest] = await pool.query('SELECT owner_id FROM restaurants WHERE id = ?', [restaurant_id]);
      if (rest.length === 0 || rest[0].owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only add items to your own restaurant.'
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, image, category, type, availability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurant_id,
        name.trim(),
        description || '',
        parseFloat(price),
        image || '',
        category || 'Main Course',
        type === 'non-veg' ? 'non-veg' : 'veg',
        availability !== undefined ? availability : true
      ]
    );

    const [newItem] = await pool.query(
      `SELECT id, restaurant_id, name, description, CAST(price AS DOUBLE) AS price, image, category, type, availability
       FROM menu_items WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      menuItem: newItem[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/menu/:id (Admin / Restaurant Owner)
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, type, availability } = req.body;

    const [existing] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Menu item with id ${id} not found.`
      });
    }

    // Role check: if restaurant owner, verify ownership
    if (req.user.role === 'restaurant') {
      const [rest] = await pool.query('SELECT owner_id FROM restaurants WHERE id = ?', [existing[0].restaurant_id]);
      if (rest.length === 0 || rest[0].owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update items in your own restaurant.'
        });
      }
    }

    await pool.query(
      `UPDATE menu_items
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           image = COALESCE(?, image),
           category = COALESCE(?, category),
           type = COALESCE(?, type),
           availability = COALESCE(?, availability)
       WHERE id = ?`,
      [name, description, price !== undefined ? parseFloat(price) : null, image, category, type, availability, id]
    );

    const [updated] = await pool.query(
      `SELECT id, restaurant_id, name, description, CAST(price AS DOUBLE) AS price, image, category, type, availability
       FROM menu_items WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully.',
      menuItem: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/menu/:id (Admin / Restaurant Owner)
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Menu item with id ${id} not found.`
      });
    }

    // Role check: if restaurant owner, verify ownership
    if (req.user.role === 'restaurant') {
      const [rest] = await pool.query('SELECT owner_id FROM restaurants WHERE id = ?', [existing[0].restaurant_id]);
      if (rest.length === 0 || rest[0].owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete items in your own restaurant.'
        });
      }
    }

    await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: `Menu item #${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuByRestaurantId,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
