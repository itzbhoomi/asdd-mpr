import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  
  if(!user) return <div>Please login</div>;
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow border">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="text-gray-500 text-sm">Name</label>
          <p className="font-medium text-lg">{user.name}</p>
        </div>
        <div>
          <label className="text-gray-500 text-sm">Email</label>
          <p className="font-medium text-lg">{user.email}</p>
        </div>
      </div>
    </div>
  );
}