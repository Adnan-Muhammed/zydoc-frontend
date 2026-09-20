// src/redux/features/admin/adminSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import {
    getSystemStats,
    getAllUsers,
    fetchPendingDoctors,
    approveDoctor,
    rejectDoctor,
    fetchMasterDoctors,
    fetchMasterPatients,
    fetchMasterAppointments,
    fetchCommissionConfig,
    updateCommissionConfig,
    fetchPendingRefunds,
    approveRefund,
    rejectRefund,
    getAuditLogs,
    fetchAdminTransactions,
    settleTransaction,
    fetchAnalyticsSummary,
    fetchRevenueChart,
    fetchTopDoctors,
    fetchClinicalAnalytics,
    toggleDoctorStatus,
    togglePatientStatus,
    fetchFinancialLedger,
    settleAdminPayout,
    fetchAdminNotifications,
    markAdminNotifRead,
    markAllAdminNotifsRead,
} from './adminThunk';
import { AdminState } from './adminTypes';

const initialState: AdminState = {
    stats: null,
    users: [],
    
    // Doctor Approvals
    pendingDoctors: [],
    pendingDoctorsTotal: 0,
    pendingDoctorsLoading: false,
    actionLoading: false,

    // Master Doctors
    doctorsList: [],
    doctorsTotal: 0,
    doctorsLoading: false,
    doctorsPage: 1,
    doctorsLimit: 20,

    // Master Patients
    patientsList: [],
    patientsTotal: 0,
    patientsLoading: false,
    patientsPage: 1,
    patientsLimit: 20,

    // Master Appointments
    appointmentsList: [],
    appointmentsTotal: 0,
    appointmentsLoading: false,
    appointmentsPage: 1,
    appointmentsLimit: 20,

    // Commission Configuration
    commissionConfig: null,
    commissionLoading: false,
    commissionSaving: false,

    // Refund Queue
    pendingRefunds: [],
    pendingRefundsTotal: 0,
    pendingRefundsLoading: false,
    refundActionLoading: false,

    // Analytics Dashboard (Phase 2)
    analyticsSummary: null,
    analyticsSummaryLoading: false,
    revenueChart: null,
    revenueChartLoading: false,
    topDoctors: [],
    topDoctorsLoading: false,
    clinicalAnalytics: null,
    clinicalAnalyticsLoading: false,

    // User Management Status Toggle (Phase 2)
    userToggleLoading: false,

    // Financial Ledger (Phase 3)
    ledgerTransactions: [],
    ledgerTotal: 0,
    ledgerPage: 1,
    ledgerLimit: 20,
    ledgerTotalPages: 1,
    ledgerSummary: null,
    ledgerLoading: false,
    settlePayoutLoading: false,

    // Admin Notifications (Phase 3)
    adminNotifications: [],
    adminUnreadCount: 0,
    adminNotificationsLoading: false,

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
        },
    },
    extraReducers: (builder) => {
        builder
            // System Stats
            .addCase(getSystemStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })

            // Users
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })

            // ── Master Doctors ──────────────────────────────────────────
            .addCase(fetchMasterDoctors.pending, (state) => {
                state.doctorsLoading = true;
                state.error = null;
            })
            .addCase(fetchMasterDoctors.fulfilled, (state, action) => {
                state.doctorsLoading = false;
                state.doctorsList = action.payload.doctors || [];
                state.doctorsTotal = action.payload.total || 0;
                state.doctorsPage = action.payload.page || 1;
            })
            .addCase(fetchMasterDoctors.rejected, (state, action) => {
                state.doctorsLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch doctors list';
            })

            // ── Master Patients ─────────────────────────────────────────
            .addCase(fetchMasterPatients.pending, (state) => {
                state.patientsLoading = true;
                state.error = null;
            })
            .addCase(fetchMasterPatients.fulfilled, (state, action) => {
                state.patientsLoading = false;
                state.patientsList = action.payload.patients || [];
                state.patientsTotal = action.payload.total || 0;
                state.patientsPage = action.payload.page || 1;
            })
            .addCase(fetchMasterPatients.rejected, (state, action) => {
                state.patientsLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch patients list';
            })

            // ── Master Appointments ─────────────────────────────────────
            .addCase(fetchMasterAppointments.pending, (state) => {
                state.appointmentsLoading = true;
                state.error = null;
            })
            .addCase(fetchMasterAppointments.fulfilled, (state, action) => {
                state.appointmentsLoading = false;
                state.appointmentsList = action.payload.appointments || [];
                state.appointmentsTotal = action.payload.total || 0;
                state.appointmentsPage = action.payload.page || 1;
            })
            .addCase(fetchMasterAppointments.rejected, (state, action) => {
                state.appointmentsLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch appointments list';
            })

            // Pending Doctors Queue
            .addCase(fetchPendingDoctors.pending, (state) => {
                state.pendingDoctorsLoading = true;
                state.error = null;
            })
            .addCase(fetchPendingDoctors.fulfilled, (state, action) => {
                state.pendingDoctorsLoading = false;
                state.pendingDoctors = action.payload.doctors || [];
                state.pendingDoctorsTotal = action.payload.total || 0;
            })
            .addCase(fetchPendingDoctors.rejected, (state, action) => {
                state.pendingDoctorsLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch pending doctors';
            })

            // Doctor Approval
            .addCase(approveDoctor.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(approveDoctor.fulfilled, (state, action) => {
                state.actionLoading = false;
                const id = action.payload.doctorId;
                state.pendingDoctors = state.pendingDoctors.filter(
                    (d) => d.userId !== id && d.profile?._id !== id
                );
                state.pendingDoctorsTotal = Math.max(0, state.pendingDoctorsTotal - 1);
            })
            .addCase(approveDoctor.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = (action.payload as string) || 'Failed to approve doctor';
            })

            // Doctor Rejection
            .addCase(rejectDoctor.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(rejectDoctor.fulfilled, (state, action) => {
                state.actionLoading = false;
                const id = action.payload.doctorId;
                state.pendingDoctors = state.pendingDoctors.filter(
                    (d) => d.userId !== id && d.profile?._id !== id
                );
                state.pendingDoctorsTotal = Math.max(0, state.pendingDoctorsTotal - 1);
            })
            .addCase(rejectDoctor.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = (action.payload as string) || 'Failed to reject doctor';
            })

            // Commission Configuration
            .addCase(fetchCommissionConfig.pending, (state) => {
                state.commissionLoading = true;
                state.error = null;
            })
            .addCase(fetchCommissionConfig.fulfilled, (state, action) => {
                state.commissionLoading = false;
                state.commissionConfig = action.payload;
            })
            .addCase(fetchCommissionConfig.rejected, (state, action) => {
                state.commissionLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch commission config';
            })
            .addCase(updateCommissionConfig.pending, (state) => {
                state.commissionSaving = true;
                state.error = null;
            })
            .addCase(updateCommissionConfig.fulfilled, (state, action) => {
                state.commissionSaving = false;
                state.commissionConfig = action.payload;
            })
            .addCase(updateCommissionConfig.rejected, (state, action) => {
                state.commissionSaving = false;
                state.error = (action.payload as string) || 'Failed to update commission config';
            })

            // Refund Queue
            .addCase(fetchPendingRefunds.pending, (state) => {
                state.pendingRefundsLoading = true;
                state.error = null;
            })
            .addCase(fetchPendingRefunds.fulfilled, (state, action) => {
                state.pendingRefundsLoading = false;
                state.pendingRefunds = action.payload.tickets || [];
                state.pendingRefundsTotal = action.payload.total || 0;
            })
            .addCase(fetchPendingRefunds.rejected, (state, action) => {
                state.pendingRefundsLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch pending refund tickets';
            })
            .addCase(approveRefund.pending, (state) => {
                state.refundActionLoading = true;
                state.error = null;
            })
            .addCase(approveRefund.fulfilled, (state, action) => {
                state.refundActionLoading = false;
                const id = action.payload.refundId;
                state.pendingRefunds = state.pendingRefunds.filter((t) => t._id !== id);
                state.pendingRefundsTotal = Math.max(0, state.pendingRefundsTotal - 1);
            })
            .addCase(approveRefund.rejected, (state, action) => {
                state.refundActionLoading = false;
                state.error = (action.payload as string) || 'Failed to approve refund';
            })
            .addCase(rejectRefund.pending, (state) => {
                state.refundActionLoading = true;
                state.error = null;
            })
            .addCase(rejectRefund.fulfilled, (state, action) => {
                state.refundActionLoading = false;
                const id = action.payload.refundId;
                state.pendingRefunds = state.pendingRefunds.filter((t) => t._id !== id);
                state.pendingRefundsTotal = Math.max(0, state.pendingRefundsTotal - 1);
            })
            .addCase(rejectRefund.rejected, (state, action) => {
                state.refundActionLoading = false;
                state.error = (action.payload as string) || 'Failed to reject refund';
            })

            // Audit Logs
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

            // ── Phase 2 Analytics Dashboard ─────────────────────────────
            .addCase(fetchAnalyticsSummary.pending, (state) => {
                state.analyticsSummaryLoading = true;
                state.error = null;
            })
            .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
                state.analyticsSummaryLoading = false;
                state.analyticsSummary = action.payload;
            })
            .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
                state.analyticsSummaryLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch analytics summary';
            })

            .addCase(fetchRevenueChart.pending, (state) => {
                state.revenueChartLoading = true;
                state.error = null;
            })
            .addCase(fetchRevenueChart.fulfilled, (state, action) => {
                state.revenueChartLoading = false;
                state.revenueChart = action.payload;
            })
            .addCase(fetchRevenueChart.rejected, (state, action) => {
                state.revenueChartLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch revenue chart';
            })

            .addCase(fetchTopDoctors.pending, (state) => {
                state.topDoctorsLoading = true;
                state.error = null;
            })
            .addCase(fetchTopDoctors.fulfilled, (state, action) => {
                state.topDoctorsLoading = false;
                state.topDoctors = action.payload;
            })
            .addCase(fetchTopDoctors.rejected, (state, action) => {
                state.topDoctorsLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch top doctors';
            })

            .addCase(fetchClinicalAnalytics.pending, (state) => {
                state.clinicalAnalyticsLoading = true;
                state.error = null;
            })
            .addCase(fetchClinicalAnalytics.fulfilled, (state, action) => {
                state.clinicalAnalyticsLoading = false;
                state.clinicalAnalytics = action.payload;
            })
            .addCase(fetchClinicalAnalytics.rejected, (state, action) => {
                state.clinicalAnalyticsLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch clinical analytics';
            })

            // ── Phase 2 Advanced User Management Status Toggles ─────────
            .addCase(toggleDoctorStatus.pending, (state) => {
                state.userToggleLoading = true;
                state.error = null;
            })
            .addCase(toggleDoctorStatus.fulfilled, (state, action) => {
                state.userToggleLoading = false;
                const { userId, newStatus } = action.payload;
                if (userId && newStatus) {
                    state.doctorsList = state.doctorsList.map((doc) =>
                        doc.userId === userId ? { ...doc, accountStatus: newStatus } : doc
                    );
                }
            })
            .addCase(toggleDoctorStatus.rejected, (state, action) => {
                state.userToggleLoading = false;
                state.error = (action.payload as string) || 'Failed to toggle doctor status';
            })

            .addCase(togglePatientStatus.pending, (state) => {
                state.userToggleLoading = true;
                state.error = null;
            })
            .addCase(togglePatientStatus.fulfilled, (state, action) => {
                state.userToggleLoading = false;
                const { userId, newStatus } = action.payload;
                if (userId && newStatus) {
                    state.patientsList = state.patientsList.map((pat) =>
                        pat.userId === userId ? { ...pat, accountStatus: newStatus } : pat
                    );
                }
            })
            .addCase(togglePatientStatus.rejected, (state, action) => {
                state.userToggleLoading = false;
                state.error = (action.payload as string) || 'Failed to toggle patient status';
            })

            // ── Phase 3 Financial Ledger & Settlements ──────────────────
            .addCase(fetchFinancialLedger.pending, (state) => {
                state.ledgerLoading = true;
                state.error = null;
            })
            .addCase(fetchFinancialLedger.fulfilled, (state, action) => {
                state.ledgerLoading = false;
                state.ledgerTransactions = action.payload.transactions || [];
                state.ledgerTotal = action.payload.total || 0;
                state.ledgerPage = action.payload.page || 1;
                state.ledgerLimit = action.payload.limit || 20;
                state.ledgerTotalPages = action.payload.totalPages || 1;
                state.ledgerSummary = action.payload.summary || null;
            })
            .addCase(fetchFinancialLedger.rejected, (state, action) => {
                state.ledgerLoading = false;
                state.error = (action.payload as string) || 'Failed to fetch financial ledger';
            })

            .addCase(settleAdminPayout.pending, (state) => {
                state.settlePayoutLoading = true;
            })
            .addCase(settleAdminPayout.fulfilled, (state, action) => {
                state.settlePayoutLoading = false;
                const settledTx = action.payload.transaction || action.payload;
                if (settledTx && settledTx._id) {
                    state.ledgerTransactions = state.ledgerTransactions.map((tx) =>
                        tx._id === settledTx._id
                            ? {
                                  ...tx,
                                  status: 'settled',
                                  settledAt: settledTx.settledAt || new Date().toISOString(),
                              }
                            : tx
                    );
                    if (state.ledgerSummary) {
                        state.ledgerSummary.settledCount = (state.ledgerSummary.settledCount || 0) + 1;
                        state.ledgerSummary.pendingCount = Math.max(
                            0,
                            (state.ledgerSummary.pendingCount || 1) - 1
                        );
                    }
                }
            })
            .addCase(settleAdminPayout.rejected, (state, action) => {
                state.settlePayoutLoading = false;
                state.error = (action.payload as string) || 'Failed to settle doctor payout';
            })

            // ── Phase 3 Admin Notifications & System Alerts ─────────────
            .addCase(fetchAdminNotifications.pending, (state) => {
                state.adminNotificationsLoading = true;
            })
            .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
                state.adminNotificationsLoading = false;
                state.adminNotifications = action.payload.notifications || [];
                state.adminUnreadCount = action.payload.unreadCount ?? action.payload.notifications?.filter((n: any) => !n.isRead)?.length ?? 0;
            })
            .addCase(fetchAdminNotifications.rejected, (state) => {
                state.adminNotificationsLoading = false;
            })

            .addCase(markAdminNotifRead.fulfilled, (state, action) => {
                const notifId = action.payload;
                state.adminNotifications = state.adminNotifications.map((n) =>
                    n._id === notifId ? { ...n, isRead: true } : n
                );
                state.adminUnreadCount = Math.max(0, state.adminUnreadCount - 1);
            })

            .addCase(markAllAdminNotifsRead.fulfilled, (state) => {
                state.adminNotifications = state.adminNotifications.map((n) => ({
                    ...n,
                    isRead: true,
                }));
                state.adminUnreadCount = 0;
            })

            // Global Loading for general management tasks
            .addMatcher(
                (action) =>
                    action.type.endsWith('/pending') &&
                    !action.type.includes('login') &&
                    !action.type.includes('settleTransaction') &&
                    !action.type.includes('PendingDoctors') &&
                    !action.type.includes('approveDoctor') &&
                    !action.type.includes('rejectDoctor') &&
                    !action.type.includes('Commission') &&
                    !action.type.includes('Refund') &&
                    !action.type.includes('fetchMaster') &&
                    !action.type.includes('fetchAnalytics') &&
                    !action.type.includes('fetchRevenue') &&
                    !action.type.includes('fetchTopDoctors') &&
                    !action.type.includes('toggleDoctorStatus') &&
                    !action.type.includes('togglePatientStatus') &&
                    !action.type.includes('FinancialLedger') &&
                    !action.type.includes('settleAdminPayout') &&
                    !action.type.includes('AdminNotif') &&
                    !action.type.includes('ClinicalAnalytics'),
                (state) => {
                    state.isLoading = true;
                }
            )
            .addMatcher(
                (action: { type: string }) =>
                    action.type.endsWith('/rejected') &&
                    !action.type.includes('login') &&
                    !action.type.includes('settleTransaction') &&
                    !action.type.includes('PendingDoctors') &&
                    !action.type.includes('approveDoctor') &&
                    !action.type.includes('rejectDoctor') &&
                    !action.type.includes('Commission') &&
                    !action.type.includes('Refund') &&
                    !action.type.includes('fetchMaster') &&
                    !action.type.includes('FinancialLedger') &&
                    !action.type.includes('settleAdminPayout') &&
                    !action.type.includes('AdminNotif') &&
                    !action.type.includes('ClinicalAnalytics'),
                (state, action: { payload?: unknown }) => {
                    state.isLoading = false;
                    state.error = (action.payload as string) || 'An unexpected error occurred';
                }
            );
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;