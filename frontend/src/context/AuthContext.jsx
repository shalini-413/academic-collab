import { createContext, useState, useEffect } from 'react';
import { authService } from '../shared/services/authService';
import { setAuthToken } from '../shared/services/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Safe initialization to prevent "undefined" JSON error
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return (savedUser && savedUser !== "undefined") ? JSON.parse(savedUser) : null;
    } catch (err) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return (savedToken && savedToken !== "undefined") ? savedToken : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const { token, user } = await authService.login(email, password);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      setAuthToken(token);
      
      return { success: true, user };
    } catch (error) {
      console.error("Login Context Error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const updateUser = (updatedUserData) => {
    const newData = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(newData));
    setUser(newData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser: updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
