

// src/app/doctor/(protected)/layout.tsx
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthHydrator from '@/components/auth/AuthHydrator';
import AppShell from '@/components/layout/AppShell';

export default async function DoctorLayout({
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
    console.error('Doctor layout error:', err);
    redirect('/login');
  }

  if (!user || user.role !== 'doctor') redirect('/');



  // Routing guards moved to Client Components because x-invoke-path is unreliable in layouts.
  return (
    <AuthHydrator user={user}>
      <AppShell role="doctor">
        {children}
      </AppShell>
    </AuthHydrator>
  );
}  