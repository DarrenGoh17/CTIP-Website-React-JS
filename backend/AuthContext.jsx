import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null); // Add userId state

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT to get user info
      const userData = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
      setUserId(userData.id); // Assuming the token contains user ID in `id` field
      setIsAuthenticated(true);
      setUserRole(userData.role);
      setUsername(userData.username);
    }
  }, []);

  const login = (user, role, id) => {
    setUserId(id); // Set userId on login
    setIsAuthenticated(true);
    setUserRole(role);
    setUsername(user);
  };

  const logout = () => {
    setUserId(null); // Clear userId on logout
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
    localStorage.removeItem('token'); // Remove the token on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, username, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
