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


import axiosInstance from '../../api/axiosInstance';

// ✅ Combined Login (user + admin)
const login = async (
    credentials: { email: string; password: string },
    isAdmin?: boolean
) => {
    const url = isAdmin ? `/admin/auth/login` : `/auth/login`;

    const res = await axiosInstance.post(url, credentials, {
        withCredentials: true,
    });

    return res.data;
};

const signup = async (userData: any) => {
    const res = await axiosInstance.post(`/auth/signup`, userData, {
        withCredentials: true,
    });
    return res.data;
};

const logout = async () => {
    const res = await axiosInstance.post(
        `/auth/logout`,
        {},
        { withCredentials: true }
    );
    return res.data;
};

const getCurrentUser = async () => {
    const res = await axiosInstance.get(`/auth/me`, {
        withCredentials: true,
    });
    return res.data;
};

const authService = {
    login,
    signup,
    logout,
    getCurrentUser,
};

export default authService;