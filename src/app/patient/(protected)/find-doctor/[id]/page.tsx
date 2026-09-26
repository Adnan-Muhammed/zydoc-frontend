import React from 'react';
import { getDoctorById } from '@/lib/doctors';
import { notFound } from 'next/navigation';
import DoctorProfileView from '@/components/doctor-profile/DoctorProfileView';

export default async function PatientDoctorProfilePage({ params }: { params: { id: string } }) {
  const doctor = await getDoctorById(params.id);

  if (!doctor) {
    notFound();
  }

  return ( 
    <DoctorProfileView
      doctor={doctor}
      backLink="/patient/find-doctor"
      isProtected={true}
    />
  );
}
