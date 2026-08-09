import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi, loginApi, registerApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bv_token') || null);
  const [loading, setLoading] = useState(true);

  // Authenticate user on mount and token change
  const fetchUser = async () => {
    const storedToken = localStorage.getItem('bv_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getMeApi();
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    if (res.data.success) {
      const authToken = res.data.token;
      const authUser = res.data.user;
      localStorage.setItem('bv_token', authToken);
      setToken(authToken);
      setUser(authUser);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    if (res.data.success) {
      const authToken = res.data.token;
      const authUser = res.data.user;
      localStorage.setItem('bv_token', authToken);
      setToken(authToken);
      setUser(authUser);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bv_token');
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      updateUser,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
