
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('adminUser')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('adminToken'),
  );

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/auth/login', { email, password });
    const { token, admin } = res.data;

    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(admin));

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(admin);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);