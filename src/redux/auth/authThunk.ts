
// src/redux/auth/authThunk.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ credentials, isAdmin }: { credentials: { email: string; password: string; rememberDevice?: boolean;[key: string]: any }; isAdmin?: boolean }, { rejectWithValue }) => {
        try {
            return await authService.login(credentials, isAdmin);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signup',
    async (userData: any, { rejectWithValue }) => {
        try {
            const data = await authService.signup(userData);
            console.log('redux thunk result:', data);

            return data


        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Signup failed');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ data, isAdmin }: { data: { email: string; otpCode: string }; isAdmin?: boolean }, { rejectWithValue }) => {
        try {
            console.log("verify)tp", data);

            return await authService.verifyOtp(data, isAdmin);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Verification failed');
        }
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    // async ({ data, isAdmin }: { data: { email: string }; isAdmin?: boolean }, { rejectWithValue }) => {
    async (userData: any, { rejectWithValue }) => {

        try {
            const res = await authService.resendOtp(userData);
            return res;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
    return await authService.getCurrentUser();
});