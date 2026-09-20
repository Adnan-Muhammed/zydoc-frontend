import axiosInstance from '@/api/axiosInstance';

export const appointmentService = {
    lockSlot: async (payload: {
        doctorId: string;
        date: string;
        time: string;
        consultationType: string;
        patientType: string;
        notes?: string;
        /** ISO 8601 UTC — authoritative slot start, forwarded from API slot data */
        startTimeUTC?: string;
        /** ISO 8601 UTC — authoritative slot end, forwarded from API slot data */
        endTimeUTC?: string;
        patientTimezone?: string;
        doctorTimezone?: string;
    }) => {
        const res = await axiosInstance.post('/appointments/lock', payload);
        return res.data;
    },
    
    unlockSlot: async (payload: { doctorId: string; date: string; time: string; consultationType: string }) => {
        const res = await axiosInstance.post('/appointments/unlock', payload);
        return res.data;
    },

    createRazorpayOrder: async (payload: { appointmentId: string; useWallet?: boolean }) => {
        const res = await axiosInstance.post('/appointments/create-razorpay-order', payload);
        return res.data;
    },

    verifyPayment: async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; appointmentId?: string }) => {
        const res = await axiosInstance.post('/appointments/verify-payment', payload);
        return res.data;
    },

    getPatientAppointments: async () => {
        const res = await axiosInstance.get('/appointments/patient');
        return res.data;
    },

    getDoctorAppointments: async () => {
        const res = await axiosInstance.get('/appointments/doctor');
        return res.data;
    },

    getAllAdminAppointments: async () => {
        const res = await axiosInstance.get('/appointments/admin/all');
        return res.data;
    },

    getAppointmentById: async (id: string) => {
        const res = await axiosInstance.get(`/appointments/${id}`);
        return res.data;
    },

    completeOfflineAppointment: async (payload: { appointmentId: string; otp: string }) => {
        const res = await axiosInstance.post(`/appointments/${payload.appointmentId}/complete-offline`, { otp: payload.otp });
        return res.data;
    },

    markNoShowOfflineAppointment: async (payload: { appointmentId: string }) => {
        const res = await axiosInstance.post(`/appointments/${payload.appointmentId}/mark-no-show`);
        return res.data;
    },

    cancelAppointment: async (payload: { appointmentId: string; reason?: string }) => {
        const res = await axiosInstance.post(`/appointments/${payload.appointmentId}/cancel`, { reason: payload.reason });
        return res.data;
    },

    disputeAppointment: async (payload: { appointmentId: string; reason: string; proofUrl?: string }) => {
        const res = await axiosInstance.post(`/appointments/${payload.appointmentId}/dispute`, { reason: payload.reason, proofUrl: payload.proofUrl });
        return res.data;
    },

    getDisputedAppointmentsAdmin: async () => {
        const res = await axiosInstance.get('/admin/appointments/disputed');
        return res.data;
    },

    refundDisputedAppointmentAdmin: async (payload: { appointmentId: string; notes?: string }) => {
        const res = await axiosInstance.post(`/admin/appointments/${payload.appointmentId}/refund`, { notes: payload.notes });
        return res.data;
    },
};


export default appointmentService;
