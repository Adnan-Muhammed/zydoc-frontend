import axiosInstance from '../../../api/axiosInstance';
import { ADMIN } from '@/api/endpoints';

export const adminService = {
    // --- Management Endpoints ---
    getSystemStats: async () => {
        const res = await axiosInstance.get('/admin/stats');
        return res.data;
    },

    getAllUsers: async () => {
        const res = await axiosInstance.get('/admin/users');
        return res.data;
    },

    approveDoctor: async (doctorId: string) => {
        const res = await axiosInstance.put(`/admin/doctors/${doctorId}/approve`);
        return res.data;
    },

    getAuditLogs: async () => {
        const res = await axiosInstance.get('/admin/logs');
        return res.data;
    },

    fetchTransactions: async (page = 1, limit = 10) => {
        const res = await axiosInstance.get(ADMIN.TRANSACTIONS, {
            params: { page, limit }
        });
        return res.data;
    },

    settleTransaction: async (transactionId: string) => {
        const res = await axiosInstance.patch(ADMIN.SETTLE_TRANSACTION(transactionId));
        return res.data;
    },
};

export default adminService;