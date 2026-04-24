'use client';

import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function PatientProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="patient" title="Patient Dashboard">
      {children}
    </DashboardLayout>
  );
}