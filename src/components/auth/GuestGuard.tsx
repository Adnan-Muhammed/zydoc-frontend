
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../redux/hooks';

interface GuestGuardProps {
    children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isAuthChecked, user } = useAppSelector(
        (state) => state.auth || {}
    );

    useEffect(() => {
        if (!isAuthChecked) return;

        if (isAuthenticated) {
            let path = '/login';

            if (user?.role === 'patient') path = '/patient/dashboard';
            else if (user?.role === 'doctor') path = '/doctor/dashboard';
            else if (user?.role === 'admin') path = '/admin/dashboard';

            router.replace(path);
        }
    }, [isAuthenticated, isAuthChecked, user, router]);

    // ⛔ Wait until auth check completes
    if (!isAuthChecked) {
        return (
            <div className="flex h-screen items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-blue-500 text-3xl"></i>
            </div>
        );
    }

    // ⛔ While redirecting
    if (isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                <span className="text-gray-500">Redirecting...</span>
            </div>
        );
    }

    // ✅ Guest → show page
    return <>{children}</>;
}