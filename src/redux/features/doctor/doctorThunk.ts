// src/redux/features/doctor/doctorThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import doctorService from './doctorService';
import { BankDetails } from '@/types';

export const updateDoctorProfile = createAsyncThunk(
    'doctor/updateProfile',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            return await doctorService.updateProfileAPI(formData);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; field?: string } } };
            const data = err.response?.data;
            return rejectWithValue({
                message: data?.message || 'Failed to update profile',
                field: data?.field || null,
            });
        }
    }
);

export const fetchDoctorEarnings = createAsyncThunk(
    'doctor/fetchEarnings',
    async (payload: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const page = payload?.page || 1;
            const limit = payload?.limit || 10;
            return await doctorService.fetchEarnings(page, limit);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch earnings';
            return rejectWithValue(message);
        }
    }
);

export const fetchDoctorProfile = createAsyncThunk(
    'doctor/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            return await doctorService.getProfile();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch profile';
            return rejectWithValue(message);
        }
    }
);

export const updateBankDetails = createAsyncThunk(
    'doctor/updateBankDetails',
    async (bankDetails: BankDetails, { rejectWithValue }) => {
        try {
            return await doctorService.updateBankDetails(bankDetails);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update bank details';
            return rejectWithValue(message);
        }
    }
);
