// src/redux/features/admin/adminService.ts
import axiosInstance from '../../../api/axiosInstance';
import { ADMIN } from '@/api/endpoints';

export const adminService = {
    // --- Management Endpoints ---
    getSystemStats: async () => {
        const res = await axiosInstance.get(ADMIN.STATS);
        return res.data;
    },

    getAllUsers: async () => {
        const res = await axiosInstance.get(ADMIN.USERS);
        return res.data;
    },

    // --- Master Doctors ---
    getDoctorsMaster: async (params?: {
        search?: string;
        specialty?: string;
        verificationStatus?: string;
        accountStatus?: string;
        sort?: string;
        page?: number;
        limit?: number;
    }) => {
        const res = await axiosInstance.get(ADMIN.DOCTORS, { params });
        return res.data;
    },

    // --- Master Patients ---
    getPatientsMaster: async (params?: {
        search?: string;
        status?: string;
        gender?: string;
        sort?: string;
        page?: number;
        limit?: number;
    }) => {
        const res = await axiosInstance.get(ADMIN.PATIENTS, { params });
        return res.data;
    },

    // --- Master Appointments ---
    getAppointmentsMaster: async (params?: {
        search?: string;
        status?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        sort?: string;
        page?: number;
        limit?: number;
    }) => {
        const res = await axiosInstance.get(ADMIN.APPOINTMENTS, { params });
        return res.data;
    },

    // --- Doctor Approvals ---
    getPendingDoctors: async (page = 1, limit = 20) => {
        const res = await axiosInstance.get(ADMIN.PENDING_DOCTORS, {
            params: { page, limit },
        });
        return res.data;
    },

    getDoctorById: async (doctorId: string) => {
        const res = await axiosInstance.get(`${ADMIN.DOCTORS}/${doctorId}`);
        return res.data;
    },

    approveDoctor: async (doctorId: string, documentStatuses?: any) => {
        const res = await axiosInstance.post(ADMIN.APPROVE_DOCTOR(doctorId), {
            documentStatuses,
        });
        return res.data;
    },

    rejectDoctor: async (doctorId: string, rejectionReason: string, documentStatuses?: any) => {
        const res = await axiosInstance.post(ADMIN.REJECT_DOCTOR(doctorId), {
            rejectionReason,
            documentStatuses,
        });
        return res.data;
    },

    // --- Commission Settings ---
    getCommissionConfig: async () => {
        const res = await axiosInstance.get(ADMIN.COMMISSION);
        return res.data;
    },

    updateCommissionConfig: async (data: {
        onlineCommissionRate?: number;
        offlineCommissionRate?: number;
        note?: string;
    }) => {
        const res = await axiosInstance.post(ADMIN.COMMISSION, data);
        return res.data;
    },

    // --- Refund Approvals ---
    getPendingRefunds: async (page = 1, limit = 20, status = 'PENDING') => {
        const res = await axiosInstance.get(ADMIN.REFUNDS_PENDING, {
            params: { page, limit, status },
        });
        return res.data;
    },

    getRefundById: async (refundId: string) => {
        const res = await axiosInstance.get(`${ADMIN.REFUNDS_PENDING.replace('/pending', '')}/${refundId}`);
        return res.data;
    },

    approveRefund: async (
        refundId: string,
        data?: { adminNote?: string; refundAmount?: number }
    ) => {
        const res = await axiosInstance.post(ADMIN.APPROVE_REFUND(refundId), data || {});
        return res.data;
    },

    rejectRefund: async (refundId: string, adminNote: string) => {
        const res = await axiosInstance.post(ADMIN.REJECT_REFUND(refundId), {
            adminNote,
        });
        return res.data;
    },

    // --- Audit & Transactions ---
    getAuditLogs: async () => {
        const res = await axiosInstance.get(ADMIN.LOGS);
        return res.data;
    },

    fetchTransactions: async (page = 1, limit = 10) => {
        const res = await axiosInstance.get(ADMIN.TRANSACTIONS, {
            params: { page, limit },
        });
        return res.data;
    },

    settleTransaction: async (transactionId: string) => {
        const res = await axiosInstance.patch(ADMIN.SETTLE_TRANSACTION(transactionId));
        return res.data;
    },

    // ── Phase 2 Analytics & Dashboard ──────────────────────────────
    getAnalyticsSummary: async () => {
        const res = await axiosInstance.get(ADMIN.ANALYTICS_SUMMARY);
        return res.data;
    },

    getRevenueChart: async (params?: {
        timeframe?: string;
        days?: number;
        months?: number;
        startDate?: string;
        endDate?: string;
    }) => {
        const res = await axiosInstance.get(ADMIN.ANALYTICS_REVENUE_CHART, { params });
        return res.data;
    },

    getTopDoctors: async (limit: number = 5) => {
        const res = await axiosInstance.get(ADMIN.ANALYTICS_TOP_DOCTORS, {
            params: { limit },
        });
        return res.data;
    },

    getClinicalAnalytics: async (range: string = '30d') => {
        const res = await axiosInstance.get(ADMIN.ANALYTICS_CLINICAL, {
            params: { range },
        });
        return res.data;
    },

    // ── Phase 2 Advanced User Management Status Toggles ───────────
    toggleDoctorStatus: async (doctorId: string, reason?: string) => {
        const res = await axiosInstance.post(ADMIN.TOGGLE_DOCTOR_STATUS(doctorId), {
            reason,
        });
        return res.data;
    },

    togglePatientStatus: async (patientId: string, reason?: string) => {
        const res = await axiosInstance.post(ADMIN.TOGGLE_PATIENT_STATUS(patientId), {
            reason,
        });
        return res.data;
    },

    // ── Phase 3 Financial Ledger & Payout Settlement ──────────────
    getFinancialLedger: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        exportCsv?: boolean;
    }) => {
        const res = await axiosInstance.get(ADMIN.FINANCIAL_LEDGER, {
            params,
        });
        return res.data;
    },

    settlePayout: async (transactionId: string) => {
        const res = await axiosInstance.post(ADMIN.SETTLE_PAYOUT(transactionId));
        return res.data;
    },

    // ── Phase 3 Admin Notifications & System Alerts ───────────────
    getAdminNotifications: async () => {
        const res = await axiosInstance.get(ADMIN.NOTIFICATIONS);
        return res.data;
    },

    markAdminNotificationRead: async (id: string) => {
        const res = await axiosInstance.patch(ADMIN.MARK_NOTIF_READ(id));
        return res.data;
    },

    markAllAdminNotificationsRead: async () => {
        const res = await axiosInstance.patch(ADMIN.MARK_ALL_NOTIFS_READ);
        return res.data;
    },
};

export default adminService;