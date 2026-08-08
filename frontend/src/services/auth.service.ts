import api from './api';

import type {
    User,
    LoginPayload,
    RegisterPayload,
    VerifyOtpPayload,
    UpdateProfilePayload,
    ApiResponse,
} from '../types/auth.types';

export const authService = {
    // 1. Register User (Generates OTP) -> POST /auth/register
    register: async (payload: RegisterPayload) => {
        const res = await api.post<ApiResponse<{ email: string }>>('/auth/register', payload);
        return res.data;
    },

    // 2. Verify OTP (Auto Login Step) -> POST /auth/verify-otp
    verifyOtp: async (payload: VerifyOtpPayload) => {
        const res = await api.post<ApiResponse<User>>('/auth/verify-otp', payload);
        return res.data;
    },

    // 3. Resend OTP -> POST /auth/resend-otp
    resendOtp: async (email: string) => {
        const res = await api.post<ApiResponse>('/auth/resend-otp', { email });
        return res.data;
    },

    // 4. Login User -> POST /auth/login
    login: async (credentials: LoginPayload) => {
        const res = await api.post<ApiResponse<User>>('/auth/login', credentials);
        return res.data;
    },

    // 5. Get Current User Info (Protected) -> GET /auth/me
    getMe: async () => {
        const res = await api.get<ApiResponse<User>>('/auth/me');
        return res.data;
    },

    // 6. Logout User -> POST /auth/logout
    logout: async () => {
        const res = await api.post<ApiResponse>('/auth/logout');
        return res.data;
    },

    // 7. Update Profile (Protected) -> PUT /auth/update-profile
    updateProfile: async (payload: UpdateProfilePayload) => {
        const res = await api.put<ApiResponse<User>>('/auth/update-profile', payload);
        return res.data;
    },

    // 8. Forgot Password -> POST /auth/forgot-password
    forgotPassword: async (email: string) => {
        const res = await api.post<ApiResponse>('/auth/forgot-password', { email });
        return res.data;
    },

    // 9. Reset Password -> POST /auth/reset-password/:token
    resetPassword: async (token: string, newPassword: string) => {
        const res = await api.post<ApiResponse>(`/auth/reset-password/${token}`, { newPassword });
        return res.data;
    },

    // 10. Google OAuth Helper Method (Redirects to Backend)
    redirectToGoogleAuth: () => {
        const backendBaseUrl = import.meta.env.VITE_API_BASE_URL;
        window.location.href = `${backendBaseUrl}/auth/google`;
    }
};