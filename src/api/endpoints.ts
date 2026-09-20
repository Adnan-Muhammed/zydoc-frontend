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
    DOCTORS: '/admin/doctors',
    PENDING_DOCTORS: '/admin/doctors/pending',
    DOCTOR_STATS: '/admin/doctors/stats',
    APPROVE_DOCTOR: (doctorId: string) => `/admin/doctors/${doctorId}/approve`,
    REJECT_DOCTOR: (doctorId: string) => `/admin/doctors/${doctorId}/reject`,
    PATIENTS: '/admin/patients',
    PATIENT_STATS: '/admin/patients/stats',
    APPOINTMENTS: '/admin/appointments',
    APPOINTMENT_STATS: '/admin/appointments/stats',
    REFUNDS_PENDING: '/admin/refunds/pending',
    APPROVE_REFUND: (refundId: string) => `/admin/refunds/${refundId}/approve`,
    REJECT_REFUND: (refundId: string) => `/admin/refunds/${refundId}/reject`,
    COMMISSION: '/admin/settings/commission',
    ANALYTICS_SUMMARY: '/admin/analytics/summary',
    ANALYTICS_REVENUE_CHART: '/admin/analytics/revenue-chart',
    ANALYTICS_TOP_DOCTORS: '/admin/analytics/top-doctors',
    ANALYTICS_CLINICAL: '/admin/analytics/clinical',
    TOGGLE_DOCTOR_STATUS: (doctorId: string) => `/admin/users/doctors/${doctorId}/toggle-status`,
    TOGGLE_PATIENT_STATUS: (patientId: string) => `/admin/users/patients/${patientId}/toggle-status`,
    LOGS: '/admin/logs',
    TRANSACTIONS: '/admin/transactions',
    SETTLE_TRANSACTION: (transactionId: string) => `/admin/transactions/${transactionId}/settle`,
    FINANCIAL_LEDGER: '/admin/financials/ledger',
    SETTLE_PAYOUT: (transactionId: string) => `/admin/financials/settle/${transactionId}`,
    NOTIFICATIONS: '/admin/notifications',
    MARK_NOTIF_READ: (id: string) => `/admin/notifications/${id}/read`,
    MARK_ALL_NOTIFS_READ: '/admin/notifications/read-all',
} as const;

export const DOCTORS = {
    LIST: '/doctors',
    BY_ID: (id: string) => `/doctors/${id}`,
    UPDATE_PROFILE: '/doctors/profile',
    UPDATE_FCM_TOKEN: '/doctor/fcm-token',  // mounted at /api/doctor/ in server.js
    EARNINGS: '/doctor/earnings',
    BANK_DETAILS: '/doctor/bank-details',
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

export const REVIEWS = {
    CREATE: '/reviews',
    BY_DOCTOR: (doctorId: string) => `/reviews/doctor/${doctorId}`,
    ELIGIBILITY: (doctorId: string) => `/reviews/eligibility/${doctorId}`,
    BY_APPOINTMENT: (appointmentId: string) => `/reviews/appointment/${appointmentId}`,
} as const;

export const WALLET = {
    PATIENT_WALLET: '/patient/wallet',
} as const;

export const PAYMENT = {
    CREATE_PAYMENT_ORDER: '/payment/create-order',
    CREATE_RAZORPAY_ORDER: '/appointments/create-razorpay-order',
    VERIFY: '/payment/verify',
    VERIFY_APPOINTMENT: '/appointments/verify-payment',
} as const;

