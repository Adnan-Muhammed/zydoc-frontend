/**
 * src/api/endpoints.ts
 *
 * Centralised API endpoint constants for the Zydoc backend.
 * Use these instead of inline strings to prevent typos and make
 * future URL changes a single-file update.
 *
 * All paths are relative to the axiosInstance baseURL (NEXT_PUBLIC_API_URL/api).
 */

export const AUTH = {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/admin/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    VERIFY_OTP: '/auth/verify-otp',
    ADMIN_VERIFY_OTP: '/admin/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    ADMIN_RESEND_OTP: '/admin/auth/resend-otp',
    GOOGLE: '/auth/google',
    ADMIN_GOOGLE: '/api/admin/auth/google',
} as const;

export const ADMIN = {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    APPROVE_DOCTOR: (doctorId: string) => `/admin/doctors/${doctorId}/approve`,
    LOGS: '/admin/logs',
} as const;

export const DOCTORS = {
    LIST: '/doctors',
    BY_ID: (id: string) => `/doctors/${id}`,
    UPDATE_PROFILE: '/doctors/profile',
} as const;

export const APPOINTMENTS = {
    CREATE: '/appointments',
    PATIENT_LIST: '/appointments/patient',
    AVAILABILITY: (doctorId: string) => `/appointments/availability/${doctorId}`,
} as const;

export const NOTIFICATIONS = {
    LIST: '/notifications',
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/notifications/read-all',
} as const;

