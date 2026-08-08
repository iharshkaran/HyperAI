import React, { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  UpdateProfilePayload,
  ApiResponse,
} from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<ApiResponse<User>>;
  register: (data: RegisterPayload) => Promise<ApiResponse<{ email: string }>>;
  verifyOtp: (data: VerifyOtpPayload) => Promise<ApiResponse<User>>;
  resendOtp: (email: string) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<ApiResponse<User>>;
  checkAuth: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial authentication check on app render
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. Login Handler
  const login = async (credentials: LoginPayload) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  };

  // 2. Register Handler
  const register = async (data: RegisterPayload) => {
    try {
      return await authService.register(data);
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
      };
    }
  };

  // 3. Verify OTP Handler
  const verifyOtp = async (data: VerifyOtpPayload) => {
    try {
      const res = await authService.verifyOtp(data);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Verification failed',
      };
    }
  };

  // 4. Resend OTP Handler
  const resendOtp = async (email: string) => {
    try {
      return await authService.resendOtp(email);
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Resending OTP failed',
      };
    }
  };

  // 5. Update Profile Handler
  const updateProfile = async (data: UpdateProfilePayload) => {
    try {
      const res = await authService.updateProfile(data);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Profile update failed',
      };
    }
  };

  // 6. Logout Handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateProfile,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};