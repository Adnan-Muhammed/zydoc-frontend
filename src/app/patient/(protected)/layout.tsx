
// src/app/patient/(protected)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthHydrator from '@/components/auth/AuthHydrator';
import AppShell from '@/components/layout/AppShell';
import PatientBottomNav from '@/components/patient/PatientBottomNav';
import './patient-premium.css';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) redirect('/login');

  let user = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        Cookie: `accessToken=${accessToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) redirect('/login');

    const data = await res.json();
    user = data.user ?? data;
  } catch (err) {
    console.error('Patient layout error:', err);
    redirect('/login');
  }

  if (!user || user.role !== 'patient') redirect('/');

  return (
    <AuthHydrator user={user}>
      <AppShell role="patient">
        {children}
      </AppShell>
      <PatientBottomNav />
    </AuthHydrator>
  );
} 