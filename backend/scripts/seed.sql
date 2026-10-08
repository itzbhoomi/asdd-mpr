-- FoodFlow Seed Data
USE foodflow;

-- Demo Users (bcrypt hash for passwords):
-- admin@foodflow.com / Admin@123
-- restaurant@foodflow.com / Restaurant@123
-- customer@foodflow.com / Customer@123
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'System Admin', 'admin@foodflow.com', '$2a$10$1vFNSQJV1y2EoVsRWlv5bOpKKgvVy1JyP6jtIL82HxmRhz55z3q.e', 'admin'),
(2, 'Restaurant Partner', 'restaurant@foodflow.com', '$2a$10$thF6a0k1nQurZMdXpZfVp.YLSVJUV/sWX90ZpzO00fR09D1FnVIgW', 'restaurant'),
(3, 'Rohan Customer', 'customer@foodflow.com', '$2a$10$5Pfo60BQtHQA0L58tW/6H.cwkzPgNq2hlhr3f96ODGTqGY2iTGpBW', 'customer')
ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role);

-- Restaurants
INSERT INTO restaurants (id, owner_id, name, cuisine, rating, description, address, image, status) VALUES
(1, 2, 'Spice Hub', 'Indian', 4.5, 'Authentic North and South Indian curries with clay-oven baked tandoor breads.', '101 Curry Lane, Bandra West, Mumbai', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60', 'active'),
(2, 2, 'Pizza Point', 'Italian', 4.2, 'Artisan wood-fired pizzas and homemade pastas crafted with imported Italian cheeses.', '42 Napoli Street, Colaba, Mumbai', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60', 'active'),
(3, 2, 'Burger House', 'American', 4.0, 'Sizzling flame-grilled gourmet burgers with hand-cut fries and rich milkshakes.', '88 Main Boulevard, Andheri East, Mumbai', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60', 'active'),
(4, 2, 'Mumbai Tiffin', 'Indian Street Food', 4.8, 'Iconic Mumbai street chaat, crispy vada pavs and buttery bhaji served hot.', '12 Dadar Market Circle, Dadar, Mumbai', 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=500&q=60', 'active'),
(5, 2, 'Green Bowl', 'Healthy / Salad', 4.6, 'Clean, farm-fresh organic bowls, power salads, and cold-pressed wellness juices.', '15 Eco Park Road, Powai, Mumbai', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), owner_id=VALUES(owner_id), cuisine=VALUES(cuisine), rating=VALUES(rating), description=VALUES(description), address=VALUES(address), image=VALUES(image);

-- Menu Items
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, type, availability, image) VALUES
(101, 1, 'Chicken Tikka Masala', 'Spicy and creamy curry', 350.00, 'Curries', 'non-veg', TRUE, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=60'),
(102, 1, 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy', 300.00, 'Curries', 'veg', TRUE, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=60'),
(103, 1, 'Garlic Naan', 'Freshly baked Indian bread', 60.00, 'Breads', 'veg', TRUE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=60'),
(201, 2, 'Margherita Pizza', 'Classic cheese and tomato', 400.00, 'Pizzas', 'veg', TRUE, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60'),
(202, 2, 'Pepperoni Pizza', 'Pork pepperoni slices', 550.00, 'Pizzas', 'non-veg', TRUE, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60'),
(301, 3, 'Classic Cheeseburger', 'Beef patty with cheddar cheese', 250.00, 'Burgers', 'non-veg', TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60'),
(302, 3, 'Veggie Burger', 'Plant-based patty with lettuce', 200.00, 'Burgers', 'veg', TRUE, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=500&q=60'),
(401, 4, 'Vada Pav', 'Spicy potato filling in a bun', 50.00, 'Street Food', 'veg', TRUE, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=60'),
(402, 4, 'Pav Bhaji', 'Mashed vegetable curry with bread', 150.00, 'Street Food', 'veg', TRUE, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=500&q=60'),
(501, 5, 'Quinoa Salad', 'Quinoa, avocado, cherry tomatoes', 300.00, 'Salads', 'veg', TRUE, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60'),
(502, 5, 'Grilled Chicken Salad', 'Chicken breast with mixed greens', 350.00, 'Salads', 'non-veg', TRUE, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price), type=VALUES(type), category=VALUES(category);

-- Sample Order for Customer
INSERT INTO orders (id, user_id, restaurant_id, total_amount, status, delivery_address) VALUES
(1, 3, 1, 460.00, 'DELIVERED', 'Flat 402, Sunshine Heights, Mumbai')
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) VALUES
(1, 1, 101, 1, 350.00),
(2, 1, 103, 1, 60.00)
ON DUPLICATE KEY UPDATE price=VALUES(price);
