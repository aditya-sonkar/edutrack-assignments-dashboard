// Global auth state — any component can call useAuth() to get the current user
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, initializeData } from '../utils/localStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    initializeData();              // seed DB on first load
    setUsersList(getUsers());      // load all users for login matching
  }, []);

  const login  = (id) => setUser(usersList.find(u => u.id === id) || null);
  const logout = ()   => setUser(null);

  return (
    <AuthContext.Provider value={{ user, usersList, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
