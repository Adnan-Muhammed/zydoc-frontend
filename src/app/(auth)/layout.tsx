// src/app/(auth)/layout.tsx
// ✅ Server Component — no 'use client' needed
import AuthHeader from '@/components/layout/AuthHeader';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    // If already logged in, redirect away from login/signup pages
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const legacyToken = cookieStore.get('token')?.value;

    if (accessToken || legacyToken) {
        redirect('/'); // Server will re-render landing page and show correct dashboard link
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <AuthHeader />

                {children}
            </div>
        </>
    )
}