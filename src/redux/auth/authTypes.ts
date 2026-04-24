// export interface User {
//     _id: string;
//     name: string;
//     email: string;
//     role: string;
// }

// export interface AuthState {
//     user: User | null;
//     accessToken: string | null;
//     isAuthenticated: boolean;
//     isLoading: boolean;
//     isAuthChecked: boolean
//     error: string | null;
// }


export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'doctor' | 'patient';
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthChecked: boolean;
    error: string | null;
}