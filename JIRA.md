# Jira Structure - Customer Module

## EPIC
**Epic Name:** Customer Food Ordering Module
**Description:** Implement the complete customer-facing functionality for FoodFlow, allowing users to browse restaurants, manage their cart, and place orders.

---

## USER STORIES

### US-01: Customer Authentication
**As a** customer,
**I want to** register and log in
**so that** I can securely use the food delivery system.

**Acceptance Criteria:**
- User can create an account with Name, Email, and Password.
- User can log in with valid credentials.
- System displays appropriate error messages for invalid inputs.
- Logged-in state is preserved across pages.

**Tasks:**
1. Create Login and Register UI pages.
2. Implement AuthContext for state management.
3. Validate user inputs.

**Priority:** High

---

### US-02: Browse Restaurants
**As a** customer,
**I want to** browse available restaurants
**so that** I can choose where to order from.

**Acceptance Criteria:**
- Home page displays a link to browse restaurants.
- Restaurants page displays a grid of available restaurants with images, ratings, and cuisines.

**Tasks:**
1. Create Restaurants listing page.
2. Implement mock API `getRestaurants`.
3. Design reusable RestaurantCard component.

**Priority:** High

---

### US-03: View Restaurant Menu
**As a** customer,
**I want to** view a restaurant's menu
**so that** I can select food items.

**Acceptance Criteria:**
- Clicking a restaurant opens its details page.
- Details page shows restaurant info and a list of menu items with prices and descriptions.
- Distinguish between veg and non-veg items.

**Tasks:**
1. Create RestaurantDetails page.
2. Implement mock API `getRestaurantById` and `getMenuByRestaurantId`.

**Priority:** High

---

### US-04 & US-05: Shopping Cart Management
**As a** customer,
**I want to** add food to my cart and modify quantities
**so that** I can prepare and adjust my order before checkout.

**Acceptance Criteria:**
- "Add to Cart" button exists for each menu item.
- Cart displays all selected items, their quantities, and the subtotal.
- User can increase/decrease quantities or remove items.
- User is prevented from adding items from multiple restaurants simultaneously.

**Tasks:**
1. Implement CartContext for global cart state.
2. Create Cart page UI.
3. Add cart counter to Navbar.

**Priority:** High

---

### US-06: Checkout Flow
**As a** customer,
**I want to** place an order
**so that** the restaurant can prepare my food.

**Acceptance Criteria:**
- Checkout page displays order summary and subtotal + delivery fee.
- User must enter delivery address to proceed.
- User must be logged in to checkout.
- Clicking "Place Order" successfully registers the order and clears the cart.

**Tasks:**
1. Create Checkout UI.
2. Add form validation for delivery address.
3. Implement `handlePlaceOrder` mock logic.

**Priority:** High

---

### US-07 & US-08: Order Tracking & History
**As a** customer,
**I want to** track my current order and view my previous orders
**so that** I know my order's status and my order history.

**Acceptance Criteria:**
- Orders page lists all past and current orders.
- Clicking an order shows detailed status (PLACED, ACCEPTED, PREPARING, OUT_FOR_DELIVERY, DELIVERED).
- Order details page shows item summary and delivery address.

**Tasks:**
1. Create Orders history page.
2. Create OrderDetails page with status progress bar.
3. Integrate mock local storage for order persistence.

**Priority:** Medium

---

## SPRINT PLANNING

**Sprint 1:**
- Project Setup (React, Vite, Tailwind)
- US-01: Authentication
- US-02: Browse Restaurants

**Sprint 2:**
- US-03: View Restaurant Menu
- US-04 & US-05: Shopping Cart Management
- US-06: Checkout Flow

**Sprint 3:**
- US-07 & US-08: Order Tracking & History
- Testing & Bug Fixing
- Documentation (README, Jira docs)
