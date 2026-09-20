
// src/app/admin/(protected)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import AuthHydrator from '@/components/auth/AuthHydrator';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value || cookieStore.get('token')?.value;

  if (!accessToken) redirect('/admin/login');

  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
  let shouldRedirectToLogin = false;
  let shouldRedirectToHome = false;
  let user = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });

    if (!res.ok) {
      shouldRedirectToLogin = true;
    } else {
      const data = await res.json();
      user = data.user ?? data;
      if (!user || user.role !== 'admin') {
        shouldRedirectToHome = true;
      }
    }
  } catch (error) {
    console.error("Auth verify error:", error);
    shouldRedirectToLogin = true;
  }

  if (shouldRedirectToLogin) redirect('/admin/login');
  if (shouldRedirectToHome) redirect('/');

  // Ensure DashBoardShell is not the bottleneck
  return (
    <AuthHydrator user={user}>
      <AppShell role="admin">
        {children}
      </AppShell>
    </AuthHydrator>
  ); 
} 