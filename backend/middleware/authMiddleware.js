const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Authenticate user via JWT Bearer token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodflow_secret');

    // Fetch user from DB to verify existence and latest role
    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

// Authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] roles.`
      });
    }
    next();
  };
};

// Optional authentication (attaches user if present, proceeds if not)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodflow_secret');
      const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (rows.length > 0) {
        req.user = rows[0];
      }
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = {
  authenticate,
  authorizeRoles,
  optionalAuthenticate
};
