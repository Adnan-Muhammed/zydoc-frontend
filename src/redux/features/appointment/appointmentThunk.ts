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

export const createRazorpayOrder = createAsyncThunk(
    'appointment/createRazorpayOrder',
    async (payload: { appointmentId: string }, thunkAPI) => {
        try {
            return await appointmentService.createRazorpayOrder(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const verifyPayment = createAsyncThunk(
    'appointment/verifyPayment',
    async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; appointmentId?: string }, thunkAPI) => {
        try {
            return await appointmentService.verifyPayment(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);
