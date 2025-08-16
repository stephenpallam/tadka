import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [token, setToken] = useState(localStorage.getItem('tadka_token'));

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('tadka_token');
      if (storedToken) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token is invalid
            localStorage.removeItem('tadka_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('tadka_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [BACKEND_URL]);

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('tadka_token', data.access_token);
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        let errorMessage = 'Login failed';
        
        if (errorData.detail) {
          // Handle both string and array error formats
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Handle Pydantic validation errors
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else if (typeof errorData.detail === 'object') {
            errorMessage = errorData.detail.msg || errorData.detail.message || 'Login failed';
          }
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (username, password, confirmPassword) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          confirm_password: confirmPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        let errorMessage = 'Registration failed';
        
        if (errorData.detail) {
          // Handle both string and array error formats
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Handle Pydantic validation errors
            errorMessage = errorData.detail.map(err => err.msg || err.message || 'Validation error').join(', ');
          } else if (typeof errorData.detail === 'object') {
            errorMessage = errorData.detail.msg || errorData.detail.message || 'Registration failed';
          }
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tadka_token');
  };

  const hasRole = (role) => {
    return user && user.roles && user.roles.includes(role);
  };

  const hasAnyRole = (roles) => {
    return user && user.roles && roles.some(role => user.roles.includes(role));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;