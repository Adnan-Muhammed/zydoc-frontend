// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import adminReducer from './features/admin/adminSlice';
import doctorReducer from './features/doctor/doctorSlice';
import appointmentReducer from './features/appointment/appointmentSlice';
// NOTE: patientSlice is scaffolded but patient state is handled server-side
// via Next.js layout fetches. Uncomment if client-side patient state is needed.
// import patientReducer from './features/patient/patientSlice';
import { injectStore } from '../api/axiosInstance'; // Path to moved axios

export const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        doctor: doctorReducer,
        appointment: appointmentReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;