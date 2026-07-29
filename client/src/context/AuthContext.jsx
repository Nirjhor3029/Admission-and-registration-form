import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    const { token: jwt, admin } = res.data.data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(admin));
    setToken(jwt);
    setUser(admin);
    return admin;
  };

  const studentLogin = async (credentials) => {
    const res = await api.post('/auth/student/login', credentials);
    const { token: jwt, student } = res.data.data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify({ ...student, type: 'student' }));
    setToken(jwt);
    setUser({ ...student, type: 'student' });
    return student;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, studentLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
