// // export interface User {
// //     _id: string;
// //     name: string;
// //     email: string;
// //     role: string;
// // }

// // export interface AuthState {
// //     user: User | null;
// //     accessToken: string | null;
// //     isAuthenticated: boolean;
// //     isLoading: boolean;
// //     isAuthChecked: boolean
// //     error: string | null;
// // }



// // src/redux/auth/authTypes.ts
// export interface User {
//     _id: string;
//     name: string;
//     email: string;
//     role: 'admin' | 'doctor' | 'patient';
//     isApproved?: boolean;
// }

// export interface AuthState {
//     user: User | null;
//     requires2FA: boolean; // Added for Admin 2FA flow
//     emailForOTP: string | null;
//     isAuthenticated: boolean;
//     isLoading: boolean;
//     isAuthChecked: boolean;
//     error: string | null;
// }




// src/redux/auth/authTypes.ts

export interface User {
    _id: string; 
    name: string;
    email: string;
    role: string; 
    isProfileCompleted?: boolean;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthChecked: boolean;
    requires2FA: boolean; // Admin 2FA flag
    emailForOTP: string | null; // Email used for OTP verification
    error: string | null;
    // generatedOtpCode: string | null;// just for testing

}
