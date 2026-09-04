"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // Adjust based on your actual toast library
import { io, Socket } from 'socket.io-client';

let globalNotificationSocket: Socket | null = null;

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
      const isBusy = pathname?.includes('/consultation/'); 
      const visitTypeStr = patientType === 'NEW' ? 'New Consultation' : patientType === 'FOLLOW_UP' ? 'Follow-up' : '';
      
      if (isBusy) {
        // Scenario B: Doctor is BUSY
        toast(`Next patient ${visitTypeStr ? `(${visitTypeStr}) ` : ''}is in the waiting room`, { 
          icon: "ℹ️",
          duration: 3500, // 3.5 seconds
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
            {visitTypeStr ? `${visitTypeStr} patient ` : 'Patient '}{patientName || "A patient"} is waiting. Click to join.
          </div>
        ), {
          duration: 7000, // 7 seconds
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
