import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { deduceSystemOfMedicine, extractPrimaryQualifications } from '@/constants/systemsOfMedicine';
import DoctorProfileClient from './DoctorProfileClient';

export default async function DoctorProfilePage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/login');
  }
 
  let d: any = {};
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctor/profile`, {
      headers: {
        Cookie: `accessToken=${accessToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      redirect('/login');
    }

    const data = await res.json();
    d = data.profile ?? data.user ?? data;
  } catch (error) {
    console.error('Error fetching doctor profile data:', error);
    redirect('/doctor/dashboard');
  }

  const qualifications = d.qualifications ?? [];
  const primaryDegree = extractPrimaryQualifications(qualifications);
  const systemOfMedicine = d.systemOfMedicine || deduceSystemOfMedicine(qualifications);

  const enrichedDoctor = {
    ...d,
    primaryDegree,
    systemOfMedicine,
  };

  return <DoctorProfileClient doctor={enrichedDoctor} />;
}