// src/redux/auth/authThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

const extractAuthError = (error: unknown, defaultMessage: string): any => {
    const err = error as { response?: { data?: { message?: string, requiresVerification?: boolean, email?: string, signupToken?: string } }, message?: string };
    if (err.response?.data?.requiresVerification) {
        return err.response.data; // Return the whole object for unverified login recovery
    }
    return err.response?.data?.message || err.message || defaultMessage;
};

export const loginUser = createAsyncThunk(
    'auth/login',
    async (
        { credentials, isAdmin }: {
            credentials: { email: string; password: string; rememberDevice?: boolean;[key: string]: unknown };
            isAdmin?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            return await authService.login(credentials, isAdmin);
        } catch (error: unknown) {
            return rejectWithValue(extractAuthError(error, 'Login failed'));
        }
    }
);
 
export const loginWithGoogleUser = createAsyncThunk(
    'auth/loginWithGoogle',
    async (role: string | undefined, { rejectWithValue }) => {
        try {
            return await authService.loginWithGoogle(role);
        } catch (error: unknown) {
            return rejectWithValue(extractAuthError(error, 'Google Login failed'));
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signup',
    async (userData: { name: string; email: string; password: string; role: string; signupToken?: string }, { rejectWithValue }) => {
        try {
            return await authService.signup(userData);
        } catch (error: unknown) {
            return rejectWithValue(extractAuthError(error, 'Signup failed'));
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (
        { data, isAdmin }: { data: { email: string; otpCode: string }; isAdmin?: boolean },
        { rejectWithValue }
    ) => {
        try {
            return await authService.verifyOtp(data, isAdmin);
        } catch (error: unknown) {
            return rejectWithValue(extractAuthError(error, 'Verification failed'));
        }
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (userData: { email: string }, { rejectWithValue }) => {
        try {
            return await authService.resendOtp(userData);
        } catch (error: unknown) {
            return rejectWithValue(extractAuthError(error, 'Failed to resend OTP'));
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
    return await authService.getCurrentUser();
});

export const setRoleUser = createAsyncThunk(
    'auth/setRole',
    async (data: { role: string }, { rejectWithValue }) => {
        try {
            return await authService.setRole(data);
        } catch (error: unknown) {
            return rejectWithValue(extractAuthError(error, 'Failed to set role'));
        }
    }
);