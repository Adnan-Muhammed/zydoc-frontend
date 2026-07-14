
// src/app/doctor/(protected)/profile-update/page.tsx
import React from 'react';
import DoctorDashboardClient from './doctor-dashboardClient';

// You can add metadata here for search optimization / browser tab titles
export const metadata = {
  title: 'Complete Professional Medical Profile',
  description: 'Configure practice parameters, medical licensing, clinical specialties, and scheduling parameters.',
}; 

export default function DoctorDashboardPage() {
  return (
    <>
      {/* Mounts the interactive multi-step draft wizard safely */}
      <DoctorDashboardClient />

    </>
  ); 

}