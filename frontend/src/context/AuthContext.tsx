import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Shape the user data (According to MongoDB schema)
interface User {
  _id: string;
  email: string;
  fullName: {
    firstName: string;
    lastName?: string;
  };
}

// 2. Blueprint for the context value
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

// 3. Main Context object
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Provider Component
export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('hyperai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSetUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('hyperai_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('hyperai_user');
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
      {props.children}
    </AuthContext.Provider>
  );
};

// 5. Custom hookfor easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};