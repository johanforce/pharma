import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, getCurrentAdminUser, loginAdmin, logoutAdmin } from '../services/firebase';

interface AuthContextType {
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentAdminUser();
    setAdminUser(user);
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await loginAdmin(email, pass);
      setAdminUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAdminLoggedIn: !!adminUser,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
