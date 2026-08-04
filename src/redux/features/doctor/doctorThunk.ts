// src/redux/features/doctor/doctorThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import doctorService from './doctorService';

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
