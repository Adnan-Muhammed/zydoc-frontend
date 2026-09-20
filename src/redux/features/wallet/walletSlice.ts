import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchWalletDetails } from './walletThunk';

export interface WalletTransaction {
  _id: string;
  patientId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  source: 'DOCTOR_MISSED' | 'OFFLINE_DISPUTE' | 'PATIENT_CANCELLATION' | 'BOOKING_PAYMENT' | 'MANUAL_REFUND';
  description: string;
  appointmentId?: string | {
    _id: string;
    appointmentDate?: string;
    appointmentTime?: string;
    consultationType?: string;
    status?: string;
  } | null;
  createdAt: string;
}

export interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  loading: false,
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    clearWalletError: (state) => {
      state.error = null;
    },
    resetWalletState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance ?? 0;
        state.transactions = action.payload.transactions ?? [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? 1;
        state.limit = action.payload.limit ?? 10;
        state.totalPages = action.payload.totalPages ?? 1;
      })
      .addCase(fetchWalletDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load wallet details';
      });
  },
});

export const { setBalance, clearWalletError, resetWalletState } = walletSlice.actions;
export default walletSlice.reducer;
