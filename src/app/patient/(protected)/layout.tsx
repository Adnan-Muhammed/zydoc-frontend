// 'use client';

// import React from 'react';
// import DashboardLayout from '../../../components/layout/DashboardLayout';

// export default function PatientProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <DashboardLayout role="patient" title="Patient Dashboard">
//       {children}
//     </DashboardLayout>
//   );
// }



// // src/app/patient/(protected)/layout.tsx
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export default async function PatientLayout({
//   children
// }: {
//   children: React.ReactNode  // ✅ add this
// }) {
//   const cookieStore = cookies();
//   const accessToken = cookieStore.get('accessToken')?.value ?? cookieStore.get('token')?.value;

//   if (!accessToken) redirect('/login');

//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
//     headers: { Cookie: `accessToken=${accessToken}` },
//     cache: 'no-store',
//   });

//   if (!res.ok) redirect('/login');

//   const data = await res.json();
//   const user = data.user ?? data;

//   if (user.role !== 'patient') redirect('/');

//   return <>{children}</>;
// }


// // src/app/patient/(protected)/layout.tsx
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// export default async function PatientLayout({
//   children
// }: {
//   children: React.ReactNode
// }) {
//   const cookieStore = cookies();
//   const accessToken = cookieStore.get('accessToken')?.value;

//   if (!accessToken) redirect('/login');

//   let user = null;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
//       headers: { Cookie: `accessToken=${accessToken}` },
//       cache: 'no-store',
//     });

//     if (!res.ok) redirect('/login');

//     const data = await res.json();
//     console.log('👤 Auth data from /me:', JSON.stringify(data)); // check terminal

//     user = data.user ?? data;

//   } catch (err) {
//     console.error('💥 Layout error:', err);
//     redirect('/login');
//   }

//   if (!user || user.role !== 'patient') redirect('/');

//   return <>{children}</>;
// }





// src/app/patient/(protected)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthHydrator from '@/components/auth/AuthHydrator';
import AppShell from '@/components/layout/AppShell';

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
    </AuthHydrator>
  );
}