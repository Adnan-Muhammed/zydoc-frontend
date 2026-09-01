// src/app/patient/(protected)/consultation/[id]/layout.tsx
//
// Same pattern as the doctor consultation layout:
// Auth-gated, full-screen — no AppShell sidebar or topbar.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthHydrator from '@/components/auth/AuthHydrator';

export default async function PatientConsultationLayout({
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
    console.error('Patient consultation layout error:', err);
    redirect('/login');
  }

  if (!user || user.role !== 'patient') redirect('/');

  // No <AppShell> — full-screen video call
  return <AuthHydrator user={user}>{children}</AuthHydrator>;
}