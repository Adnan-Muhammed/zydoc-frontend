import { createSlice } from '@reduxjs/toolkit';
import { getSystemStats, getAllUsers, approveDoctor, getAuditLogs } from './adminThunk';
import { AdminState } from './adminTypes';

const initialState: AdminState = {
    stats: null,
    users: [],
    logs: [],
    isLoading: false,
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

            // Stats
            .addCase(getSystemStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getSystemStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(getSystemStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Users
            .addCase(getAllUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Approve Doctor
            .addCase(approveDoctor.fulfilled, (state, action) => {
                // update user locally (optional optimization)
                const updated = action.payload;

                state.users = state.users.map((user: any) =>
                    user._id === updated._id ? updated : user
                );
            })

            // Logs
            .addCase(getAuditLogs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAuditLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.logs = action.payload;
            })
            .addCase(getAuditLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;