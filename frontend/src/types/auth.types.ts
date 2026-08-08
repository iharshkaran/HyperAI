export interface UserFullName {
  firstName: string;
  lastName?: string;
}

export interface User {
  _id: string;
  email: string;
  fullName: UserFullName;
  avatar?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  fullName?: {
    firstName: string;
    lastName?: string;
  };
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

// API Generic Response Wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  token?: string;
  email?: string;
  user?: T;
}