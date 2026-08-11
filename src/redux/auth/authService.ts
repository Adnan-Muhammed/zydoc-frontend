// src/redux/auth/authService.ts
import axiosInstance from '../../api/axiosInstance';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase/client';

const login = async (credentials: { email: string; password: string }, isAdmin?: boolean) => {
    const url = isAdmin ? '/admin/auth/login' : '/auth/login';
    const res = await axiosInstance.post(url, credentials, { withCredentials: true });
    return res.data; 
};

const signup = async (userData: { name: string; email: string; password: string; role: string; signupToken?: string }) => {
    const res = await axiosInstance.post('/auth/signup', userData, { withCredentials: true });
    return res.data;
};

const verifyOtp = async (data: { email: string; otpCode: string }, isAdmin?: boolean) => {
    const url = isAdmin ? '/admin/auth/verify-otp' : '/auth/verify-otp';
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
    } catch {
        return null;
    }
};

const loginWithGoogle = async (role?: string) => {
    const provider = new GoogleAuthProvider();
    // Force the Google account selection screen to appear instead of auto-login
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseToken = await userCredential.user.getIdToken();

    // Send the Firebase token and requested role to our custom backend to issue the JWT
    const res = await axiosInstance.post('/auth/google', { firebaseToken, role }, { withCredentials: true });
    return res.data;
};

// setRole calls the Next.js API route (same-origin → no CORS preflight)
// The Next.js route reads the accessToken cookie and calls the backend server-to-server.
// This is the same pattern used by /api/auth/refresh in this project.
const setRole = async (data: { role: string }) => {
    const res = await fetch('/api/auth/set-role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { response: { data: err } };
    }
    return res.json();
};

const authService = { login, signup, verifyOtp, logout, getCurrentUser, resendOtp, loginWithGoogle, setRole };
export default authService;