# FoodFlow – Food Delivery System

A modern food delivery system created as a college mini-project for the **Agile Software Development and DevOps** course.

---

## 🏗️ Architecture Overview

```text
React Frontend (Vite)
       │
       ▼  HTTP / REST (Axios)
Node.js + Express Backend
       │
       ▼  mysql2 Connection Pool
MySQL Database (foodflow)
```

The system now consists of:
1. **Frontend:** React + Vite + Tailwind CSS + Lucide Icons + React Router
2. **Backend:** Node.js + Express.js + JWT Authentication + bcrypt + MySQL2
3. **Database:** Relational MySQL database (`foodflow`) with primary/foreign keys and transactional order processing

---

## 📁 Project Directory Structure

```text
asdd-mpr-main/
├── backend/                        # Node.js + Express + MySQL Backend
│   ├── config/
│   │   └── db.js                   # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js       # Register, login, user profile
│   │   ├── restaurantController.js # Restaurant CRUD
│   │   ├── menuController.js       # Menu items CRUD
│   │   └── orderController.js      # Order processing & transactions
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification & RBAC
│   │   └── errorMiddleware.js      # Global error handling
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth routes
│   │   ├── restaurantRoutes.js     # /api/restaurants routes
│   │   ├── menuRoutes.js           # /api/menu routes
│   │   ├── orderRoutes.js          # /api/orders routes
│   │   └── adminRoutes.js          # /api/admin routes
│   ├── scripts/
│   │   ├── schema.sql              # MySQL DDL table definitions
│   │   ├── seed.sql                # SQL demo data
│   │   ├── initDb.js               # Auto-migration & database seeder
│   │   └── testApis.js             # Automated API test suite (11 tests)
│   ├── app.js                      # Express application & CORS setup
│   ├── server.js                   # Server entrypoint (Port 5000)
│   ├── package.json
│   ├── .env.example                # Backend environment template
│   └── .env                        # Local development environment
├── src/                            # React Customer Frontend
│   ├── context/
│   │   ├── AuthContext.jsx         # Persistent JWT authentication context
│   │   └── CartContext.jsx         # Shopping cart state management
│   ├── pages/
│   │   ├── Home.jsx                # Landing page
│   │   ├── Login.jsx               # Real login against /api/auth/login
│   │   ├── Register.jsx            # Real register against /api/auth/register
│   │   ├── Restaurants.jsx         # Fetches restaurants from /api/restaurants
│   │   ├── RestaurantDetails.jsx   # Fetches restaurant & menu items
│   │   ├── Cart.jsx                # Cart review
│   │   ├── Checkout.jsx            # Creates order via POST /api/orders
│   │   ├── Orders.jsx              # Customer order history via GET /api/orders
│   │   ├── OrderDetails.jsx        # Order status tracking via GET /api/orders/:id
│   │   └── Profile.jsx             # User profile page
│   ├── services/
│   │   └── api.js                  # Axios client with JWT interceptor
│   ├── App.jsx                     # Route definitions
│   └── main.jsx                    # React entry point
├── .env.example                    # Frontend environment template
├── .env                            # Local development frontend env
├── package.json                    # Frontend dependencies
├── vite.config.js
└── README.md
```

---

## 🗄️ MySQL Database Structure

The `foodflow` database contains 5 relational tables:

```text
users
  │
  ├── (1:N) ──► orders ──► (1:N) ──► order_items
  │                ▲                      │
  │                │                      ▼
  └── (1:N) ──► restaurants ──► (1:N) ──► menu_items
```

### Table Schemas

1. **`users`**
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(100) NOT NULL
   - `email`: VARCHAR(150) NOT NULL UNIQUE
   - `password_hash`: VARCHAR(255) NOT NULL
   - `role`: ENUM('customer', 'restaurant', 'admin') DEFAULT 'customer'
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

2. **`restaurants`**
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `owner_id`: INT NULL (FK -> `users.id` ON DELETE SET NULL)
   - `name`: VARCHAR(150) NOT NULL
   - `cuisine`: VARCHAR(100)
   - `rating`: DECIMAL(2, 1) DEFAULT 4.0
   - `description`: TEXT
   - `address`: VARCHAR(255) NOT NULL
   - `image`: VARCHAR(500)
   - `status`: ENUM('active', 'inactive') DEFAULT 'active'
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

3. **`menu_items`**
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `restaurant_id`: INT NOT NULL (FK -> `restaurants.id` ON DELETE CASCADE)
   - `name`: VARCHAR(150) NOT NULL
   - `description`: TEXT
   - `price`: DECIMAL(10, 2) NOT NULL
   - `image`: VARCHAR(500)
   - `category`: VARCHAR(100)
   - `type`: ENUM('veg', 'non-veg') DEFAULT 'veg'
   - `availability`: BOOLEAN DEFAULT TRUE
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

4. **`orders`**
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `user_id`: INT NOT NULL (FK -> `users.id` ON DELETE CASCADE)
   - `restaurant_id`: INT NOT NULL (FK -> `restaurants.id` ON DELETE CASCADE)
   - `total_amount`: DECIMAL(10, 2) NOT NULL (Calculated on server)
   - `status`: ENUM('PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') DEFAULT 'PLACED'
   - `delivery_address`: TEXT NOT NULL
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

5. **`order_items`**
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `order_id`: INT NOT NULL (FK -> `orders.id` ON DELETE CASCADE)
   - `menu_item_id`: INT NOT NULL (FK -> `menu_items.id` ON DELETE RESTRICT)
   - `quantity`: INT NOT NULL DEFAULT 1
   - `price`: DECIMAL(10, 2) NOT NULL

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested with v20+)
- **MySQL**: 8.0+ / 9.x running locally on port 3306

### 2. Database Setup & Seeding

1. Verify MySQL service is running:
   ```powershell
   Get-Service -Name *mysql*
   ```
   *(If stopped, start it via `Start-Service MySQL96` or `net start MySQL96`)*

2. Configure backend environment:
   In `backend/.env` (or copy from `backend/.env.example`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=foodflow
   JWT_SECRET=foodflow_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:5173
   ```

3. Initialize schema and seed demo data:
   ```bash
   cd backend
   npm install
   npm run db:init
   ```
   *This automatically creates the `foodflow` database, runs all DDL statements, and seeds demo users, restaurants, menu items, and initial order records.*

### Demo Credentials Seeded

| Role | Email | Password |
|------|-------|----------|
| **Customer** | `customer@foodflow.com` | `Customer@123` |
| **Restaurant** | `restaurant@foodflow.com` | `Restaurant@123` |
| **Admin** | `admin@foodflow.com` | `Admin@123` |

---

### 3. Running the Backend Server

```bash
cd backend
npm start
```
- API will start on: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

---

### 4. Running the Frontend Application

1. In the project root directory, verify `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. Start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
- Frontend application will be available at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

An automated test suite tests all 11 required endpoints:

```bash
cd backend
npm test
```

### Verified Test Cases:
1. Customer registration (`POST /api/auth/register`)
2. Customer login (`POST /api/auth/login`)
3. Invalid login handling (wrong password returns `401`)
4. Restaurant listing (`GET /api/restaurants`)
5. Restaurant details (`GET /api/restaurants/:id`)
6. Menu listing (`GET /api/restaurants/:id/menu`)
7. Order creation with backend total calculation and DB transaction (`POST /api/orders`)
8. Customer order history (`GET /api/orders`)
9. Specific order details (`GET /api/orders/:id`)
10. Unauthorized request rejection (`401` when token is missing)
11. Restaurant/admin order status update (`PUT /api/orders/:id/status`)

---

## 📡 REST API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Login with email/password; returns JWT |
| `GET`  | `/api/auth/me` | Authenticated | Get current authenticated user profile |

### Restaurants
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/restaurants` | Public | List all active restaurants |
| `GET`  | `/api/restaurants/:id` | Public | Get restaurant details |
| `GET`  | `/api/restaurants/:id/menu` | Public | Get menu items for restaurant |
| `POST` | `/api/restaurants` | Admin / Partner | Create a new restaurant |
| `PUT`  | `/api/restaurants/:id` | Admin / Partner | Update restaurant details |
| `DELETE`| `/api/restaurants/:id` | Admin | Delete a restaurant |

### Menu Items
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET`  | `/api/menu/:id` | Public | Get single menu item |
| `POST` | `/api/menu` | Admin / Partner | Add item to restaurant menu |
| `PUT`  | `/api/menu/:id` | Admin / Partner | Update menu item details |
| `DELETE`| `/api/menu/:id` | Admin / Partner | Remove menu item |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/orders` | Customer | Place order (backend total calculation & SQL transaction) |
| `GET`  | `/api/orders` | Authenticated | Get order history for current customer |
| `GET`  | `/api/orders/:id` | Authenticated | Get order details (scoped to owner/admin) |
| `PUT`  | `/api/orders/:id/status` | Admin / Partner | Update status (`PLACED` -> `ACCEPTED` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`) |
| `GET`  | `/api/admin/orders` | Admin | View all orders across the system |

---

## 🐳 Docker & Docker Compose Deployment

The FoodFlow system is containerized using Docker and orchestrated with Docker Compose.

### Architecture
```text
Browser
   ↓ (Port 5173:80)
Frontend Container (Nginx / React SPA)
   ↓ (Port 5000:5000)
Backend Container (Node.js / Express API)
   ↓ (Port 3306 - Docker Compose Network)
MySQL Container (Database: foodflow / Named Volume: mysql_data)
```

**Architecture Flow:**
`Frontend container → Backend container → MySQL container`

### Prerequisites
- Docker Desktop

### Commands
```bash
# Build Docker images
docker compose build

# Start services in the background
docker compose up -d

# Verify container status and health
docker compose ps

# View service logs
docker compose logs

# Stop containers (preserves database volume)
docker compose down
```

### Application URLs
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Health:** http://localhost:5000/api/health

---

## 🛡️ Git Safety & Local Verification

All development remains **strictly local**. No remote Git operations (push, commit, PR, or branch changes) were performed.
The workspace is fully configured with Docker and Docker Compose.
