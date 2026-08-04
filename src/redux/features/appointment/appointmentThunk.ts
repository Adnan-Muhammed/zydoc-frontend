import { createAsyncThunk } from '@reduxjs/toolkit';
import appointmentService from './appointmentService';

export const lockSlot = createAsyncThunk(
    'appointment/lockSlot',
    async (payload: { doctorId: string; date: string; time: string; consultationType: string }, thunkAPI) => {
        try {
            return await appointmentService.lockSlot(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const unlockSlot = createAsyncThunk(
    'appointment/unlockSlot',
    async (payload: { doctorId: string; date: string; time: string; consultationType: string }, thunkAPI) => {
        try {
            return await appointmentService.unlockSlot(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);
