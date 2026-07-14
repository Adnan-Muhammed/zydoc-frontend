

// src/app/patient/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
 
export default async function PatientLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) redirect('/login');

  let user = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      {
        method: 'GET',
        headers: {
          Cookie: `accessToken=${accessToken}`,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    );

    console.log('res status:', res.status);

    if (!res.ok) redirect('/login');

    const data = await res.json();

    console.log('data:', JSON.stringify(data));

    user = data.user ?? null;

  } catch (err) {
    console.error('Layout fetch error:', err);
    redirect('/login');
  }

  if (!user || user.role !== 'patient') redirect('/');

  return <>{children}</>;
} 