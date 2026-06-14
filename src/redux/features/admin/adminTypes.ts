export interface User {
    _id: string;
    name: string;
    role: string;
    email?: string;
    isApproved?: boolean;
}

export interface AdminState {
    // Management
    // Management
    stats: any;
    users: User[];
    logs: any[];
    // UI
    isLoading: boolean;
    error: string | null;
}