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
