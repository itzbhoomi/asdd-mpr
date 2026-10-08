import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage to every outgoing request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Auth
  register: async (name, email, password) => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    return res.data;
  },
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Restaurants
  getRestaurants: async () => {
    const res = await apiClient.get('/restaurants');
    return res.data;
  },
  getRestaurantById: async (id) => {
    const res = await apiClient.get(`/restaurants/${id}`);
    return res.data;
  },
  getMenuByRestaurantId: async (id) => {
    const res = await apiClient.get(`/restaurants/${id}/menu`);
    return res.data;
  },

  // Orders
  createOrder: async (orderData) => {
    const res = await apiClient.post('/orders', orderData);
    return res.data;
  },
  getOrders: async () => {
    const res = await apiClient.get('/orders');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  }
};
