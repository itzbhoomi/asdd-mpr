import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([
      api.getRestaurantById(id),
      api.getMenuByRestaurantId(id)
    ]).then(([res, menuData]) => {
      setRestaurant(res);
      setMenu(menuData);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading menu...</div>;
  if (!restaurant) return <div className="text-center py-20">Restaurant not found</div>;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <img src={restaurant.image} className="w-full h-64 object-cover" alt={restaurant.name} />
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-2">{restaurant.name}</h2>
          <p className="text-gray-600">{restaurant.cuisine} • ⭐ {restaurant.rating}</p>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold mb-6">Menu</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menu.map(item => (
          <div key={item.id} className="bg-white p-5 border rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${item.type === "veg" ? "bg-green-500" : "bg-red-500"}`}></span>
                <h4 className="font-bold text-lg">{item.name}</h4>
              </div>
              <p className="text-gray-500 text-sm mt-1 mb-2">{item.description}</p>
              <p className="font-semibold">₹{item.price}</p>
            </div>
            <button 
              onClick={() => addToCart(item, restaurant.id)}
              className="bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2 rounded font-medium hover:bg-orange-100 transition"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}