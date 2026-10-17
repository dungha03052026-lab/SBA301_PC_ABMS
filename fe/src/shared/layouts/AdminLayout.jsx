import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const mockLogin = (role) => {
    const mockUsers = {
      ADMIN: { id: 1, full_name: 'Trưởng Ban Quản Lý', role: 'ADMIN', token: 'mock-token-admin' },
      RESIDENT: { id: 3, full_name: 'Hồ Anh Dũng', role: 'RESIDENT', token: 'mock-token-resident' },
      TECHNICIAN: { id: 2, full_name: 'Nguyễn Văn Thợ', role: 'TECHNICIAN', token: 'mock-token-tech' },
    };
    const selectedUser = mockUsers[role];
    setUser(selectedUser);
    localStorage.setItem('user', JSON.stringify(selectedUser));
    return selectedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, mockLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);