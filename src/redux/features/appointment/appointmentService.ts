import axiosInstance from '@/api/axiosInstance';

export const appointmentService = {
    lockSlot: async (payload: { doctorId: string; date: string; time: string; consultationType: string }) => {
        const res = await axiosInstance.post('/appointments/lock', payload);
        return res.data;
    },
    
    unlockSlot: async (payload: { doctorId: string; date: string; time: string; consultationType: string }) => {
        const res = await axiosInstance.post('/appointments/unlock', payload);
        return res.data;
    },

    createRazorpayOrder: async (payload: { appointmentId: string }) => {
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
    }
};

export default appointmentService;
