
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User, LogOut } from "lucide-react";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-orange-600">FoodFlow</Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/restaurants" className="text-gray-600 hover:text-gray-900">Restaurants</Link>
              
              {user ? (
                <>
                  <Link to="/orders" className="text-gray-600 hover:text-gray-900">Orders</Link>
                  <Link to="/cart" className="text-gray-600 hover:text-gray-900 relative">
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {cart.reduce((a,c) => a + c.quantity, 0)}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-5 h-5"/>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">Login</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white py-8 text-center mt-auto">
        <p>© 2026 FoodFlow Delivery. Agile & DevOps Mini Project.</p>
      </footer>
    </div>
  );
}
