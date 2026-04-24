'use client';

import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      {children}
    </DashboardLayout>
  );
}