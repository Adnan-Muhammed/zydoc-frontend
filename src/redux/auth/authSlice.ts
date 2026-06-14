// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// // import { loginUser, loginAdmin, signupUser, logoutUser, checkAuth } from './authThunk';
// import { login, signupUser, logoutUser, checkAuth } from './authThunk';
// import { AuthState, User } from './authTypes';

// const initialState: AuthState = {
//     user: null,
//     accessToken: null,
//     isAuthenticated: false,
//     // isLoading: true,  // 👉 from hydration logic (keep it only for API calls)
//     isLoading: false,        // ✅ API loading only
//     isAuthChecked: false,    // ✅ NEW
//     error: null,
// };

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
//             state.user = action.payload.user;
//             state.accessToken = action.payload.accessToken;
//             state.isAuthenticated = true;
//             // state.isLoading = false;
//             state.isAuthChecked = true;   // ✅ important

//         },
//         clearCredentials(state) {
//             state.user = null;
//             state.accessToken = null;
//             state.isAuthenticated = false;
//             // state.isLoading = false;
//             state.isAuthChecked = true;   // ✅ important

//         },
//         clearError(state) {
//             state.error = null;
//         }
//     },
//     extraReducers: (builder) => {
//         builder

//             // Login User
//             .addCase(loginUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(loginUser.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isAuthenticated = true;
//                 state.user = action.payload.user;
//                 state.accessToken = action.payload.accessToken;
//             })
//             .addCase(loginUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // Login Admin
//             .addCase(loginAdmin.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(loginAdmin.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isAuthenticated = true;
//                 state.user = action.payload.user;
//                 state.accessToken = action.payload.accessToken;
//             })
//             .addCase(loginAdmin.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // Signup
//             .addCase(signupUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(signupUser.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isAuthenticated = true;
//                 state.user = action.payload.user;
//                 state.accessToken = action.payload.accessToken;
//             })
//             .addCase(signupUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // Logout
//             .addCase(logoutUser.fulfilled, (state) => {
//                 state.user = null;
//                 state.accessToken = null;
//                 state.isAuthenticated = false;
//                 state.isAuthChecked = true;   // ✅ ADD THIS

//             })

//             // Check Auth
//             .addCase(checkAuth.pending, (state) => {
//                 state.isLoading = true;
//             })
//             .addCase(checkAuth.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isAuthenticated = true;
//                 state.user = action.payload.user;
//                 state.isAuthChecked = true; // 👈 Add this
//             })
//             .addCase(checkAuth.rejected, (state) => {
//                 state.isLoading = false;
//                 state.isAuthenticated = false;
//                 state.user = null;
//                 state.isAuthChecked = true; // 👈 Add this
//             });
//     },
// });

// export const { setCredentials, clearCredentials, clearError } = authSlice.actions;
// export default authSlice.reducer;






// // src/redux/auth/authSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { login, signupUser, logoutUser, checkAuth } from './authThunk';
// import { AuthState, User } from './authTypes';

// const initialState: AuthState = {
//     user: null,
//     accessToken: null,
//     isAuthenticated: false,
//     isLoading: false,
//     isAuthChecked: false,
//     error: null,
// };

// // ✅ Reusable success handler
// const handleAuthSuccess = (state: AuthState, action: any) => {
//     state.isLoading = false;
//     state.isAuthenticated = true;
//     state.user = action.payload.user;
//     state.accessToken = action.payload.accessToken;
// };

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         setCredentials(
//             state,
//             action: PayloadAction<{ user: User; accessToken: string }>
//         ) {
//             state.user = action.payload.user;
//             state.accessToken = action.payload.accessToken;
//             state.isAuthenticated = true;
//             state.isAuthChecked = true;
//         },
//         clearCredentials(state) {
//             state.user = null;
//             state.accessToken = null;
//             state.isAuthenticated = false;
//             state.isAuthChecked = true;
//         },
//         clearError(state) {
//             state.error = null;
//         },
//     },
//     extraReducers: (builder) => {
//         builder

//             // ✅ LOGIN
//             .addCase(login.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(login.fulfilled, (state, action) => {
//                 handleAuthSuccess(state, action);

//                 // ✅ Role protection (admin login safety)
//                 if (
//                     action.meta.arg?.isAdmin &&
//                     action.payload.user.role !== 'admin'
//                 ) {
//                     state.error = 'Not authorized as admin';
//                     state.isAuthenticated = false;
//                     state.user = null;
//                     state.accessToken = null;
//                 }
//             })
//             .addCase(login.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // ✅ SIGNUP
//             .addCase(signupUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(signupUser.fulfilled, handleAuthSuccess)
//             .addCase(signupUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // ✅ LOGOUT
//             .addCase(logoutUser.fulfilled, (state) => {
//                 state.user = null;
//                 state.accessToken = null;
//                 state.isAuthenticated = false;
//                 state.isAuthChecked = true;
//             })

//             // ✅ CHECK AUTH
//             .addCase(checkAuth.pending, (state) => {
//                 state.isLoading = true;
//             })
//             .addCase(checkAuth.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isAuthenticated = true;
//                 state.user = action.payload.user;
//                 state.accessToken = action.payload.accessToken; // backend must send this
//                 state.isAuthChecked = true;
//             })
//             .addCase(checkAuth.rejected, (state) => {
//                 state.isLoading = false;
//                 state.isAuthenticated = false;
//                 state.user = null;
//                 state.accessToken = null;
//                 state.isAuthChecked = true;
//             });
//     },
// });

// export const { setCredentials, clearCredentials, clearError } =
//     authSlice.actions;

// export default authSlice.reducer;





// // src/redux/auth/authSlice.ts
// import { createSlice } from '@reduxjs/toolkit';
// import { loginUser, verifyOtp, signupUser, logoutUser, checkAuth } from './authThunk';
// import { AuthState } from './authTypes';

// const initialState: AuthState = {
//     user: null,
//     requires2FA: false,
//     emailForOTP: null,
//     isAuthenticated: false,
//     isLoading: false,
//     isAuthChecked: false,
//     error: null,
// };

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         clearAuthError: (state) => { state.error = null; },
//     },
//     extraReducers: (builder) => {
//         builder
//             // Login
//             .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
//             .addCase(loginUser.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 if (action.payload.requires2FA) {
//                     state.requires2FA = true;
//                     state.emailForOTP = action.meta.arg.credentials.email;
//                 } else {
//                     state.user = action.payload.user;
//                     state.isAuthenticated = true;
//                 }
//             })
//             .addCase(loginUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })



//             // --- SIGNUP ---
//             .addCase(signupUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(signupUser.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 // If backend requires OTP after signup
//                 state.requires2FA = true;
//                 state.emailForOTP = action.meta.arg.email;
//             })
//             .addCase(signupUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })
//             // Verify OTP
//             .addCase(verifyOtp.fulfilled, (state, action) => {
//                 state.user = action.payload.user;
//                 state.isAuthenticated = true;
//                 state.requires2FA = false;
//                 state.emailForOTP = null;
//             })
//             // Check Auth & Logout
//             .addCase(checkAuth.fulfilled, (state, action) => {
//                 state.user = action.payload?.user || null;
//                 state.isAuthenticated = !!action.payload;
//                 state.isAuthChecked = true;
//             })
//             .addCase(logoutUser.fulfilled, () => initialState);
//     },
// });

// export const { clearAuthError } = authSlice.actions;
// export default authSlice.reducer;






// // src/redux/auth/authSlice.ts
// import { createSlice } from '@reduxjs/toolkit';
// import { loginUser, verifyOtp, signupUser, logoutUser, checkAuth } from './authThunk';
// import { AuthState } from './authTypes';

// const initialState: AuthState = {
//     user: null,
//     requires2FA: false,
//     emailForOTP: null,
//     isAuthenticated: false,
//     isLoading: false,
//     isAuthChecked: false,
//     error: null,
// };

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         // Clear any error
//         clearAuthError: (state) => {
//             state.error = null;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             // LOGIN USER
//             .addCase(loginUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(loginUser.fulfilled, (state, action) => {
//                 state.isLoading = false;

//                 if (action.payload.requires2FA) {
//                     state.requires2FA = true;
//                     state.emailForOTP = action.meta.arg.credentials.email;
//                 } else {
//                     state.user = action.payload.user;
//                     state.isAuthenticated = true;
//                 }
//             })
//             .addCase(loginUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // SIGNUP USER
//             .addCase(signupUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(signupUser.fulfilled, (state, action) => {
//                 state.isLoading = false;

//                 if (action.payload.requires2FA) {
//                     state.requires2FA = true;
//                     state.emailForOTP = action.meta.arg.email;
//                 } else {
//                     state.user = action.payload.user;
//                     state.isAuthenticated = true;
//                 }
//             })
//             .addCase(signupUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // VERIFY OTP
//             .addCase(verifyOtp.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.requires2FA = false;
//                 state.emailForOTP = null;
//                 state.user = action.payload.user;
//                 state.isAuthenticated = true;
//             })
//             .addCase(verifyOtp.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//             })

//             // CHECK AUTH
//             .addCase(checkAuth.fulfilled, (state, action) => {
//                 state.isAuthChecked = true;
//                 state.isLoading = false;
//                 state.user = action.payload?.user || null;
//                 state.isAuthenticated = !!action.payload;
//             })
//             .addCase(checkAuth.rejected, (state) => {
//                 state.isAuthChecked = true;
//                 state.isLoading = false;
//                 state.isAuthenticated = false;
//             })

//             // LOGOUT
//             .addCase(logoutUser.fulfilled, () => initialState);




// src/redux/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { loginUser, verifyOtp, signupUser, logoutUser, checkAuth, resendOtp } from './authThunk';
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
    // generatedOtpCode: null,// just for  testing  // no need global so commenting

};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError: (state) => { state.error = null; },
        resetAuth: () => initialState, // Essential for backing out of OTP screens
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
            // Login Logic
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            // Signup Logic
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requires2FA = true;
                state.emailForOTP = action.meta.arg.email;
                // state.generatedOtpCode = action.payload.code; // just for testing
            })
            // OTP Logic
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
                // state.generatedOtpCode = action.payload.code; // just for testing
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })


            // Session Check
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload?.user || null;
                state.isAuthenticated = !!action.payload;
                state.isAuthChecked = true;
            })
            // Sync Profile Update to User State
            .addCase(updateDoctorProfile.fulfilled, (state, action) => {
                if (action.payload?.user) {
                    state.user = action.payload.user;
                }
            })
            .addCase(logoutUser.fulfilled, () => initialState)
            // Shared Loading/Error Handling via Matchers
            .addMatcher(
                (action: any) => action.type.endsWith('/pending'),
                (state: AuthState) => { state.isLoading = true; state.error = null; }
            )
            .addMatcher(
                (action: any) => action.type.endsWith('/rejected'),
                (state: AuthState, action: any) => { state.isLoading = false; state.error = action.payload as string; }
            );
    },
});

export const { clearAuthError, resetAuth, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;