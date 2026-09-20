// src/app/admin/(protected)/dashboard/page.tsx
import type { Metadata } from 'next';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const metadata: Metadata = {
    title: 'Executive Dashboard | Zydoc Admin',
    description: 'Enterprise overview of doctors, patients, appointments, revenue, and system operations.',
};

export default function AdminDashboardPage() {
    return <AdminDashboardClient />;
}