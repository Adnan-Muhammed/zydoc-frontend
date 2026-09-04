/**
 * src/types/index.ts
 *
 * Shared TypeScript types for the Zydoc frontend.
 * Import from here for cross-cutting types; feature-specific types
 * remain co-located with their feature (e.g., authTypes.ts, adminTypes.ts).
 */

// Re-export auth types for convenient access
export type { User, AuthState } from '@/redux/auth/authTypes';
export type { AdminUser, AdminState, SystemStats } from '@/redux/features/admin/adminTypes';

/** Roles available in the system */
export type UserRole = 'admin' | 'doctor' | 'patient';

/** Generic API response envelope */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

/** Pagination metadata returned by list endpoints */
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/** Doctor Bank & Payout Details */
export interface BankDetails {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
}

/** Transaction Status */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'settled';

/** Transaction Entity */
export interface Transaction {
    _id: string;
    id?: string;
    appointmentId?: {
        _id: string;
        appointmentDate?: string;
        appointmentTime?: string;
        consultationType?: string;
        status?: string;
    } | any;
    doctorId?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        specialty?: string;
        avatarUrl?: string;
        phone?: string;
        bankDetails?: BankDetails;
    } | any;
    patientId?: {
        _id: string;
        email?: string;
        googleName?: string;
        googleAvatarUrl?: string;
        profileId?: {
            firstName?: string;
            lastName?: string;
            phone?: string;
            avatarUrl?: string;
        };
    } | any;
    amount: number;
    adminCommission: number;
    doctorAmount: number;
    paymentId: string;
    status: TransactionStatus;
    createdAt: string;
    updatedAt?: string;
}

/** Doctor Profile Structure */
export interface DoctorProfile {
    _id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
    specialty?: string;
    yearsOfExperience?: number;
    bio?: string;
    avatarUrl?: string;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    accountStatus?: 'active' | 'suspended';
    isProfileCompleted?: boolean;
    rating?: number;
    reviewCount?: number;
    bankDetails?: BankDetails;
    expertiseTags?: string[];
    languages?: string[];
    consultationSettings?: {
        video?: { enabled: boolean; fee: number };
        physical?: { enabled: boolean; fee: number; clinicName?: string; clinicAddress?: string };
    };
    workingHours?: Record<string, any>;
}

/** Doctor Earnings Summary */
export interface DoctorEarningsSummary {
    pendingEarnings: number;
    settledEarnings: number;
    totalEarnings: number;
    pendingCount: number;
    settledCount: number;
}

/** Doctor Earnings API Response */
export interface DoctorEarningsResponse {
    success: boolean;
    summary: DoctorEarningsSummary;
    transactions: Transaction[];
    pagination: Pagination;
}

/** Admin Transactions API Response */
export interface AdminTransactionsResponse {
    success: boolean;
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
