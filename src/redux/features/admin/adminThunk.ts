import { createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

const getErrorMessage = (error: any, defaultMsg: string) =>
    error.response?.data?.message || defaultMsg;

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

export const approveDoctor = createAsyncThunk(
    'admin/approveDoctor',
    async (doctorId: string, { rejectWithValue }) => {
        try {
            return await adminService.approveDoctor(doctorId);
        } catch (error: any) {
            return rejectWithValue(getErrorMessage(error, 'Approval failed'));
        }
    }
);

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