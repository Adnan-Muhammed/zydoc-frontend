

// src/redux/features/doctor/doctorThunk.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import doctorService from './doctorService';

export const updateDoctorProfile = createAsyncThunk(
    'doctor/updateProfile',
    async (formData: FormData, { rejectWithValue }) => {
        try {

            console.log('hai');
            
            return await doctorService.updateProfileAPI(formData);
        } catch (error: any) {
            // return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        
        const data = error.response?.data;
            return rejectWithValue({
                message: data?.message || 'Failed to update profile',
                field: data?.field || null,
            });
        }
    }
);
