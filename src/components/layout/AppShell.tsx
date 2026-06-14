// ===============================
// FILE: src/components/layout/AppShell.tsx
// ===============================
'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
 
export default function AppShell({
    children,
    role,
}: {
    children: React.ReactNode;
    role: 'admin' | 'doctor' | 'patient';
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    // Check authorization to prevent content flash during redirect
    let isAuthorized = true;
    if (role === 'doctor' && user) {
        if (!user.isProfileCompleted) {
            if (!pathname.startsWith('/doctor/complete-profile')) {
                isAuthorized = false;
            }
        } else if (user.verificationStatus !== 'approved') {
            if (!pathname.startsWith('/doctor/dashboard')) {
                isAuthorized = false;
            }
        }
    }

    React.useEffect(() => {
        if (!isAuthorized) {
            if (!user?.isProfileCompleted) {
                router.replace('/doctor/complete-profile');
            } else {
                router.replace('/doctor/dashboard');
            }
        }
    }, [isAuthorized, user, router]);

    return (
        <div className="shell-layout">
            {/* <div className="dashboard-layout"> */}

            {/* dashboard is styled  but shell is not styled */}
            <Sidebar
                role={role}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="shell-main">
                {/* <div className="dashboard-main"> */}
                <Topbar
                    role={role}
                    onToggleSidebar={() => setSidebarOpen(true)}
                />
                <main className="shell-content min-h-[652px]">
                {/* <main className="shell-content min-h-[100vh]"> */}
                    {/* <main className="dashboard-content"> */}
                    {isAuthorized ? children : (
                        <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}