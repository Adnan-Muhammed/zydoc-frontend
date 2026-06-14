import axiosInstance from '../../../api/axiosInstance';

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
};

export default adminService;