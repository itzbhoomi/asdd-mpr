import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const result = await register(name, email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border rounded-lg shadow-sm mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input type="text" className="w-full border p-2 rounded outline-none focus:border-orange-500" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border p-2 rounded outline-none focus:border-orange-500" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input type="password" className="w-full border p-2 rounded outline-none focus:border-orange-500" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700 font-medium">Sign Up</button>
      </form>
      <p className="mt-4 text-center text-gray-600">Already have an account? <Link to="/login" className="text-orange-600">Login</Link></p>
    </div>
  );
}