// // import axios from 'axios';
// import axiosInstance from '../../api/axiosInstance';



// // const API_URL = '/api';

// // const login = async (credentials: any) => {

// //     const res = await axiosInstance.post(`/auth/login`, credentials, {
// //         withCredentials: true,
// //     });
// //     return res.data;
// // };

// // const adminLogin = async (credentials: any) => {
// //     const res = await axiosInstance.post(`/admin/auth/login`, credentials, {
// //         withCredentials: true,
// //     });
// //     return res.data;
// // };

// const login = async (credentials: any, isAdmin = false) => {
//     const url = isAdmin ? `/admin/auth/login` : `/auth/login`;

//     const res = await axiosInstance.post(url, credentials, {
//         withCredentials: true,
//     });

//     return res.data;
// };

// const signup = async (userData: any) => {
//     const res = await axiosInstance.post(`/auth/signup`, userData, {
//         withCredentials: true,
//     });
//     return res.data;
// };

// const logout = async () => {
//     const res = await axiosInstance.post(`/auth/logout`, {}, {
//         withCredentials: true,
//     });
//     return res.data;
// };

// const getCurrentUser = async () => {
//     const res = await axiosInstance.get(`/auth/me`, {
//         withCredentials: true,
//     });
//     return res.data;
// };

// const authService = {
//     login,
//     // adminLogin,
//     signup,
//     logout,
//     getCurrentUser,
// };

// export default authService;



// // src/redux/auth/authService.ts
// import axiosInstance from '../../api/axiosInstance';

// // ✅ Combined Login (user + admin)
// const login = async (
//     credentials: { email: string; password: string },
//     isAdmin?: boolean
// ) => {
//     const url = isAdmin ? `/admin/auth/login` : `/auth/login`;

//     const res = await axiosInstance.post(url, credentials, {
//         withCredentials: true,
//     });

//     return res.data;
// };

// const signup = async (userData: any) => {
//     const res = await axiosInstance.post(`/auth/signup`, userData, {
//         withCredentials: true,
//     });
//     return res.data;
// };

// const logout = async () => {
//     const res = await axiosInstance.post(
//         `/auth/logout`,
//         {},
//         { withCredentials: true }
//     );
//     return res.data;
// };

// const getCurrentUser = async () => {
//     const res = await axiosInstance.get(`/auth/me`, {
//         withCredentials: true,
//     });
//     return res.data;
// };

// const authService = {
//     login,
//     signup,
//     logout,
//     getCurrentUser,
// };

// export default authService;


























// // src/redux/auth/authService.ts

// import axiosInstance from '../../api/axiosInstance';

// // ==========================
// // 🔐 LOGIN (USER / ADMIN)
// // ==========================
// const login = async (
//     credentials: { email: string; password: string },
//     isAdmin?: boolean
// ) => {
//     try {
//         const url = isAdmin
//             ? `/admin/auth/login`
//             : `/auth/login`;


//         console.log(credentials);
//         console.log(axiosInstance.defaults.baseURL);
//         console.log(url);



//         const res = await axiosInstance.post(url, credentials, {
//             withCredentials: true, // 🔥 IMPORTANT (cookie-based auth)
//         });

//         return res.data;
//     } catch (error: any) {
//         throw error.response?.data || { message: 'Login failed' };
//     }
// };


// // --- Auth Endpoints ---
// const adminLogin = async (credentials: any) => {
//     const res = await axiosInstance.post('/admin/auth/login', credentials);
//     return res.data;
// }


// // ==========================
// // 📝 SIGNUP
// // ==========================
// const signup = async (userData: any) => {
//     console.log(userData);

//     try {
//         const res = await axiosInstance.post(
//             `/auth/signup`,
//             userData,
//             {
//                 withCredentials: true,
//             }
//         );

//         return res.data;
//     } catch (error: any) {
//         throw error.response?.data || { message: 'Signup failed' };
//     }
// };

// const verifyOtp = async ({ email, otpCode }: { email: string; otpCode: string }) => {
//     try {
//         const res = await axiosInstance.post(
//             `/auth/verify-otp`,
//             { email, otpCode },
//             {
//                 withCredentials: true,
//             }
//         );
//         return res.data;
//     } catch (error: any) {
//         throw error.response?.data || { message: 'Verification failed' };
//     }
// };

// // ==========================
// // 🚪 LOGOUT
// // ==========================
// const logout = async () => {
//     try {
//         const res = await axiosInstance.post(
//             `/auth/logout`,
//             {},
//             {
//                 withCredentials: true,
//             }
//         );

//         return res.data;
//     } catch (error: any) {
//         throw error.response?.data || { message: 'Logout failed' };
//     }
// };

// // ==========================
// // 👤 GET CURRENT USER
// // ==========================
// const getCurrentUser = async () => {
//     try {
//         const res = await axiosInstance.get(`/auth/me`, {
//             withCredentials: true, // 🔥 sends cookies automatically
//         });

//         return res.data;
//     } catch (error: any) {
//         // IMPORTANT: return null instead of throwing for auth state checks
//         return null;
//     }
// };

// // ==========================
// // 📦 EXPORT SERVICE
// // ==========================
// const authService = {
//     login,
//     signup,
//     verifyOtp,
//     logout,
//     getCurrentUser,
// };

// export default authService;



// // src/redux/auth/authService.ts

// import axiosInstance from '../../api/axiosInstance';

// const login = async (credentials: any, isAdmin?: boolean) => {
//     const url = isAdmin ? '/admin/auth/login' : '/auth/login';
//     const res = await axiosInstance.post(url, credentials, { withCredentials: true });
//     return res.data;
// };

// const signup = async (userData: any) => {
//     const res = await axiosInstance.post('/auth/signup', userData, { withCredentials: true });
//     return res.data;
// };

// // const verifyOtp = async (data: { email: string; otp: string }, isAdmin?: boolean) => {
// //     const url = isAdmin ? '/admin/auth/verify-otp' : '/auth/verify-otp';
// //     const res = await axiosInstance.post(url, data, { withCredentials: true });
// //     return res.data;
// // };

// const verifyOtp = async (data: { email: string; otp: string }, isAdmin?: boolean) => {
//     const url = isAdmin ? '/admin/auth/verify-otp' : '/auth/verify-otp';

//     // Most backends expect { email, otp } or { email, otpCode }
//     // Ensure this matches your API expectation exactly
//     const res = await axiosInstance.post(url, data, { withCredentials: true });
//     return res.data;
// };

// const logout = async () => {
//     await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
// };

// const getCurrentUser = async () => {
//     try {
//         const res = await axiosInstance.get('/auth/me', { withCredentials: true });
//         return res.data;
//     } catch {
//         return null;
//     }
// };

// const authService = { login, signup, verifyOtp, logout, getCurrentUser };
// export default authService;


// src/redux/auth/authService.ts
import axiosInstance from '../../api/axiosInstance';

const login = async (credentials: any, isAdmin?: boolean) => {
    const url = isAdmin ? '/admin/auth/login' : '/auth/login';
    const res = await axiosInstance.post(url, credentials, { withCredentials: true });
    return res.data;
};

const signup = async (userData: any) => {
    const res = await axiosInstance.post('/auth/signup', userData, { withCredentials: true });
    return res.data;
};

const verifyOtp = async (data: { email: string; otpCode: string }, isAdmin?: boolean) => {
    const url = isAdmin ? '/admin/auth/verify-otp' : '/auth/verify-otp';
    console.log("redux verify", data);

    const res = await axiosInstance.post(url, data, { withCredentials: true });
    return res.data;
};

const resendOtp = async (data: { email: string }, isAdmin?: boolean) => {
    const url = isAdmin ? '/admin/auth/resend-otp' : '/auth/resend-otp';
    const res = await axiosInstance.post(url, data, { withCredentials: true });
    return res.data;
};

const logout = async () => {
    await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
};

const getCurrentUser = async () => {
    try {
        const res = await axiosInstance.get('/auth/me', { withCredentials: true });
        return res.data;
    } catch { return null; }
};

const authService = { login, signup, verifyOtp, logout, getCurrentUser, resendOtp };
export default authService;