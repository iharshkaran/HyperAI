import React, { createContext, useContext, useState } from 'react';

export interface User {
  _id: string;
  email: string;
  avatar?: string;
  fullName: {
    firstName: string;
    lastName: string;
  };
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
    // State to hold the authenticated user
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleSetUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    handleSetUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};