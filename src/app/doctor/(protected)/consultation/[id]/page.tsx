// src/app/doctor/(protected)/consultation/[id]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchAppointmentById } from '@/redux/features/appointment/appointmentThunk';
import { VideoCallRoom } from '@/modules/video-call';

interface ConsultationPageProps {
  params: { id: string };
}
 
export default function DoctorConsultationPage({ params }: ConsultationPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentAppointment } = useAppSelector((state) => state.appointment);
  const [isBlockedReentry, setIsBlockedReentry] = useState(false);
  const [isInPersonConsultation, setIsInPersonConsultation] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchAppointmentById(params.id));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (currentAppointment) {
      if (currentAppointment.status === 'completed') {
        setIsBlockedReentry(true);
        router.replace('/doctor/dashboard');
        return;
      }

      const consultType = (currentAppointment.consultationType || '').toLowerCase();
      if (consultType === 'offline' || consultType === 'physical') {
        setIsInPersonConsultation(true);
        const timer = setTimeout(() => {
          router.replace('/doctor/appointments');
        }, 3000);
        return () => clearTimeout(timer);
      }
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
      router.replace('/doctor/dashboard');
    }
  }, [params.id, router]);

  if (isInPersonConsultation) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
            <i className="fas fa-hospital-user"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">In-Person Consultation</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            This appointment is scheduled for an in-person clinic visit and does not support online video calls. 
            Patient verification and consultation take place at the clinic.
          </p>
          <button
            onClick={() => router.replace('/doctor/appointments')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <i className="fas fa-arrow-left text-xs"></i> Return to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (isBlockedReentry) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-white/60">
        <p className="text-sm">Consultation completed. Redirecting to dashboard…</p>
      </div>
    );
  }

  // Guard: this should never render without a user because the layout enforces
  // auth via SSR, but defend client-side just in case hydration lags.
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
