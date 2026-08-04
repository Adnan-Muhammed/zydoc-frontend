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

            // Global Loading for management tasks
            .addMatcher(
                (action) => action.type.endsWith('/pending') && !action.type.includes('login'),
                (state) => { state.isLoading = true; }
            )
            .addMatcher(
                (action: { type: string }) => action.type.endsWith('/rejected') && !action.type.includes('login'),
                (state, action: { payload?: unknown }) => {
                    state.isLoading = false;
                    state.error = (action.payload as string) || 'An unexpected error occurred';
                }
            );
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;