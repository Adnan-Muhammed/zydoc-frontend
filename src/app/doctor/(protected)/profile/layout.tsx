import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) redirect('/login');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        Cookie: `accessToken=${accessToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
        redirect('/login');
    }

    const data = await res.json();
    const user = data.user ?? data;

    // Server-side guard: Prevent rendering if not approved
    if (user?.verificationStatus !== 'approved') {
      redirect('/doctor/dashboard');
    }
    
  } catch (err) {
    // If fetch fails, we let the parent layout handle the hard redirect,
    // or just redirect here to be safe.
    redirect('/doctor/dashboard');
  }

  return <>{children}</>;
}
