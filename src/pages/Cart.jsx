import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link to="/restaurants" className="text-orange-600 font-medium hover:underline">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Your Cart</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {cart.map(item => (
          <div key={item.id} className="flex justify-between items-center py-4 border-b last:border-0">
            <div>
              <h4 className="font-bold">{item.name}</h4>
              <p className="text-gray-500 text-sm">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-gray-50"><Minus className="w-4 h-4"/></button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-gray-50"><Plus className="w-4 h-4"/></button>
              </div>
              <p className="font-bold w-16 text-right">₹{item.price * item.quantity}</p>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="w-5 h-5"/>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-end">
        <div className="text-xl mb-4">Subtotal: <span className="font-bold">₹{subtotal}</span></div>
        <button onClick={() => navigate("/checkout")} className="bg-orange-600 text-white px-8 py-3 rounded hover:bg-orange-700 font-bold text-lg">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}