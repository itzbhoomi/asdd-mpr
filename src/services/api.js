
const mockRestaurants = [
  { id: 1, name: "Spice Hub", rating: 4.5, cuisine: "Indian", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60" },
  { id: 2, name: "Pizza Point", rating: 4.2, cuisine: "Italian", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60" },
  { id: 3, name: "Burger House", rating: 4.0, cuisine: "American", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60" },
  { id: 4, name: "Mumbai Tiffin", rating: 4.8, cuisine: "Indian Street Food", image: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=500&q=60" },
  { id: 5, name: "Green Bowl", rating: 4.6, cuisine: "Healthy / Salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60" },
];

const mockMenus = {
  1: [
    { id: 101, name: "Chicken Tikka Masala", price: 350, description: "Spicy and creamy curry", type: "non-veg" },
    { id: 102, name: "Paneer Butter Masala", price: 300, description: "Cottage cheese in rich tomato gravy", type: "veg" },
    { id: 103, name: "Garlic Naan", price: 60, description: "Freshly baked Indian bread", type: "veg" }
  ],
  2: [
    { id: 201, name: "Margherita Pizza", price: 400, description: "Classic cheese and tomato", type: "veg" },
    { id: 202, name: "Pepperoni Pizza", price: 550, description: "Pork pepperoni slices", type: "non-veg" }
  ],
  3: [
    { id: 301, name: "Classic Cheeseburger", price: 250, description: "Beef patty with cheddar cheese", type: "non-veg" },
    { id: 302, name: "Veggie Burger", price: 200, description: "Plant-based patty with lettuce", type: "veg" }
  ],
  4: [
    { id: 401, name: "Vada Pav", price: 50, description: "Spicy potato filling in a bun", type: "veg" },
    { id: 402, name: "Pav Bhaji", price: 150, description: "Mashed vegetable curry with bread", type: "veg" }
  ],
  5: [
    { id: 501, name: "Quinoa Salad", price: 300, description: "Quinoa, avocado, cherry tomatoes", type: "veg" },
    { id: 502, name: "Grilled Chicken Salad", price: 350, description: "Chicken breast with mixed greens", type: "non-veg" }
  ]
};

export const api = {
  getRestaurants: async () => {
    return new Promise(resolve => setTimeout(() => resolve(mockRestaurants), 500));
  },
  getRestaurantById: async (id) => {
    return new Promise(resolve => setTimeout(() => resolve(mockRestaurants.find(r => r.id === parseInt(id))), 500));
  },
  getMenuByRestaurantId: async (id) => {
    return new Promise(resolve => setTimeout(() => resolve(mockMenus[id] || []), 500));
  }
};
