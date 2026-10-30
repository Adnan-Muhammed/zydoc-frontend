// src/app/admin/(protected)/doctors/page.tsx
import type { Metadata } from 'next';
import AdminDoctorsClient from './AdminDoctorsClient';

export const metadata: Metadata = {
  title: 'Doctors Master Directory | Zydocare Health Admin',
  description: 'Manage, verify, audit credentials, and monitor healthcare professionals registered across Zydocare Health.',
};

export default function AdminDoctorsPage() {
  return <AdminDoctorsClient />;
} 