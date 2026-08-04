// src/redux/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { loginUser, loginWithGoogleUser, verifyOtp, signupUser, logoutUser, checkAuth, resendOtp } from './authThunk';
import { updateDoctorProfile } from '../features/doctor/doctorThunk';
import { AuthState } from './authTypes';

const initialState: AuthState = {
    user: null,
    accessToken: null,
    requires2FA: false,
    emailForOTP: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthChecked: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError: (state) => { state.error = null; },
        resetAuth: () => initialState,
        setCredentials(state, action) {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            state.isAuthChecked = true;
        },
        clearCredentials(state) {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.isAuthChecked = true;
            state.requires2FA = false;
            state.emailForOTP = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(loginWithGoogleUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                state.requires2FA = false;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requires2FA = true;
                state.emailForOTP = action.meta.arg.email;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.requires2FA = false;
                state.emailForOTP = null;
            })
            .addCase(resendOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requires2FA = true;
                state.emailForOTP = action.meta.arg.email;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload?.user || null;
                state.isAuthenticated = !!action.payload;
                state.isAuthChecked = true;
            })
            // Sync doctor profile update into auth user state
            .addCase(updateDoctorProfile.fulfilled, (state, action) => {
                if (action.payload?.user) {
                    state.user = action.payload.user;
                }
            })
            .addCase(logoutUser.fulfilled, () => initialState)
            // Global loading/error handling via matchers
            .addMatcher(
                (action: { type: string }) => action.type.endsWith('/pending'),
                (state: AuthState) => { state.isLoading = true; state.error = null; }
            )
            .addMatcher(
                (action: { type: string; payload?: unknown }) => action.type.endsWith('/rejected'),
                (state: AuthState, action: { payload?: unknown }) => {
                    state.isLoading = false;
                    state.error = action.payload as string;
                }
            );
    },
});

export const { clearAuthError, resetAuth, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;