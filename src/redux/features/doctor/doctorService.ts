
// src/redux/features/doctor/doctorService.ts
import axiosInstance from '@/api/axiosInstance';
import { DOCTORS } from '@/api/endpoints';
import { BankDetails } from '@/types';

export const updateProfileAPI = async (formData: FormData) => {
    const response = await axiosInstance.post('/doctor/profile-update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
    });
    return response.data;
};

export const fetchEarningsAPI = async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(DOCTORS.EARNINGS, {
        params: { page, limit },
        withCredentials: true,
    });
    return response.data;
};

export const updateBankDetailsAPI = async (bankDetails: BankDetails) => {
    const response = await axiosInstance.patch(DOCTORS.BANK_DETAILS, bankDetails, {
        withCredentials: true,
    });
    return response.data;
};

export const getProfileAPI = async () => {
    const response = await axiosInstance.get('/doctor/profile', {
        withCredentials: true,
    });
    return response.data;
};

const doctorService = {
    updateProfileAPI,
    getProfile: getProfileAPI,
    fetchEarnings: fetchEarningsAPI,
    updateBankDetails: updateBankDetailsAPI,
};

export default doctorService;
