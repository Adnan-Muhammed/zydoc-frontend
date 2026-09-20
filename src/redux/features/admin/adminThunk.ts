// src/redux/features/admin/adminThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

const getErrorMessage = (error: any, defaultMsg: string) =>
    error.response?.data?.message || error.message || defaultMsg;

// Management
export const getSystemStats = createAsyncThunk(
    'admin/getSystemStats',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.getSystemStats();
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch stats'));
        }
    }
);

export const getAllUsers = createAsyncThunk(
    'admin/getAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.getAllUsers();
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch users'));
        }
    }
);

// ── Master Doctors List ──────────────────────────────────────────
export const fetchMasterDoctors = createAsyncThunk(
    'admin/fetchMasterDoctors',
    async (
        params: {
            search?: string;
            specialty?: string;
            verificationStatus?: string;
            accountStatus?: string;
            sort?: string;
            page?: number;
            limit?: number;
        } | undefined,
        { rejectWithValue }
    ) => {
        try {
            return await adminService.getDoctorsMaster(params);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch doctors list'));
        }
    }
);

// ── Master Patients List ─────────────────────────────────────────
export const fetchMasterPatients = createAsyncThunk(
    'admin/fetchMasterPatients',
    async (
        params: {
            search?: string;
            status?: string;
            gender?: string;
            sort?: string;
            page?: number;
            limit?: number;
        } | undefined,
        { rejectWithValue }
    ) => {
        try {
            return await adminService.getPatientsMaster(params);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch patients list'));
        }
    }
);

// ── Master Appointments List ─────────────────────────────────────
export const fetchMasterAppointments = createAsyncThunk(
    'admin/fetchMasterAppointments',
    async (
        params: {
            search?: string;
            status?: string;
            type?: string;
            startDate?: string;
            endDate?: string;
            sort?: string;
            page?: number;
            limit?: number;
        } | undefined,
        { rejectWithValue }
    ) => {
        try {
            return await adminService.getAppointmentsMaster(params);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch appointments list'));
        }
    }
);

// Doctor Approvals
export const fetchPendingDoctors = createAsyncThunk(
    'admin/fetchPendingDoctors',
    async (payload: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const page = payload?.page || 1;
            const limit = payload?.limit || 20;
            return await adminService.getPendingDoctors(page, limit);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch pending doctors'));
        }
    }
);

export const approveDoctor = createAsyncThunk(
    'admin/approveDoctor',
    async (
        payload: string | { doctorId: string; documentStatuses?: any },
        { rejectWithValue }
    ) => {
        try {
            const doctorId = typeof payload === 'string' ? payload : payload.doctorId;
            const documentStatuses = typeof payload === 'object' ? payload.documentStatuses : undefined;
            const res = await adminService.approveDoctor(doctorId, documentStatuses);
            return { doctorId, ...res };
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Approval failed'));
        }
    }
);

export const rejectDoctor = createAsyncThunk(
    'admin/rejectDoctor',
    async (
        { doctorId, rejectionReason, documentStatuses }: { doctorId: string; rejectionReason: string; documentStatuses?: any },
        { rejectWithValue }
    ) => {
        try {
            const res = await adminService.rejectDoctor(doctorId, rejectionReason, documentStatuses);
            return { doctorId, ...res };
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Rejection failed'));
        }
    }
);

// Commission Settings
export const fetchCommissionConfig = createAsyncThunk(
    'admin/fetchCommissionConfig',
    async (_, { rejectWithValue }) => {
        try {
            const res = await adminService.getCommissionConfig();
            return res.config || res;
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch commission configuration'));
        }
    }
);

export const updateCommissionConfig = createAsyncThunk(
    'admin/updateCommissionConfig',
    async (
        payload: {
            onlineCommissionRate?: number;
            offlineCommissionRate?: number;
            note?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const res = await adminService.updateCommissionConfig(payload);
            return res.updatedConfig || res.config || res;
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to update commission rates'));
        }
    }
);

// Refund Queue
export const fetchPendingRefunds = createAsyncThunk(
    'admin/fetchPendingRefunds',
    async (
        payload: { page?: number; limit?: number; status?: string } | undefined,
        { rejectWithValue }
    ) => {
        try {
            const page = payload?.page || 1;
            const limit = payload?.limit || 20;
            const status = payload?.status || 'PENDING';
            return await adminService.getPendingRefunds(page, limit, status);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch pending refund tickets'));
        }
    }
);

export const approveRefund = createAsyncThunk(
    'admin/approveRefund',
    async (
        payload: { refundId: string; adminNote?: string; refundAmount?: number },
        { rejectWithValue }
    ) => {
        try {
            const res = await adminService.approveRefund(payload.refundId, {
                adminNote: payload.adminNote,
                refundAmount: payload.refundAmount,
            });
            return { refundId: payload.refundId, ...res };
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to approve refund'));
        }
    }
);

export const rejectRefund = createAsyncThunk(
    'admin/rejectRefund',
    async (
        payload: { refundId: string; adminNote: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await adminService.rejectRefund(payload.refundId, payload.adminNote);
            return { refundId: payload.refundId, ...res };
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to reject refund'));
        }
    }
);

// Audit Logs & Transactions
export const getAuditLogs = createAsyncThunk(
    'admin/getAuditLogs',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.getAuditLogs();
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch logs'));
        }
    }
);

export const fetchAdminTransactions = createAsyncThunk(
    'admin/fetchTransactions',
    async (payload: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const page = payload?.page || 1;
            const limit = payload?.limit || 10;
            return await adminService.fetchTransactions(page, limit);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch transactions'));
        }
    }
);

export const settleTransaction = createAsyncThunk(
    'admin/settleTransaction',
    async (transactionId: string, { rejectWithValue }) => {
        try {
            return await adminService.settleTransaction(transactionId);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to settle transaction'));
        }
    }
);

// ── Phase 2 Analytics Thunks ──────────────────────────────────────
export const fetchAnalyticsSummary = createAsyncThunk(
    'admin/fetchAnalyticsSummary',
    async (_, { rejectWithValue }) => {
        try {
            const res = await adminService.getAnalyticsSummary();
            return res.summary || res;
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch analytics summary'));
        }
    }
);

export const fetchRevenueChart = createAsyncThunk(
    'admin/fetchRevenueChart',
    async (
        params: {
            timeframe?: string;
            days?: number;
            months?: number;
            startDate?: string;
            endDate?: string;
        } | undefined,
        { rejectWithValue }
    ) => {
        try {
            return await adminService.getRevenueChart(params);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch revenue chart data'));
        }
    }
);

export const fetchTopDoctors = createAsyncThunk(
    'admin/fetchTopDoctors',
    async (limit: number | undefined, { rejectWithValue }) => {
        try {
            const res = await adminService.getTopDoctors(limit || 5);
            return res.topDoctors || res;
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch top performing doctors'));
        }
    }
);

export const fetchClinicalAnalytics = createAsyncThunk(
    'admin/fetchClinicalAnalytics',
    async (range: '7d' | '30d' | '90d' | '1y' | undefined, { rejectWithValue }) => {
        try {
            return await adminService.getClinicalAnalytics(range || '30d');
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch clinical analytics'));
        }
    }
);

// ── Phase 2 User Management Status Toggle Thunks ─────────────────
export const toggleDoctorStatus = createAsyncThunk(
    'admin/toggleDoctorStatus',
    async (
        { doctorId, reason }: { doctorId: string; reason?: string },
        { rejectWithValue }
    ) => {
        try {
            return await adminService.toggleDoctorStatus(doctorId, reason);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to toggle doctor status'));
        }
    }
);

export const togglePatientStatus = createAsyncThunk(
    'admin/togglePatientStatus',
    async (
        { patientId, reason }: { patientId: string; reason?: string },
        { rejectWithValue }
    ) => {
        try {
            return await adminService.togglePatientStatus(patientId, reason);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to toggle patient status'));
        }
    }
);

// ── Phase 3 Financial Ledger & Payout Settlement Thunks ──────────
export const fetchFinancialLedger = createAsyncThunk(
    'admin/fetchFinancialLedger',
    async (
        params: {
            page?: number;
            limit?: number;
            status?: string;
            search?: string;
            exportCsv?: boolean;
        } | undefined,
        { rejectWithValue }
    ) => {
        try {
            return await adminService.getFinancialLedger(params);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch financial ledger'));
        }
    }
);

export const settleAdminPayout = createAsyncThunk(
    'admin/settleAdminPayout',
    async (transactionId: string, { rejectWithValue }) => {
        try {
            return await adminService.settlePayout(transactionId);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to settle doctor payout'));
        }
    }
);

// ── Phase 3 Admin Notifications Thunks ───────────────────────────
export const fetchAdminNotifications = createAsyncThunk(
    'admin/fetchAdminNotifications',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.getAdminNotifications();
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch admin notifications'));
        }
    }
);

export const markAdminNotifRead = createAsyncThunk(
    'admin/markAdminNotifRead',
    async (id: string, { rejectWithValue }) => {
        try {
            await adminService.markAdminNotificationRead(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to mark notification as read'));
        }
    }
);

export const markAllAdminNotifsRead = createAsyncThunk(
    'admin/markAllAdminNotifsRead',
    async (_, { rejectWithValue }) => {
        try {
            await adminService.markAllAdminNotificationsRead();
            return true;
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Failed to mark all notifications as read'));
        }
    }
);