import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateAppointmentStatus, hydrateWaitingRoom } from '@/redux/features/appointment/appointmentSlice';
import { getAppointmentStartTimestamp, getAppointmentEndTimestamp } from '@/utils/appointmentStatus';

export const useAppointmentTracker = () => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { doctorAppointments } = useAppSelector((state) => state.appointment);

    // 1. Hydrate waiting room from sessionStorage on mount
    useEffect(() => {
        const stored = sessionStorage.getItem('waitingRoomPresence');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                dispatch(hydrateWaitingRoom(parsed));
            } catch (e) {
                console.error("Failed to parse waitingRoomPresence from sessionStorage", e);
            }
        }
    }, [dispatch]);

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

                // Slot is actively live: current time is >= start time and has not exceeded slot end (+ 10 min buffer)
                if (startMs > 0 && endMs > 0 && now >= startMs && now <= (endMs + 10 * 60000)) {
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
