

// src/redux/features/doctor/doctorSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import { updateDoctorProfile, fetchDoctorProfile, fetchDoctorEarnings, updateBankDetails } from './doctorThunk';
import { BankDetails, DoctorEarningsSummary, Pagination, Transaction } from '@/types';

interface DoctorState {
    profile: any | null;
    bankDetails: BankDetails | null;
    earningsSummary: DoctorEarningsSummary | null;
    earningsTransactions: Transaction[];
    earningsPagination: Pagination | null;
    isUpdatingProfile: boolean;
    isLoadingEarnings: boolean;
    isUpdatingBankDetails: boolean;
    bankDetailsSuccess: boolean;
    error: string | null;
}

const initialState: DoctorState = {
    profile: null,
    bankDetails: null,
    earningsSummary: null,
    earningsTransactions: [],
    earningsPagination: null,
    isUpdatingProfile: false,
    isLoadingEarnings: false,
    isUpdatingBankDetails: false,
    bankDetailsSuccess: false,
    error: null,
};

const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
        clearDoctorError: (state) => {
            state.error = null;
        },
        resetBankDetailsSuccess: (state) => {
            state.bankDetailsSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Profile
            .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
                const profileData = action.payload?.profile || action.payload;
                state.profile = profileData;
                if (profileData?.bankDetails) {
                    state.bankDetails = profileData.bankDetails;
                }
            })

            // Profile Update
            .addCase(updateDoctorProfile.pending, (state) => {
                state.isUpdatingProfile = true;
                state.error = null;
            })
            .addCase(updateDoctorProfile.fulfilled, (state, action) => {
                state.isUpdatingProfile = false;
                state.profile = action.payload;
                if (action.payload?.bankDetails) {
                    state.bankDetails = action.payload.bankDetails;
                }
            })
            .addCase(updateDoctorProfile.rejected, (state, action) => {
                state.isUpdatingProfile = false;
                state.error = action.payload as string;
            })

            // Earnings
            .addCase(fetchDoctorEarnings.pending, (state) => {
                state.isLoadingEarnings = true;
                state.error = null;
            })
            .addCase(fetchDoctorEarnings.fulfilled, (state, action) => {
                state.isLoadingEarnings = false;
                state.earningsSummary = action.payload.summary || null;
                state.earningsTransactions = action.payload.transactions || [];
                state.earningsPagination = action.payload.pagination || null;
            })
            .addCase(fetchDoctorEarnings.rejected, (state, action) => {
                state.isLoadingEarnings = false;
                state.error = action.payload as string;
            })

            // Bank Details
            .addCase(updateBankDetails.pending, (state) => {
                state.isUpdatingBankDetails = true;
                state.bankDetailsSuccess = false;
                state.error = null;
            })
            .addCase(updateBankDetails.fulfilled, (state, action) => {
                state.isUpdatingBankDetails = false;
                state.bankDetailsSuccess = true;
                const newBankDetails = action.payload?.bankDetails || action.payload;
                state.bankDetails = newBankDetails;
                if (state.profile) {
                    state.profile.bankDetails = newBankDetails;
                }
            })
            .addCase(updateBankDetails.rejected, (state, action) => {
                state.isUpdatingBankDetails = false;
                state.bankDetailsSuccess = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearDoctorError, resetBankDetailsSuccess } = doctorSlice.actions;
export default doctorSlice.reducer;
