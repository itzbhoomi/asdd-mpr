import os

pages_code = {
    "Home.jsx": """
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
""",
    "Login.jsx": """
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if(login(email, password)) {
      navigate("/");
    } else {
      setError("Please fill all fields");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border rounded-lg shadow-sm mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to FoodFlow</h2>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border p-2 rounded focus:ring-orange-500 focus:border-orange-500 outline-none" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input type="password" className="w-full border p-2 rounded focus:ring-orange-500 focus:border-orange-500 outline-none" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700 font-medium">Log In</button>
      </form>
      <p className="mt-4 text-center text-gray-600">Don't have an account? <Link to="/register" className="text-orange-600">Register</Link></p>
    </div>
  );
}
""",
    "Register.jsx": """
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

  const handleRegister = (e) => {
    e.preventDefault();
    if(register(name, email, password)) {
      navigate("/");
    } else {
      setError("Please fill all fields");
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
""",
    "Restaurants.jsx": """
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
""",
    "RestaurantDetails.jsx": """
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
""",
    "Cart.jsx": """
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
""",
    "Checkout.jsx": """
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
""",
    "Orders.jsx": """
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
""",
    "OrderDetails.jsx": """
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrder(savedOrders.find(o => o.id === id));
  }, [id]);

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
""",
    "Profile.jsx": """
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
"""
}

for filename, content in pages_code.items():
    with open(f"src/pages/{filename}", "w") as f:
        f.write(content.strip())
