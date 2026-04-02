// Global auth state — any component can call useAuth() to get the current user
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, initializeData } from '../utils/localStorage';

const AuthContext = createContext();
const SESSION_KEY = 'edutrack_session_v5';

// Run once synchronously before first render to restore session
function restoreUser() {
  try {
    initializeData();                          // ensure seed data exists
    const users = getUsers();
    const savedId = localStorage.getItem(SESSION_KEY);
    if (savedId) {
      return users.find(u => u.id === savedId) || null;
    }
  } catch (_) {}
  return null;
}

export const AuthProvider = ({ children }) => {
  // Lazy initializer: runs synchronously, user is non-null from the very first render
  const [user, setUser] = useState(() => restoreUser());

  // Keep usersList in sync (only needed for Login's display)
  const [usersList, setUsersList] = useState(() => {
    try { return getUsers(); } catch (_) { return []; }
  });

  // Re-seed and reload list once on mount (in case initializeData was not yet called)
  useEffect(() => {
    initializeData();
    setUsersList(getUsers());
  }, []);

  const login = (id) => {
    const found = getUsers().find(u => u.id === id);
    if (found) {
      setUser(found);
      localStorage.setItem(SESSION_KEY, id);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, usersList, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
