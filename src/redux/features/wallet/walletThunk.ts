import { createAsyncThunk } from '@reduxjs/toolkit';
import { walletService, FetchWalletParams } from './walletService';

export const fetchWalletDetails = createAsyncThunk(
  'wallet/fetchWalletDetails',
  async (params: FetchWalletParams | undefined, thunkAPI) => {
    try {
      return await walletService.fetchWalletDetails(params);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch wallet details';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
