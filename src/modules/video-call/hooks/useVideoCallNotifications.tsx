"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // Adjust based on your actual toast library
import { io, Socket } from 'socket.io-client';

let globalNotificationSocket: Socket | null = null;
const recentlyNotifiedArrivals = new Map<string, number>();
const ARRIVAL_DEDUPE_WINDOW_MS = 30_000;

export function useVideoCallNotifications(userId: string | undefined, role: string | undefined) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!userId || role?.toLowerCase() !== 'doctor') return;

    if (!globalNotificationSocket) {
      globalNotificationSocket = io(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
        { withCredentials: true }
      ); 
      
      globalNotificationSocket.on('connect', () => {
        globalNotificationSocket?.emit("register", { userId, role });
      });
    }

    const handlePatientArrived = (payload: any) => {
      const { appointmentId, patientName, patientType } = payload || {};
      // Waiting-room and room-join events can refer to the same arrival.
      if (appointmentId) {
        const now = Date.now();
        const lastNotifiedAt = recentlyNotifiedArrivals.get(String(appointmentId));
        if (lastNotifiedAt && now - lastNotifiedAt < ARRIVAL_DEDUPE_WINDOW_MS) return;
        recentlyNotifiedArrivals.set(String(appointmentId), now);
        recentlyNotifiedArrivals.forEach((timestamp, id) => {
          if (now - timestamp >= ARRIVAL_DEDUPE_WINDOW_MS) recentlyNotifiedArrivals.delete(id);
        });
      }
      const isBusy = pathname?.includes('/consultation/'); 
      const visitTypeStr = patientType === 'NEW' ? 'New Consultation' : patientType === 'FOLLOW_UP' ? 'Follow-up' : '';

      // Check if this arrival is for the active ongoing consultation (Current patient Rejoin)
      const currentConsultationId = pathname?.match(/\/consultation\/([^/?]+)/)?.[1];
      const isCurrentAppointment = Boolean(currentConsultationId && appointmentId && currentConsultationId === appointmentId);

      if (isBusy) {
        if (isCurrentAppointment) {
          // Current patient in this active session has rejoined — do NOT show "Next patient"
          toast.success(`${patientName || "Patient"} has rejoined the consultation.`, {
            id: `patient-rejoined-${appointmentId}`,
            icon: "👋",
            duration: 4000,
          });
          return;
        }

        // Scenario B: Doctor is BUSY in another consultation and a DIFFERENT patient (next slot) arrived early
        toast(`Next patient ${patientName ? `${patientName} ` : ''}${visitTypeStr ? `(${visitTypeStr}) ` : ''}is waiting. You have a 20–30s buffer to wrap up and switch rooms.`, { 
          icon: "⏳",
          duration: 5000,
        });
      } else {
        // Scenario A: Doctor is FREE
        try {
          const audio = new Audio('/sounds/notification.mp3'); 
          audio.play().catch(() => {
            console.warn("Autoplay policy blocked notification sound");
          });
        } catch (e) {
          console.error("Audio playback error", e);
        }
        
        toast((t) => (
          <div 
            onClick={() => {
              toast.dismiss(t.id);
              if (appointmentId) {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem(`consultation_exited_${appointmentId}`);
                }
                router.push(`/doctor/consultation/${appointmentId}?join=true`);
              }
            }}
            className="cursor-pointer font-medium"
          >
            {visitTypeStr ? `${visitTypeStr} patient ` : 'Patient '}{patientName || "A patient"} has entered the room (20–30s buffer). Click to join now.
          </div>
        ), {
          duration: 8000,
          position: "top-center",
          style: { cursor: 'pointer' },
          icon: "🔔",
        });
      }
    };

    globalNotificationSocket.on('patient-arrived', handlePatientArrived);

    return () => {
      globalNotificationSocket?.off('patient-arrived', handlePatientArrived);
    };
  }, [userId, role, pathname, router]);
}





