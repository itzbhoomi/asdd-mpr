# FoodFlow - Customer Module

A modern food delivery system created as a college mini-project for the **Agile Software Development and DevOps** course.

## Project Overview
FoodFlow is a food ordering application designed to demonstrate the complete Agile project lifecycle, source control, continuous integration, and containerization.

This repository currently implements the **Customer Module** (Member 1 responsibilities), including:
- Customer Authentication (Register/Login)
- Restaurant and Menu Browsing
- Shopping Cart functionality
- Order Placement
- Order Tracking and History

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Lucide Icons
- **Backend/API:** Currently uses a mocked API service (`src/services/api.js`). Designed to be easily replaced by the real backend (Member 2).
- **Database:** LocalStorage used for mock orders. Real DB to be integrated by Member 3.

## Project Structure
```
src/
├── components/   # Reusable UI components
├── context/      # React Contexts (Auth, Cart)
├── layouts/      # Main layout and Navbar
├── pages/        # Application routes (Home, Login, Restaurants, etc.)
├── services/     # API integration layer
├── App.jsx       # Routing configuration
└── main.jsx      # React entry point
```

## Installation & Running Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd asdd-mpr
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Expected Backend APIs (For Member 2)
The frontend expects the following endpoints to be implemented in the backend:
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Authenticate customer
- `GET /api/restaurants` - List available restaurants
- `GET /api/restaurants/:id` - Get specific restaurant details
- `GET /api/restaurants/:id/menu` - Get menu items for a restaurant
- `POST /api/orders` - Place a new order
- `GET /api/orders` - Get customer's order history
- `GET /api/orders/:id` - Get specific order details

## Git Workflow (Team Collaboration)
We use a feature-branch workflow.
- `main`: Stable production code
- `develop`: Integration branch for testing
- `feature/*`: New features (e.g., `feature/customer-auth`, `feature/admin-dashboard`)

Please do not commit `.env` files or `node_modules`.

## Future DevOps Integration
- **Jenkins:** Member 2 will configure CI/CD pipelines.
- **Docker:** A `Dockerfile` and `docker-compose.yml` will be added to containerize the frontend and backend.
- **Prometheus/Grafana:** Member 3 will add metrics monitoring.
