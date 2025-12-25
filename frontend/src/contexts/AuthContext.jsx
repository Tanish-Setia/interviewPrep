import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setSubLoading(true);
      const response = await api.get('/subscriptions/status');
      setSubscription(response.data);
    } catch (error) {
      console.error('Subscription status error:', error);
      setSubscription(null);
    } finally {
      setSubLoading(false);
    }
  }, []); 

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      
      await fetchSubscriptionStatus();
    } catch (error) {
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
      setSubLoading(false);
    }
  }, [fetchSubscriptionStatus]); 

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); 

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      setUser(response.data.user);
      
      await fetchSubscriptionStatus();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
      
      await fetchSubscriptionStatus();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      setSubscription(null);
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setSubscription(null);
    }
  };

  const value = {
    user,
    loading,
    subscription,
    subLoading,
    login,
    signup,
    logout,
    fetchSubscriptionStatus,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
