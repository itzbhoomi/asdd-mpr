const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initDatabase() {
  console.log('[Init DB] Starting database initialization...');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'foodflow';

  let connection;
  try {
    // 1. Connect without specific DB to create it if needed
    connection = await mysql.createConnection({ host, port, user, password });
    console.log(`[Init DB] Connected to MySQL server at ${host}:${port}`);

    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log(`[Init DB] Database "${database}" verified/created.`);
    } catch (dbErr) {
      console.log(`[Init DB] Using existing database "${database}" (${dbErr.message}).`);
    }
    await connection.changeUser({ database });

    // 2. Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Remove single line comments (-- ...) and split statements
    const cleanedSql = schemaSql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use '));

    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log(`[Init DB] Executed ${statements.length} schema statements.`);

    // 3. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassHash = await bcrypt.hash('Admin@123', salt);
    const restaurantPassHash = await bcrypt.hash('Restaurant@123', salt);
    const customerPassHash = await bcrypt.hash('Customer@123', salt);

    const users = [
      { name: 'System Admin', email: 'admin@foodflow.com', hash: adminPassHash, role: 'admin' },
      { name: 'Restaurant Partner', email: 'restaurant@foodflow.com', hash: restaurantPassHash, role: 'restaurant' },
      { name: 'Rohan Customer', email: 'customer@foodflow.com', hash: customerPassHash, role: 'customer' }
    ];

    for (const u of users) {
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role);`,
        [u.name, u.email, u.hash, u.role]
      );
    }
    console.log('[Init DB] Seed users inserted/updated.');

    // 4. Seed Restaurants
    const [restaurantRows] = await connection.query(`SELECT id FROM users WHERE email = 'restaurant@foodflow.com'`);
    const restaurantOwnerId = restaurantRows[0]?.id || null;

    const restaurants = [
      { id: 1, name: 'Spice Hub', cuisine: 'Indian', rating: 4.5, description: 'Authentic North and South Indian curries with clay-oven baked tandoor breads.', address: '101 Curry Lane, Bandra West, Mumbai', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60' },
      { id: 2, name: 'Pizza Point', cuisine: 'Italian', rating: 4.2, description: 'Artisan wood-fired pizzas and homemade pastas crafted with imported Italian cheeses.', address: '42 Napoli Street, Colaba, Mumbai', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60' },
      { id: 3, name: 'Burger House', cuisine: 'American', rating: 4.0, description: 'Sizzling flame-grilled gourmet burgers with hand-cut fries and rich milkshakes.', address: '88 Main Boulevard, Andheri East, Mumbai', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60' },
      { id: 4, name: 'Mumbai Tiffin', cuisine: 'Indian Street Food', rating: 4.8, description: 'Iconic Mumbai street chaat, crispy vada pavs and buttery bhaji served hot.', address: '12 Dadar Market Circle, Dadar, Mumbai', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=500&q=60' },
      { id: 5, name: 'Green Bowl', cuisine: 'Healthy / Salad', rating: 4.6, description: 'Clean, farm-fresh organic bowls, power salads, and cold-pressed wellness juices.', address: '15 Eco Park Road, Powai, Mumbai', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60' }
    ];

    for (const r of restaurants) {
      await connection.query(
        `INSERT INTO restaurants (id, owner_id, name, cuisine, rating, description, address, image, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE name=VALUES(name), cuisine=VALUES(cuisine), rating=VALUES(rating), description=VALUES(description), address=VALUES(address), image=VALUES(image);`,
        [r.id, restaurantOwnerId, r.name, r.cuisine, r.rating, r.description, r.address, r.image]
      );
    }
    console.log('[Init DB] Seed restaurants inserted/updated.');

    // 5. Seed Menu Items
    const menuItems = [
      { id: 101, restaurant_id: 1, name: 'Chicken Tikka Masala', description: 'Spicy and creamy curry', price: 350.00, type: 'non-veg', category: 'Curries' },
      { id: 102, restaurant_id: 1, name: 'Paneer Butter Masala', description: 'Cottage cheese in rich tomato gravy', price: 300.00, type: 'veg', category: 'Curries' },
      { id: 103, restaurant_id: 1, name: 'Garlic Naan', description: 'Freshly baked Indian bread', price: 60.00, type: 'veg', category: 'Breads' },
      { id: 201, restaurant_id: 2, name: 'Margherita Pizza', description: 'Classic cheese and tomato', price: 400.00, type: 'veg', category: 'Pizzas' },
      { id: 202, restaurant_id: 2, name: 'Pepperoni Pizza', description: 'Pork pepperoni slices', price: 550.00, type: 'non-veg', category: 'Pizzas' },
      { id: 301, restaurant_id: 3, name: 'Classic Cheeseburger', description: 'Beef patty with cheddar cheese', price: 250.00, type: 'non-veg', category: 'Burgers' },
      { id: 302, restaurant_id: 3, name: 'Veggie Burger', description: 'Plant-based patty with lettuce', price: 200.00, type: 'veg', category: 'Burgers' },
      { id: 401, restaurant_id: 4, name: 'Vada Pav', description: 'Spicy potato filling in a bun', price: 50.00, type: 'veg', category: 'Street Food' },
      { id: 402, restaurant_id: 4, name: 'Pav Bhaji', description: 'Mashed vegetable curry with bread', price: 150.00, type: 'veg', category: 'Street Food' },
      { id: 501, restaurant_id: 5, name: 'Quinoa Salad', description: 'Quinoa, avocado, cherry tomatoes', price: 300.00, type: 'veg', category: 'Salads' },
      { id: 502, restaurant_id: 5, name: 'Grilled Chicken Salad', description: 'Chicken breast with mixed greens', price: 350.00, type: 'non-veg', category: 'Salads' }
    ];

    for (const m of menuItems) {
      await connection.query(
        `INSERT INTO menu_items (id, restaurant_id, name, description, price, type, category, availability)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price), type=VALUES(type), category=VALUES(category);`,
        [m.id, m.restaurant_id, m.name, m.description, m.price, m.type, m.category]
      );
    }
    console.log('[Init DB] Seed menu items inserted/updated.');

    // 6. Seed a sample order for customer
    const [custRows] = await connection.query(`SELECT id FROM users WHERE email = 'customer@foodflow.com'`);
    const customerId = custRows[0]?.id;

    if (customerId) {
      const [existingOrders] = await connection.query(`SELECT id FROM orders WHERE user_id = ?`, [customerId]);
      if (existingOrders.length === 0) {
        const [orderResult] = await connection.query(
          `INSERT INTO orders (user_id, restaurant_id, total_amount, status, delivery_address)
           VALUES (?, 1, 460.00, 'DELIVERED', 'Flat 402, Sunshine Heights, Mumbai');`,
          [customerId]
        );
        const orderId = orderResult.insertId;

        await connection.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
           (?, 101, 1, 350.00),
           (?, 103, 1, 60.00);`,
          [orderId, orderId]
        );
        console.log(`[Init DB] Seed sample order created (ID: ${orderId}).`);
      }
    }

    console.log('[Init DB] Database initialization completed successfully!');
  } catch (error) {
    console.error('[Init DB Error]', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
