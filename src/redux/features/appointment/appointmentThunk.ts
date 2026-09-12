import { createAsyncThunk } from '@reduxjs/toolkit';
import appointmentService from './appointmentService';

export const lockSlot = createAsyncThunk(
    'appointment/lockSlot',
    async (payload: { 
        doctorId: string; 
        date: string; 
        time: string; 
        consultationType: string; 
        patientType: string; 
        notes?: string;
        startTimeUTC?: string;
        endTimeUTC?: string;
        patientTimezone?: string;
        doctorTimezone?: string;
    }, thunkAPI) => {
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
            if (error.response?.data?.code) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchPatientAppointments = createAsyncThunk(
    'appointment/fetchPatientAppointments',
    async (_, thunkAPI) => {
        try {
            return await appointmentService.getPatientAppointments();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchDoctorAppointments = createAsyncThunk(
    'appointment/fetchDoctorAppointments',
    async (_, thunkAPI) => {
        try {
            return await appointmentService.getDoctorAppointments();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchAllAdminAppointments = createAsyncThunk(
    'appointment/fetchAllAdminAppointments',
    async (_, thunkAPI) => {
        try {
            return await appointmentService.getAllAdminAppointments();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchAppointmentById = createAsyncThunk(
    'appointment/fetchAppointmentById',
    async (id: string, thunkAPI) => {
        try {
            return await appointmentService.getAppointmentById(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const completeOfflineAppointment = createAsyncThunk(
    'appointment/completeOfflineAppointment',
    async (payload: { appointmentId: string; otp: string }, thunkAPI) => {
        try {
            return await appointmentService.completeOfflineAppointment(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const markNoShowOfflineAppointment = createAsyncThunk(
    'appointment/markNoShowOfflineAppointment',
    async (payload: { appointmentId: string }, thunkAPI) => {
        try {
            return await appointmentService.markNoShowOfflineAppointment(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const cancelAppointment = createAsyncThunk(
    'appointment/cancelAppointment',
    async (payload: { appointmentId: string; reason?: string }, thunkAPI) => {
        try {
            return await appointmentService.cancelAppointment(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const disputeAppointment = createAsyncThunk(
    'appointment/disputeAppointment',
    async (payload: { appointmentId: string; reason: string; proofUrl?: string }, thunkAPI) => {
        try {
            return await appointmentService.disputeAppointment(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchDisputedAppointmentsAdmin = createAsyncThunk(
    'appointment/fetchDisputedAppointmentsAdmin',
    async (_, thunkAPI) => {
        try {
            return await appointmentService.getDisputedAppointmentsAdmin();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const refundDisputedAppointmentAdmin = createAsyncThunk(
    'appointment/refundDisputedAppointmentAdmin',
    async (payload: { appointmentId: string; notes?: string }, thunkAPI) => {
        try {
            return await appointmentService.refundDisputedAppointmentAdmin(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

