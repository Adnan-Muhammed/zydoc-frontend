// src/redux/auth/authThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

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
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);
 
export const loginWithGoogleUser = createAsyncThunk(
    'auth/loginWithGoogle',
    async (role: string | undefined, { rejectWithValue }) => {
        try {
            return await authService.loginWithGoogle(role);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            return rejectWithValue(err.response?.data?.message || err.message || 'Google Login failed');
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signup',
    async (userData: { name: string; email: string; password: string; role: string }, { rejectWithValue }) => {
        try {
            return await authService.signup(userData);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Signup failed');
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
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Verification failed');
        }
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (userData: { email: string }, { rejectWithValue }) => {
        try {
            return await authService.resendOtp(userData);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to resend OTP');
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

        console.log("set role asyncthunk inside redux ");
        
        try {
        console.log("below try catch for setRole api")
        console.log("return await authService.setRole(data) ",data);

            return await authService.setRole(data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            console.log(err);
            
            return rejectWithValue(err.response?.data?.message || 'Failed to set role');
        }
    }
);