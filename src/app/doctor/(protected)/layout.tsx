'use client';

import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';



// export function DoctorProtectedLayout(
// { children }) {

export default function DoctorProtectedLayout(
  { children, }: { children: React.ReactNode; }) {

  return (
    <DashboardLayout role="doctor" title="Doctor Dashboard">
      {children}
    </DashboardLayout>
  );
}


















