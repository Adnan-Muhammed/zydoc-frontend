import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useSocket } from '@/hooks/useSocket';
import { addBooking, updateAppointmentStatus } from '@/redux/features/appointment/appointmentSlice';
import { fetchDoctorAppointments } from '@/redux/features/appointment/appointmentThunk';
import { getAppointmentStartTimestamp, getAppointmentEndTimestamp } from '@/utils/appointmentStatus';

export const useAppointmentTracker = () => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const { doctorAppointments } = useAppSelector((state) => state.appointment);
    const { socket } = useSocket({ userId: user?._id || user?.id, role: user?.role });

    // 1. Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewBooking = (bookingData: any) => {
            const booking = bookingData?.booking || bookingData;
            if (booking && booking._id) {
                dispatch(addBooking(booking));
            }
            if (user?.role === 'doctor') {
                dispatch(fetchDoctorAppointments());
            }
        };

        const handlePatientArrived = (payload: { appointmentId: string }) => {
            dispatch(updateAppointmentStatus({
                appointmentId: payload.appointmentId,
                status: 'Patient Joined'
            }));
        };

        const handlePatientDisconnected = (payload: { appointmentId: string }) => {
            dispatch(updateAppointmentStatus({
                appointmentId: payload.appointmentId,
                status: 'Patient Disconnected'
            }));
        };

        socket.on('new_booking', handleNewBooking);
        socket.on('patient-arrived', handlePatientArrived);
        socket.on('patient_disconnected', handlePatientDisconnected);

        // Cleanup function for memory leak prevention
        return () => {
            socket.off('new_booking', handleNewBooking);
            socket.off('patient-arrived', handlePatientArrived);
            socket.off('patient_disconnected', handlePatientDisconnected);
        };
    }, [socket, dispatch]);

    // 2. Active Slot Status Tracker (Updates status ONLY during active appointment window)
    useEffect(() => {
        if (!doctorAppointments || doctorAppointments.length === 0) return;

        const checkAppointments = () => {
            const now = Date.now();

            doctorAppointments.forEach((appt: any) => {
                // Only track online/video appointments that are currently scheduled
                const isOnline = appt.consultationType === 'online' || appt.consultationType === 'video';
                if (!isOnline) return;

                if (appt.status !== 'scheduled') return;

                const startMs = getAppointmentStartTimestamp(appt);
                const endMs = getAppointmentEndTimestamp(appt);

                // Slot is actively live: current time is >= start time and has not exceeded slot end (+ 15 min buffer)
                if (startMs > 0 && endMs > 0 && now >= startMs && now <= (endMs + 15 * 60000)) {
                    // Skip updating if doctor is already in the consultation room
                    if (pathname === `/doctor/consultation/${appt._id}`) {
                        return;
                    }

                    dispatch(updateAppointmentStatus({
                        appointmentId: appt._id,
                        status: 'Time Reached'
                    }));
                }
            });
        };

        // Check immediately, then every 10 seconds
        checkAppointments();
        const intervalId = setInterval(checkAppointments, 10000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [doctorAppointments, dispatch, pathname]);
};

