// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import adminReducer from './features/admin/adminSlice';
// import doctorReducer from './features/doctor/doctorSlice';
// import patientReducer from './features/patient/patientSlice';
import { injectStore } from '../api/axiosInstance'; // Path to moved axios

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;