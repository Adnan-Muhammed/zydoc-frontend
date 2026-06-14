// // src/components/auth/GuestGuard.tsx
// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAppSelector } from '../../redux/hooks';

// interface GuestGuardProps {
//     children: React.ReactNode;
// }

// export default function GuestGuard({ children }: GuestGuardProps) {
//     const router = useRouter();
//     const { isAuthenticated, isAuthChecked, user } = useAppSelector(
//         (state) => state.auth || {}
//     );

//     useEffect(() => {
//         if (!isAuthChecked) return;

//         if (isAuthenticated) {
//             let path = '/login';

//             if (user?.role === 'patient') path = '/patient/dashboard';
//             else if (user?.role === 'doctor') path = '/doctor/dashboard';
//             else if (user?.role === 'admin') path = '/admin/dashboard';

//             router.replace(path);
//         }
//     }, [isAuthenticated, isAuthChecked, user, router]);

//     // ⛔ Wait until auth check completes
//     if (!isAuthChecked) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <i className="fas fa-circle-notch fa-spin text-blue-500 text-3xl"></i>
//             </div>
//         );
//     }

//     // ⛔ While redirecting
//     if (isAuthenticated) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <span className="text-gray-500">Redirecting...</span>
//             </div>
//         );
//     }

//     // ✅ Guest → show page
//     return <>{children}</>;
// }


// src/components/auth/GuestGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';

export default function GuestGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const { isAuthenticated, isAuthChecked, user } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (!isAuthChecked) return;

        if (!isAuthenticated || !user?.role) return;

        const routes: Record<string, string> = {
            patient: '/patient/dashboard',
            doctor: '/doctor/dashboard',
            admin: '/admin/dashboard',
        };

        const path = routes[user.role];

        if (path) router.replace(path);
    }, [isAuthenticated, isAuthChecked, user, router]);

    // loader
    if (!isAuthChecked) {
        return (
            <div className="flex h-screen items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-blue-500 text-3xl"></i>
            </div>
        );
    }

    // redirect state
    if (isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                Redirecting...
            </div>
        );
    }

    return <>{children}</>;
}