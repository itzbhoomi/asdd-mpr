const { pool } = require('../config/db');

// GET /api/restaurants
const getAllRestaurants = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, owner_id, name, cuisine, CAST(rating AS DOUBLE) AS rating, description, address, image, status, created_at
       FROM restaurants
       WHERE status = 'active'
       ORDER BY rating DESC, id ASC`
    );

    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/restaurants/:id
const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id, owner_id, name, cuisine, CAST(rating AS DOUBLE) AS rating, description, address, image, status, created_at
       FROM restaurants
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with id ${id} not found.`
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// POST /api/restaurants (Admin / Restaurant Owner)
const createRestaurant = async (req, res, next) => {
  try {
    const { name, cuisine, rating, description, address, image, status } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name and address are required.'
      });
    }

    const ownerId = req.user?.role === 'restaurant' ? req.user.id : (req.body.owner_id || null);

    const [result] = await pool.query(
      `INSERT INTO restaurants (owner_id, name, cuisine, rating, description, address, image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        name.trim(),
        cuisine || 'Multi-Cuisine',
        rating || 4.0,
        description || '',
        address.trim(),
        image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60',
        status || 'active'
      ]
    );

    const [newRest] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully.',
      restaurant: newRest[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/restaurants/:id (Admin / Restaurant Owner)
const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, cuisine, rating, description, address, image, status } = req.body;

    // Check restaurant exists
    const [existing] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with id ${id} not found.`
      });
    }

    // Role check: Restaurant owner can only update their own restaurant
    if (req.user.role === 'restaurant' && existing[0].owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own restaurant.'
      });
    }

    await pool.query(
      `UPDATE restaurants
       SET name = COALESCE(?, name),
           cuisine = COALESCE(?, cuisine),
           rating = COALESCE(?, rating),
           description = COALESCE(?, description),
           address = COALESCE(?, address),
           image = COALESCE(?, image),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [name, cuisine, rating, description, address, image, status, id]
    );

    const [updated] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully.',
      restaurant: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/restaurants/:id (Admin only)
const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with id ${id} not found.`
      });
    }

    await pool.query('DELETE FROM restaurants WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: `Restaurant #${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
