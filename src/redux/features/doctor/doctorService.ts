
// src/redux/features/doctor/doctorService.ts

// import axiosInstance from '../../../api/axiosInstance'
import axiosInstance from '@/api/axiosInstance'

export const updateProfileAPI = async (formData: FormData) => {
    // Note: Assuming your endpoint is POST /doctor/profile-update. Adjust if your route differs.

    console.log('formdata from frontend');
    console.log(formData);
    
    
    const response = await axiosInstance.post('/doctor/profile-update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
    });
    console.log('hello2');
    
    return response.data;
};

const doctorService = { updateProfileAPI };
export default doctorService;
