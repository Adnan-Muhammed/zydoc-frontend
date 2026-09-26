import { createSlice } from '@reduxjs/toolkit';
import {
    lockSlot,
    unlockSlot,
    createRazorpayOrder,
    verifyPayment,
    fetchPatientAppointments,
    fetchDoctorAppointments,
    fetchAllAdminAppointments,
    completeOfflineAppointment,
    markNoShowOfflineAppointment,
    cancelAppointment,
    disputeAppointment,
    fetchDisputedAppointmentsAdmin,
    refundDisputedAppointmentAdmin,
    fetchAppointmentById,
} from './appointmentThunk';

export interface AppointmentState {
    isLoading: boolean;
    error: string | null;
    isSlotLocked: boolean;
    lockedSlotDetails: any | null;
    appointments: any[];
    doctorAppointments: any[];
    adminAppointments: any[];
    disputedAppointments: any[];
    currentAppointment: any | null;
    waitingRoomPresence: Record<string, boolean>;
}

const initialState: AppointmentState = {
    isLoading: false,
    error: null,
    isSlotLocked: false,
    lockedSlotDetails: null,
    appointments: [],
    doctorAppointments: [],
    adminAppointments: [],
    disputedAppointments: [],
    currentAppointment: null,
    waitingRoomPresence: {},
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
        },
        addBooking(state, action) {
            const newBooking = action.payload?.booking || action.payload;
            if (!newBooking || !newBooking._id) return;
            // Ensure no duplicates
            if (!state.doctorAppointments.find(appt => appt._id === newBooking._id)) {
                state.doctorAppointments.push(newBooking);
            }
            // Sort chronologically
            state.doctorAppointments.sort((a, b) => {
                const dateA = new Date(a.appointmentDate).getTime();
                const dateB = new Date(b.appointmentDate).getTime();
                if (dateA !== dateB) return dateA - dateB;
                
                // Parse time strings e.g., "10:30 AM" or "14:30"
                const parseTime = (timeStr: string) => {
                    if (!timeStr) return 0;
                    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                    if (!match) return 0;
                    let [, h, m, ampm] = match;
                    let hours = parseInt(h, 10);
                    if (ampm) {
                        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                    }
                    return hours * 60 + parseInt(m, 10);
                };
                
                return parseTime(a.appointmentTime) - parseTime(b.appointmentTime);
            });
        },
        updateAppointmentStatus(state, action) {
            const { appointmentId, status } = action.payload;
            const index = state.doctorAppointments.findIndex(appt => appt._id === appointmentId);
            if (index !== -1) {
                // Mutating state directly works because Redux Toolkit uses Immer
                state.doctorAppointments[index].status = status;
            }
        },
        setPatientWaiting(state, action) {
            const { appointmentId } = action.payload;
            if (appointmentId) {
                state.waitingRoomPresence[appointmentId] = true;
            }
        },
        setPatientDisconnected(state, action) {
            const { appointmentId } = action.payload;
            if (appointmentId) {
                state.waitingRoomPresence[appointmentId] = false;
            }
        },
        hydrateWaitingRoom(state, action) {
            state.waitingRoomPresence = action.payload || {};
        },
        // Dispatched by useSocket when backend emits 'consultation_completed'.
        // Immediately marks the appointment as completed in both the patient list
        // and the doctor list so the rejoin button disables in real time (Rule 4).
        markAppointmentCompleted(state, action) {
            const { appointmentId } = action.payload;
            if (!appointmentId) return;
            // Patient appointments list
            const patientIdx = state.appointments.findIndex((a: any) => a._id === appointmentId);
            if (patientIdx !== -1) {
                state.appointments[patientIdx].status = 'completed';
            }
            // Doctor appointments list
            const doctorIdx = state.doctorAppointments.findIndex((a: any) => a._id === appointmentId);
            if (doctorIdx !== -1) {
                state.doctorAppointments[doctorIdx].status = 'completed';
            }
            // currentAppointment (used in video call room)
            if (state.currentAppointment && state.currentAppointment._id === appointmentId) {
                state.currentAppointment.status = 'completed';
            }
        },
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
            })
            .addCase(fetchAppointmentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAppointmentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentAppointment = action.payload.appointment || action.payload;
            })
            .addCase(fetchAppointmentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(completeOfflineAppointment.pending, () => {
                // Do not mutate global state.isLoading or state.error to avoid unmounting appointment views
            })
            .addCase(completeOfflineAppointment.fulfilled, (state, action) => {
                // Optimistically update the appointment status in the local list
                const completedAppt = action.payload?.appointment;
                if (completedAppt?._id) {
                    const idx = state.doctorAppointments.findIndex(a => a._id === completedAppt._id);
                    if (idx !== -1) state.doctorAppointments[idx].status = 'completed';
                }
            })
            .addCase(completeOfflineAppointment.rejected, () => {
                // Do not mutate global state.error so OTP verification error displays locally inside modal
            })
            // Mark No-Show Offline Appointment
            .addCase(markNoShowOfflineAppointment.pending, () => {
                // Do not mutate global state.isLoading or state.error
            })
            .addCase(markNoShowOfflineAppointment.fulfilled, (state, action) => {
                const updated = action.payload?.appointment;
                if (updated?._id) {
                    const idx = state.doctorAppointments.findIndex(a => a._id === updated._id);
                    if (idx !== -1) {
                        state.doctorAppointments[idx].status = 'no-show';
                    }
                    if (state.currentAppointment?._id === updated._id) {
                        state.currentAppointment.status = 'no-show';
                    }
                }
            })
            .addCase(markNoShowOfflineAppointment.rejected, () => {
                // Do not mutate global state.error
            })
            // Cancel Appointment
            .addCase(cancelAppointment.pending, () => {
                // Do not mutate global state.isLoading or state.error
            })
            .addCase(cancelAppointment.fulfilled, (state, action) => {
                const updatedAppt = action.payload?.appointment;
                if (updatedAppt?._id) {
                    const idx = state.appointments.findIndex(a => a._id === updatedAppt._id);
                    if (idx !== -1) {
                        state.appointments[idx] = { ...state.appointments[idx], ...updatedAppt };
                    }
                }
            })
            .addCase(cancelAppointment.rejected, () => {
                // Do not mutate global state.error
            })
            // Dispute Appointment
            .addCase(disputeAppointment.pending, () => {
                // Do not mutate global state.isLoading or state.error
            })
            .addCase(disputeAppointment.fulfilled, (state, action) => {
                const updatedAppt = action.payload?.appointment;
                if (updatedAppt?._id) {
                    const idx = state.appointments.findIndex(a => a._id === updatedAppt._id);
                    if (idx !== -1) {
                        state.appointments[idx] = { ...state.appointments[idx], ...updatedAppt };
                    }
                }
            })
            .addCase(disputeAppointment.rejected, () => {
                // Do not mutate global state.error
            })
            // Fetch Disputed Appointments (Admin)
            .addCase(fetchDisputedAppointmentsAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDisputedAppointmentsAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.disputedAppointments = action.payload?.appointments || action.payload || [];
            })
            .addCase(fetchDisputedAppointmentsAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Refund Disputed Appointment (Admin)
            .addCase(refundDisputedAppointmentAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refundDisputedAppointmentAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                const refundedAppt = action.payload?.appointment;
                if (refundedAppt?._id) {
                    // Update in disputed list
                    state.disputedAppointments = state.disputedAppointments.filter(a => a._id !== refundedAppt._id);
                    // Update in adminAppointments list
                    const adminIdx = state.adminAppointments.findIndex(a => a._id === refundedAppt._id);
                    if (adminIdx !== -1) {
                        state.adminAppointments[adminIdx] = { ...state.adminAppointments[adminIdx], ...refundedAppt };
                    }
                }
            })
            .addCase(refundDisputedAppointmentAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAppointmentError, resetLockState, addBooking, updateAppointmentStatus, setPatientWaiting, setPatientDisconnected, hydrateWaitingRoom, markAppointmentCompleted } = appointmentSlice.actions;
export default appointmentSlice.reducer;
