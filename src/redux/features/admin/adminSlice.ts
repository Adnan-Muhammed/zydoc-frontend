import { createSlice } from '@reduxjs/toolkit';
import { getSystemStats, getAllUsers, approveDoctor, getAuditLogs, fetchAdminTransactions, settleTransaction } from './adminThunk';
import { AdminState } from './adminTypes';

const initialState: AdminState = {
    stats: null,
    users: [],
    logs: [],
    transactions: [],
    transactionsPagination: null,
    isLoading: false,
    isSettlingPayout: false,
    error: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Management Features
            .addCase(getSystemStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(approveDoctor.fulfilled, (state, action) => {
                const updated = action.payload as { _id: string };
                state.users = state.users.map((u) => u._id === updated._id ? { ...u, ...updated } : u);
            })
            .addCase(getAuditLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload;
            })

            // Transactions & Payouts
            .addCase(fetchAdminTransactions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.transactions = action.payload.transactions || [];
                state.transactionsPagination = {
                    total: action.payload.total || 0,
                    page: action.payload.page || 1,
                    limit: action.payload.limit || 10,
                    totalPages: action.payload.totalPages || 1,
                };
            })
            .addCase(settleTransaction.pending, (state) => {
                state.isSettlingPayout = true;
                state.error = null;
            })
            .addCase(settleTransaction.fulfilled, (state, action) => {
                state.isSettlingPayout = false;
                const settledTx = action.payload.transaction || action.payload;
                if (settledTx && settledTx._id) {
                    state.transactions = state.transactions.map((tx) =>
                        tx._id === settledTx._id ? { ...tx, status: 'settled' } : tx
                    );
                }
            })
            .addCase(settleTransaction.rejected, (state, action) => {
                state.isSettlingPayout = false;
                state.error = (action.payload as string) || 'Failed to settle payout';
            })

            // Global Loading for management tasks
            .addMatcher(
                (action) => action.type.endsWith('/pending') && !action.type.includes('login') && !action.type.includes('settleTransaction'),
                (state) => { state.isLoading = true; }
            )
            .addMatcher(
                (action: { type: string }) => action.type.endsWith('/rejected') && !action.type.includes('login') && !action.type.includes('settleTransaction'),
                (state, action: { payload?: unknown }) => {
                    state.isLoading = false;
                    state.error = (action.payload as string) || 'An unexpected error occurred';
                }
            );
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;