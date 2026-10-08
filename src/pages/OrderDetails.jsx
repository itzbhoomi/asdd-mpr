import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrderById(id)
      .then(data => {
        setOrder(data);
      })
      .catch(err => {
        console.error("Failed to load order from API, fallback to localStorage:", err);
        const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        setOrder(savedOrders.find(o => String(o.id) === String(id)));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading order details...</div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const statusList = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentIndex = statusList.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Order #{order.id}</h2>
        <Link to="/orders" className="text-orange-600 hover:underline">Back to Orders</Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
        <h3 className="font-bold text-lg mb-4">Track Order</h3>
        <div className="flex justify-between items-center mb-2">
          {statusList.map((st, i) => (
            <div key={st} className="flex flex-col items-center w-1/5 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${i <= currentIndex ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <div className="text-xs text-center mt-2 font-medium text-gray-600">{st.replace(/_/g, " ")}</div>
              {i < statusList.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-1 -z-0 ${i < currentIndex ? "bg-orange-500" : "bg-gray-200"}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="font-bold text-lg mb-4 border-b pb-2">Order Summary</h3>
        <div className="space-y-4 mb-4">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between">
              <div>
                <span className="font-medium">{item.quantity}x {item.name}</span>
                <p className="text-xs text-gray-500">₹{item.price} each</p>
              </div>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-xl">
            <span>Total Paid</span>
            <span>₹{order.total}</span>
          </div>
          <p className="text-gray-500 text-sm mt-4 border-t pt-4">
            <span className="font-semibold">Delivery Address:</span><br/>
            {order.address}
          </p>
        </div>
      </div>
    </div>
  );
}