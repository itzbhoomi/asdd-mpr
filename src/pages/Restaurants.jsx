import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRestaurants().then(data => {
      setRestaurants(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20 text-xl text-gray-500">Loading restaurants...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Available Restaurants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map(r => (
          <Link to={`/restaurants/${r.id}`} key={r.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <img src={r.image} alt={r.name} className="w-full h-48 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{r.name}</h3>
              <p className="text-gray-500 mb-3">{r.cuisine}</p>
              <div className="flex items-center text-orange-500 font-medium">
                <Star className="w-4 h-4 mr-1 fill-current" /> {r.rating}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}