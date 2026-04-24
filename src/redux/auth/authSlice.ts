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



import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, signupUser, logoutUser, checkAuth } from './authThunk';
import { AuthState, User } from './authTypes';

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthChecked: false,
    error: null,
};

// ✅ Reusable success handler
const handleAuthSuccess = (state: AuthState, action: any) => {
    state.isLoading = false;
    state.isAuthenticated = true;
    state.user = action.payload.user;
    state.accessToken = action.payload.accessToken;
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(
            state,
            action: PayloadAction<{ user: User; accessToken: string }>
        ) {
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
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // ✅ LOGIN
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                handleAuthSuccess(state, action);

                // ✅ Role protection (admin login safety)
                if (
                    action.meta.arg?.isAdmin &&
                    action.payload.user.role !== 'admin'
                ) {
                    state.error = 'Not authorized as admin';
                    state.isAuthenticated = false;
                    state.user = null;
                    state.accessToken = null;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ✅ SIGNUP
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, handleAuthSuccess)
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ✅ LOGOUT
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isAuthChecked = true;
            })

            // ✅ CHECK AUTH
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken; // backend must send this
                state.isAuthChecked = true;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.isAuthChecked = true;
            });
    },
});

export const { setCredentials, clearCredentials, clearError } =
    authSlice.actions;

export default authSlice.reducer;