import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(savedOrders);
  }, [user, navigate]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded border shadow-sm">
          <p className="text-gray-500 mb-4">You have no previous orders.</p>
          <Link to="/restaurants" className="text-orange-600 font-medium hover:underline">Order Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link to={`/orders/${order.id}`} key={order.id} className="block bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">Order #{order.id}</h4>
                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</p>
                <p className="mt-2 text-gray-700">{order.items.length} items</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg mb-2">₹{order.total}</p>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold">{order.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}