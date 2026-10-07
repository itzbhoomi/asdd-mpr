import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    
    // Create mock order in localStorage for history
    const newOrder = {
      id: "ORD" + Math.floor(Math.random() * 100000),
      date: new Date().toISOString(),
      items: cart,
      total: subtotal + 50, // Delivery fee
      status: "PLACED",
      address
    };
    
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    localStorage.setItem("orders", JSON.stringify([newOrder, ...existingOrders]));
    
    clearCart();
    navigate(`/orders/${newOrder.id}`);
  };

  if (cart.length === 0) return navigate("/cart");

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-3xl font-bold mb-6">Checkout</h2>
        <form onSubmit={handlePlaceOrder} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h3 className="text-xl font-bold border-b pb-2">Delivery Details</h3>
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input type="text" value={user?.name || ""} disabled className="w-full border p-2 rounded bg-gray-50" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Delivery Address</label>
            <textarea required value={address} onChange={e=>setAddress(e.target.value)} rows="3" className="w-full border p-2 rounded outline-none focus:border-orange-500"></textarea>
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700">
            Place Order
          </button>
        </form>
      </div>
      
      <div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-bold border-b pb-2 mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₹50</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>To Pay</span>
              <span>₹{subtotal + 50}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}