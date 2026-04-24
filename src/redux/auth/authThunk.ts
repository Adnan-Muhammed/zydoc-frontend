// import { createAsyncThunk } from '@reduxjs/toolkit';
// import authService from './authService';

// // // Login User
// // export const loginUser = createAsyncThunk(
// //     'auth/loginUser',
// //     async (credentials: any, { rejectWithValue }) => {
// //         try {
// //             return await authService.login(credentials);
// //         } catch (error: any) {
// //             return rejectWithValue(error.response?.data?.message || 'Login failed');
// //         }
// //     }
// // );

// // // Login Admin
// // export const loginAdmin = createAsyncThunk(
// //     'auth/loginAdmin',
// //     async (credentials: any, { rejectWithValue }) => {
// //         try {
// //             return await authService.adminLogin(credentials);
// //         } catch (error: any) {
// //             return rejectWithValue(error.response?.data?.message || 'Admin login failed');
// //         }
// //     }
// // );


// // combined Login
// export const login = createAsyncThunk(
//     'auth/login',
//     async (
//         { credentials, isAdmin }: { credentials: any; isAdmin?: boolean },
//         { rejectWithValue }
//     ) => {
//         try {
//             return await authService.login(credentials, isAdmin);
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data?.message || 'Login failed');
//         }
//     }
// );


// // Logout
// export const logoutUser = createAsyncThunk(
//     'auth/logoutUser',
//     async (_, { rejectWithValue }) => {
//         try {
//             await authService.logout();
//             return true;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data?.message || 'Logout failed');
//         }
//     }
// );

// // Check Auth
// export const checkAuth = createAsyncThunk(
//     'auth/checkAuth',
//     async (_, { rejectWithValue }) => {
//         try {
//             return await authService.getCurrentUser();
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data?.message || 'Session invalid');
//         }
//     }
// );

import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

// ✅ FLAT LOGIN
export const login = createAsyncThunk(
    'auth/login',
    async (
        {
            email,
            password,
            isAdmin,
        }: { email: string; password: string; isAdmin?: boolean },
        { rejectWithValue }
    ) => {
        try {
            return await authService.login(
                { email, password },
                isAdmin
            );
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            );
        }
    }
);

// ✅ Signup
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async (userData: any, { rejectWithValue }) => {
        try {
            return await authService.signup(userData);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Signup failed'
            );
        }
    }
);

// ✅ Logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
            return true;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Logout failed'
            );
        }
    }
);

// ✅ Check Auth
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            return await authService.getCurrentUser();
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Session invalid'
            );
        }
    }
);