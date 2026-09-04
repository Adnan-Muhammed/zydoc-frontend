import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useSocket } from '@/hooks/useSocket';
import { addBooking, updateAppointmentStatus } from '@/redux/features/appointment/appointmentSlice';

export const useAppointmentTracker = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    const { doctorAppointments } = useAppSelector((state) => state.appointment);
    const { socket } = useSocket({ userId: user?._id || user?.id, role: user?.role });

    // 1. Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewBooking = (bookingData: any) => {
            dispatch(addBooking(bookingData));
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

    // 2. Timer Logic (Decoupled from active consultation rooms)
    useEffect(() => {
        // If doctor is in an active video call, NEVER run auto-redirects
        const isInActiveCall = pathname?.includes('/consultation/');
        if (!doctorAppointments || doctorAppointments.length === 0) return;

        const checkAppointments = () => {
            const nextAppt = doctorAppointments[0]; // The nearest upcoming appointment due to Redux sorting
            
            // Skip if it's already in an active or terminal state
            if (
                nextAppt.status === 'Time Reached' || 
                nextAppt.status === 'Patient Joined' || 
                nextAppt.status === 'Patient Disconnected' ||
                nextAppt.status === 'completed' ||
                nextAppt.status === 'cancelled'
            ) {
                return;
            }

            // Skip if doctor is currently in the consultation room for this specific appointment
            if (pathname === `/doctor/consultation/${nextAppt._id}`) {
                return;
            }

            const parseTime = (timeStr: string) => {
                if (!timeStr) return { h: 0, m: 0 };
                const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                if (!match) return { h: 0, m: 0 };
                let [, h, m, ampm] = match;
                let hours = parseInt(h, 10);
                if (ampm) {
                    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                }
                return { h: hours, m: parseInt(m, 10) };
            };

            const apptDate = new Date(nextAppt.appointmentDate);
            const { h, m } = parseTime(nextAppt.appointmentTime);
            
            // Create a Date object for the exact appointment time
            const exactApptTime = new Date(
                apptDate.getFullYear(),
                apptDate.getMonth(),
                apptDate.getDate(),
                h, m, 0
            );

            const now = new Date();

            // If current time has reached or passed the appointment time
            if (now >= exactApptTime) {
                // Silently update Redux status so dashboard badges reflect reality
                dispatch(updateAppointmentStatus({
                    appointmentId: nextAppt._id,
                    status: 'Time Reached'
                }));

                // ONLY redirect if the doctor is NOT on an active consultation page
                if (
                    !isInActiveCall &&
                    pathname !== '/doctor/dashboard' && 
                    pathname !== '/doctor/appointments'
                ) {
                    router.push('/doctor/dashboard');
                }
            }
        };

        // Check immediately, then every 10 seconds
        checkAppointments();
        const intervalId = setInterval(checkAppointments, 10000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [doctorAppointments, dispatch, pathname, router]);
};
