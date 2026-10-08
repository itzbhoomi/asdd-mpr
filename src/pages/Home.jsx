import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Hungry? We got you.</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        Get your favorite food delivered directly to your door. Fresh, fast, and secure.
      </p>
      <Link to="/restaurants" className="bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-orange-700 transition">
        Browse Restaurants
      </Link>
    </div>
  );
}