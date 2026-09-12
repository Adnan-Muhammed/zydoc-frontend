// src/app/patient/(protected)/consultation/[id]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchAppointmentById } from '@/redux/features/appointment/appointmentThunk';
import { VideoCallRoom } from '@/modules/video-call';

interface ConsultationPageProps { 
  params: { id: string };
} 

export default function PatientConsultationPage({ params }: ConsultationPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentAppointment } = useAppSelector((state) => state.appointment);
  const [isBlockedReentry, setIsBlockedReentry] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchAppointmentById(params.id));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (currentAppointment && currentAppointment.status === 'completed') {
      setIsBlockedReentry(true);
      router.replace('/patient/appointments');
    }
  }, [currentAppointment, router]);

  // Guard against direct browser history back-navigation re-entry
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const hasJoinIntent = urlParams.get('join') === 'true';

    if (hasJoinIntent) {
      // Clear any prior exit flag so intentional re-joins work normally
      sessionStorage.removeItem(`consultation_exited_${params.id}`);
      // Remove ?join=true from URL history so browser Back button cannot bypass the guard
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // If previously exited and no join intent present, block back-navigation re-entry
    const exitTimestamp = sessionStorage.getItem(`consultation_exited_${params.id}`);
    if (exitTimestamp) {
      setIsBlockedReentry(true);
      router.replace('/patient/appointments');
    }
  }, [params.id, router]);

  if (isBlockedReentry) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-white/60">
        <p className="text-sm">Session ended. Redirecting to appointments…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-white/50"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid rgba(99,179,237,0.3)',
              borderTopColor: 'rgba(99,179,237,0.9)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Preparing consultation…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <VideoCallRoom
      appointmentId={params.id}
      userId={user._id}
      role={user.role}
    />
  );
}
