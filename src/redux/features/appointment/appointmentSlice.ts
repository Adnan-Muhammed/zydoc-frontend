import { createSlice } from '@reduxjs/toolkit';
import { lockSlot, unlockSlot } from './appointmentThunk';

export interface AppointmentState {
    isLoading: boolean;
    error: string | null;
    isSlotLocked: boolean;
    lockedSlotDetails: any | null;
}

const initialState: AppointmentState = {
    isLoading: false,
    error: null,
    isSlotLocked: false,
    lockedSlotDetails: null,
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
            });
    },
});

export const { clearAppointmentError, resetLockState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
