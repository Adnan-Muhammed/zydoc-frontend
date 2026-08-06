
// // src/app/admin/(protected)/layout.tsx
// 'use client';

// import React from 'react';
// import DashboardLayout from '../../../components/layout/DashboardLayout';

// export default function AdminProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <DashboardLayout role="admin" title="Admin Dashboard">
//       {children}
//     </DashboardLayout>
//   ); 
// }



// // src/app/admin/(protected)/layout.tsx
// // ✅ Convert from 'use client' to Server Component for proper server-side auth guard
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import DashboardLayout from '../../../components/layout/DashboardLayout';

// export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
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

//   if (user.role !== 'admin') {
//     redirect('/');
//   }

//   return (
//     <DashboardLayout role="admin" title="Admin Dashboard">
//       {children}
//     </DashboardLayout>
//   );
// }


// src/app/admin/(protected)/layout.tsx
// ✅ UPDATED — fixes 3 bugs:
//   1. redirect('/login') → redirect('/admin/login')
//   2. Cookie forwarding now sends ALL cookies, not just accessToken
//   3. Uses server-only API_URL env var instead of NEXT_PUBLIC_API_URL


// // src/app/admin/(protected)/layout.tsx

// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import DashboardLayout from '@/components/layout/DashboardLayout';

// export default async function AdminProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const cookieStore = cookies();

//   // Check for token presence first (fast-path, no network call)
//   const accessToken =
//     cookieStore.get('accessToken')?.value ??
//     cookieStore.get('token')?.value;

//   if (!accessToken) redirect('/admin/login');

//   // Forward ALL cookies so backend session / JWT middleware works correctly
//   const cookieHeader = cookieStore
//     .getAll()
//     .map((c) => `${c.name}=${c.value}`)
//     .join('; ');

//   let user: { role: string } | null = null;

//   try {
//     const res = await fetch(`${process.env.API_URL}/api/auth/me`, {
//       headers: { Cookie: cookieHeader },
//       cache: 'no-store',
//     });

//     if (!res.ok) redirect('/admin/login');

//     const data = await res.json();
//     user = data.user ?? data;
//   } catch {
//     // Network error or JSON parse failure → back to login
//     redirect('/admin/login');
//   }

//   // Authenticated but wrong role → home
//   if (!user || user.role !== 'admin') {
//     redirect('/');
//   }

//   return (
//     <DashboardLayout role="admin" title="Admin Dashboard">
//       {children}
//     </DashboardLayout>
//   );

// }






// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import DashboardLayout from '@/components/layout/DashboardLayout';

// export default async function AdminProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const cookieStore = cookies();
//   const accessToken = cookieStore.get('accessToken')?.value ?? cookieStore.get('token')?.value;

//   // 1. Fast check
//   if (!accessToken) {
//     redirect('/admin/login');
//   }

//   const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
//   let user = null;
//   let shouldRedirectToLogin = false;
//   let shouldRedirectToHome = false;

//   try {

//     // NEXT_PUBLIC_API_URL=http://localhost:5001
//     // const res = await fetch(`${process.env.API_URL}/api/auth/me`, {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
//       headers: { Cookie: cookieHeader },
//       cache: 'no-store',
//     });

//     if (!res.ok) {
//       shouldRedirectToLogin = true;
//     } else {
//       const data = await res.json();
//       user = data.user ?? data;
//       if (!user || user.role !== 'admin') {
//         shouldRedirectToHome = true;
//       }
//     }
//   } catch (error) {
//     console.error("Auth Fetch Error:", error);
//     shouldRedirectToLogin = true;
//   }

//   // 2. Perform redirects OUTSIDE of try/catch
//   if (shouldRedirectToLogin) redirect('/admin/login');
//   if (shouldRedirectToHome) redirect('/');


//   console.log('adddminn   protected    layoutttt');

//   return (
//     <DashboardLayout role="admin" title="Admin Dashboard">
//       {children}
//     </DashboardLayout>
//   );
// }
















// // src/app/admin/(protected)/layout.tsx
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// // 
// export default async function AdminProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const cookieStore = cookies();
//   const accessToken = cookieStore.get('accessToken')?.value || cookieStore.get('token')?.value;

//   // 1. Initial check
//   if (!accessToken) redirect('/admin/login');

//   const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
//   let shouldRedirectToLogin = false;
//   let shouldRedirectToHome = false;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
//       headers: { Cookie: cookieHeader },
//       cache: 'no-store',
//     });

//     if (!res.ok) {
//       shouldRedirectToLogin = true;
//     } else {
//       const data = await res.json();
//       const user = data.user ?? data;
//       if (!user || user.role !== 'admin') {
//         shouldRedirectToHome = true;
//       }
//     }
//   } catch (error) {
//     console.error("Auth verify error:", error);
//     shouldRedirectToLogin = true;
//   }

//   // 2. Redirects must be outside try/catch to avoid Next.js internal errors
//   if (shouldRedirectToLogin) redirect('/admin/login');
//   if (shouldRedirectToHome) redirect('/');


//   console.log('/src/app/admin/(protected)/layout.tsx is loading');

//   return (
//     <DashboardLayout role="admin" title="Zydoc Admin Portal">
//       {children}
//     </DashboardLayout>
//   );
// }














// // src/app/admin/(protected)/layout.tsx
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import DashBoardShell from '@/components/layout/DashboardShell';

// export default async function AdminProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const cookieStore = cookies();
//   const accessToken = cookieStore.get('accessToken')?.value || cookieStore.get('token')?.value;

//   if (!accessToken) redirect('/admin/login');

//   const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
//   let shouldRedirectToLogin = false;
//   let shouldRedirectToHome = false;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
//       headers: { Cookie: cookieHeader },
//       cache: 'no-store',
//     });

//     if (!res.ok) {
//       shouldRedirectToLogin = true;
//     } else {
//       const data = await res.json();
//       const user = data.user ?? data;
//       if (!user || user.role !== 'admin') {
//         shouldRedirectToHome = true;
//       }
//     }
//   } catch (error) {
//     console.error("Auth verify error:", error);
//     shouldRedirectToLogin = true;
//   }

//   if (shouldRedirectToLogin) redirect('/admin/login');
//   if (shouldRedirectToHome) redirect('/');

//   // Ensure DashBoardShell is not the bottleneck
//   return (
//     <DashBoardShell role="admin">


//       {children}
//     </DashBoardShell>
//   );
// }








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
      const user = data.user ?? data;
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