import { createAsyncThunk } from '@reduxjs/toolkit';
import adminService from './adminService';

// Get Stats
export const getSystemStats = createAsyncThunk(
    'admin/getSystemStats',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.getSystemStats();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

// Get Users
export const getAllUsers = createAsyncThunk(
    'admin/getAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.getAllUsers();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Approve Doctor
export const approveDoctor = createAsyncThunk(
    'admin/approveDoctor',
    async (doctorId: string, { rejectWithValue }) => {
        try {
            return await adminService.approveDoctor(doctorId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Approval failed');
        }
    }
);

// Get Logs
export const getAuditLogs = createAsyncThunk(
    'admin/getAuditLogs',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.getAuditLogs();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs');
        }
    }
);