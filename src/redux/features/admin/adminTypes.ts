


interface User {
    _id: string;
    name: string;
    role: string;
    isApproved?: boolean;
}


export interface AdminState {
    stats: any;
    users: User[];
    logs: any[];
    isLoading: boolean;
    error: string | null;
}