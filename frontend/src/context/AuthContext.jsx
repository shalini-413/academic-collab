import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Create the Context
export const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure Axios default headers if a token exists
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user data when the app starts if they have a token
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  // Login Function
  const login = async (email, password) => {
    try {
      // Pointing to your backend login route
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      // Save to state and local storage
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, role: user.role };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed. Please try again." 
      };
    }
  };

  // Logout Function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};