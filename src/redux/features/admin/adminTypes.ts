// src/redux/features/admin/adminTypes.ts

export interface SystemStats {
    totalUsers?: number;
    totalPatients?: number;
    totalDoctors?: number;
    appointments?: number;
    completedAppts?: number;
    upcomingAppts?: number;
    revenue?: string;
    commission?: string;
    pendingApprovals?: number;
    uptime?: string;
    responseTime?: string;
    openTickets?: number;
}

export interface AdminUser {
    _id: string;
    name: string;
    role: string;
    email?: string;
    isApproved?: boolean;
}

export interface AdminState {
    stats: SystemStats | null;
    users: AdminUser[];
    logs: Record<string, unknown>[];
    isLoading: boolean;
    error: string | null;
}