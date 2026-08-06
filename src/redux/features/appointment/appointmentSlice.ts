import { createSlice } from '@reduxjs/toolkit';
import { lockSlot, unlockSlot, createRazorpayOrder, verifyPayment, fetchPatientAppointments, fetchDoctorAppointments, fetchAllAdminAppointments } from './appointmentThunk';

export interface AppointmentState {
    isLoading: boolean;
    error: string | null;
    isSlotLocked: boolean;
    lockedSlotDetails: any | null;
    appointments: any[];
    doctorAppointments: any[];
    adminAppointments: any[];
}

const initialState: AppointmentState = {
    isLoading: false,
    error: null,
    isSlotLocked: false,
    lockedSlotDetails: null,
    appointments: [],
    doctorAppointments: [],
    adminAppointments: [],
};

const appointmentSlice = createSlice({
    name: 'appointment',
    initialState,
    reducers: {
        clearAppointmentError(state) {
            state.error = null;
        },
        resetLockState(state) {
            state.isSlotLocked = false;
            state.lockedSlotDetails = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(lockSlot.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(lockSlot.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSlotLocked = true;
                state.lockedSlotDetails = action.payload;
            })
            .addCase(lockSlot.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(unlockSlot.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(unlockSlot.fulfilled, (state) => {
                state.isLoading = false;
                state.isSlotLocked = false;
                state.lockedSlotDetails = null;
            })
            .addCase(unlockSlot.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createRazorpayOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createRazorpayOrder.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createRazorpayOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(verifyPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state) => {
                state.isLoading = false;
                state.isSlotLocked = false;
                state.lockedSlotDetails = null;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPatientAppointments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.appointments = action.payload.appointments || action.payload || [];
            })
            .addCase(fetchPatientAppointments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchDoctorAppointments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.doctorAppointments = action.payload.appointments || action.payload || [];
            })
            .addCase(fetchDoctorAppointments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchAllAdminAppointments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllAdminAppointments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.adminAppointments = action.payload.appointments || action.payload || [];
            })
            .addCase(fetchAllAdminAppointments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAppointmentError, resetLockState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
