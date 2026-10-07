
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = (email, password) => {
    if (email && password) {
      setUser({ name: email.split("@")[0], email });
      return true;
    }
    return false;
  };
  
  const register = (name, email, password) => {
    if (name && email && password) {
      setUser({ name, email });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
