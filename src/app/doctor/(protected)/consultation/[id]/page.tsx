// src/app/doctor/(protected)/consultation/[id]/page.tsx
//
// The actual consultation page for doctors.
// - `params.id` is the MongoDB appointment _id, used as the signaling room key.
// - The user's _id and role are read from Redux (hydrated from SSR by the layout).
// - All WebRTC logic lives inside VideoCallRoom → useWebRTC.

'use client';

import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { VideoCallRoom } from '@/modules/video-call';

interface ConsultationPageProps {
  params: { id: string };
}

export default function DoctorConsultationPage({ params }: ConsultationPageProps) {
  const { user } = useAppSelector((state) => state.auth);

  // Guard: this should never render without a user because the layout enforces
  // auth via SSR, but defend client-side just in case hydration lags.
  if (!user) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Inter, sans-serif',
        }}
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
