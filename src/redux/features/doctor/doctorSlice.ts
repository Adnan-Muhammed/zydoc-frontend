

// src/redux/features/doctor/doctorSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { updateDoctorProfile } from './doctorThunk';

interface DoctorState {
    profile: any | null;
    isUpdatingProfile: boolean;
    error: string | null;
}

const initialState: DoctorState = {
    profile: null,
    isUpdatingProfile: false,
    error: null,
};

const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        clearDoctorError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateDoctorProfile.pending, (state) => {
                state.isUpdatingProfile = true;
                state.error = null;
            })
            .addCase(updateDoctorProfile.fulfilled, (state, action) => {
                state.isUpdatingProfile = false;
                state.profile = action.payload;
            })
            .addCase(updateDoctorProfile.rejected, (state, action) => {
                state.isUpdatingProfile = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearDoctorError } = doctorSlice.actions;
export default doctorSlice.reducer;
