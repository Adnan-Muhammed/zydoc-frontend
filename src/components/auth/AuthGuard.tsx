// AuthGuard.tsx - PROTECT ROUTES
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '../../redux/hooks'; // redux

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard component protects routes that should only be accessible 
 * to authenticated users. It redirects to home if the user is not logged in.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isAuthChecked, user } = useAppSelector((state) => state.auth || {}); // isLoading is replaced with isAuthChecked
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait until auth check is finished
        if (!isAuthChecked) return;

        if (!isAuthenticated) {
            console.log('[AuthGuard] Not authenticated → redirect');
            router.replace('/login');
        } else if (user) {
            // Role-based route validation
            const isAdminPath = pathname.startsWith('/admin');
            const isDoctorPath = pathname.startsWith('/doctor');
            const isPatientPath = pathname.startsWith('/patient');

            if (isAdminPath && user.role !== 'admin') {
                router.replace(`/${user.role}/dashboard`);
            } else if (isDoctorPath && user.role !== 'doctor') {
                router.replace(`/${user.role}/dashboard`);
            } else if (isPatientPath && user.role !== 'patient') {
                router.replace(`/${user.role}/dashboard`);
            } else {
                setIsChecking(false);
            }
        }
    }, [isAuthenticated, isAuthChecked, user, router, pathname]);




    // Show nothing or a loader while checking auth status to prevent content flashing
    if (!isAuthChecked || isChecking) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Verifying session...</div>
            </div>
        );
    }



    // ✅ Authenticated → show content
    return <>{children}</>;
}