// src/app/doctor/(protected)/consultation/[id]/layout.tsx
//
// This layout intentionally does NOT wrap children in <AppShell>.
// The video call room must be rendered full-screen (100vw × 100vh)
// without any sidebar or topbar chrome.
//
// Auth protection is still enforced via the SSR cookie check — the same
// pattern used by the parent doctor layout.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthHydrator from '@/components/auth/AuthHydrator';

export default async function ConsultationLayout({
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
    console.error('Doctor consultation layout error:', err);
    redirect('/login');
  }

  if (!user || user.role !== 'doctor') redirect('/');

  // No <AppShell> — full-screen video call
  return <AuthHydrator user={user}>{children}</AuthHydrator>;
}
