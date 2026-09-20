import axiosInstance from '@/api/axiosInstance';
import { WALLET } from '@/api/endpoints';

export interface FetchWalletParams {
  page?: number;
  limit?: number;
}

export const walletService = {
  fetchWalletDetails: async (params?: FetchWalletParams) => {
    const res = await axiosInstance.get(WALLET.PATIENT_WALLET, { params });
    return res.data;
  },
};

export default walletService;
