// src/redux/auth/authTypes.ts

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isProfileCompleted?: boolean;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    avatarUrl?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Accommodates dynamic role-specific backend fields (consultationSettings, doctorProfile, etc.)
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthChecked: boolean;
    requires2FA: boolean;
    emailForOTP: string | null;
    error: string | null;
}
