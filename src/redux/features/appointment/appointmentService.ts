import axiosInstance from '@/api/axiosInstance';

export const appointmentService = {
    lockSlot: async (payload: { doctorId: string; date: string; time: string; consultationType: string }) => {
        const res = await axiosInstance.post('/appointments/lock', payload);
        return res.data;
    },
    
    unlockSlot: async (payload: { doctorId: string; date: string; time: string; consultationType: string }) => {
        const res = await axiosInstance.post('/appointments/unlock', payload);
        return res.data;
    }
};

export default appointmentService;
